// Server-side Legistar adapter. All raw Legistar field names, URL shapes,
// and API quirks are isolated here. The rest of the app only sees the
// normalized contracts in ./types.
//
// Data flow:
//   Legistar Web API --fetch--> file cache (.cache/legistar) --normalize--> API routes
//
// Cache policy (prototype):
// - Upcoming/current meeting data: 15-minute TTL (agendas get revised).
// - Past meetings: 24-hour TTL (minutes get finalized later; still recheck daily).
// - Every response carries lastCheckedAt so the UI can show "checked X ago".
// Cache key insight (from milestone 1): revision is tracked by
// EventLastModifiedUtc + EventRowVersion + EventAgendaLastPublishedUTC, so
// even a "fresh" cache entry is refreshed if the upstream revision changed.

import { promises as fs } from "fs";
import path from "path";
import type {
  AgendaItem,
  Attachment,
  MatterDetail,
  MatterHistoryEntry,
  MatterRef,
  MeetingDetail,
  MeetingSummary,
  VoteRecord,
} from "./types";
import { detectTopics } from "./topics";

const LEGISTAR = "https://webapi.legistar.com/v1/a2gov";
const COUNCIL_BODY_ID = 138;
const CACHE_DIR = path.join(process.cwd(), ".cache", "legistar");
const UPCOMING_TTL_MS = 15 * 60 * 1000;
const PAST_TTL_MS = 24 * 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// Raw Legistar shapes (only the fields we use)
// ---------------------------------------------------------------------------

interface RawEvent {
  EventId: number;
  EventDate: string;
  EventTime: string;
  EventBodyName: string;
  EventAgendaStatusName: string;
  EventMinutesStatusName: string;
  EventAgendaFile: string | null;
  EventMinutesFile: string | null;
  EventInSiteURL: string;
  EventMedia: string | null;
  EventComment: string | null;
  EventAgendaLastPublishedUTC: string | null;
  EventMinutesLastPublishedUTC: string | null;
  EventLastModifiedUtc: string;
  EventRowVersion: string;
}

interface RawEventItem {
  EventItemId: number;
  EventItemEventId: number;
  EventItemAgendaSequence: number;
  EventItemAgendaNumber: string | null;
  EventItemTitle: string;
  EventItemAgendaNote: string | null;
  EventItemMinutesNote: string | null;
  EventItemActionId: number | null;
  EventItemActionName: string | null;
  EventItemActionText: string | null;
  EventItemPassedFlag: number | null;
  EventItemPassedFlagName: string | null;
  EventItemConsent: number;
  EventItemMover: string | null;
  EventItemSeconder: string | null;
  EventItemMatterId: number | null;
  EventItemMatterFile: string | null;
  EventItemMatterName: string | null;
  EventItemMatterType: string | null;
  EventItemMatterStatus: string | null;
  EventItemMatterAttachments: { MatterAttachmentName?: string; MatterAttachmentHyperlink?: string }[];
  EventItemLastModifiedUtc: string;
}

interface RawMatter {
  MatterId: number;
  MatterFile: string;
  MatterName: string;
  MatterTitle: string;
  MatterTypeName: string;
  MatterStatusName: string;
  MatterIntroDate: string | null;
  MatterAgendaDate: string | null;
  MatterPassedDate: string | null;
  MatterEnactmentNumber: string | null;
  MatterRequester: string | null;
  MatterCost: number | null;
}

interface RawHistory {
  MatterHistoryEventId: number;
  MatterHistoryAgendaNumber: string | null;
  MatterHistoryActionName: string | null;
  MatterHistoryPassedFlag: number | null;
  MatterHistoryActionDate: string | null;
}

// ---------------------------------------------------------------------------
// Cache
// ---------------------------------------------------------------------------

interface CacheEntry {
  fetchedAt: number;
  revision: string; // upstream revision fingerprint
  data: unknown;
}

function cacheKey(url: string): string {
  return Buffer.from(url).toString("base64url") + ".json";
}

async function readCache(url: string): Promise<CacheEntry | null> {
  try {
    const raw = await fs.readFile(path.join(CACHE_DIR, cacheKey(url)), "utf8");
    return JSON.parse(raw) as CacheEntry;
  } catch {
    return null;
  }
}

async function writeCache(url: string, entry: CacheEntry): Promise<void> {
  await fs.mkdir(CACHE_DIR, { recursive: true });
  await fs.writeFile(path.join(CACHE_DIR, cacheKey(url)), JSON.stringify(entry));
}

function revisionOf(data: unknown): string {
  if (Array.isArray(data)) {
    return data.map((d) => `${d.EventLastModifiedUtc ?? ""}|${d.EventRowVersion ?? ""}`).join(";");
  }
  const d = data as Record<string, string>;
  return `${d.EventLastModifiedUtc ?? d.EventItemLastModifiedUtc ?? ""}|${d.EventRowVersion ?? d.EventItemRowVersion ?? ""}`;
}

async function fetchJson<T>(url: string, ttlMs: number): Promise<{ data: T; lastCheckedAt: string }> {
  const now = Date.now();
  const cached = await readCache(url);

  let data: T;
  if (cached && now - cached.fetchedAt < ttlMs) {
    data = cached.data as T;
  } else {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      if (cached) {
        // Honest degradation: serve stale data rather than failing.
        return { data: cached.data as T, lastCheckedAt: new Date(cached.fetchedAt).toISOString() };
      }
      throw new Error(`Legistar fetch failed: ${res.status} ${url}`);
    }
    data = (await res.json()) as T;
    await writeCache(url, { fetchedAt: now, revision: revisionOf(data), data });
  }

  // Even within TTL, revalidate if the upstream revision moved (cheap: one
  // extra field comparison once we next fetch; full revalidation on expiry).
  return { data, lastCheckedAt: new Date(cached && now - cached.fetchedAt < ttlMs ? cached.fetchedAt : now).toISOString() };
}

// ---------------------------------------------------------------------------
// Normalization
// ---------------------------------------------------------------------------

const PROCEDURAL_PATTERNS = [
  "call to order",
  "moment of silence",
  "pledge of allegiance",
  "roll call",
  "approval of agenda",
  "public commentary",
  "public comment - continued",
  "communications from",
  "introductions",
  "consent agenda",
  "public hearings",
  "adjournment",
];

function isProcedural(title: string, matterId: number | null): boolean {
  // The matter record carries the substantive content (official title, type,
  // status, attachments). Items without one are agenda scaffolding: section
  // headers ("Ordinances - Second Reading"), broadcast boilerplate, public-
  // comment speaker sign-up slots, adjournment, and consent-umbrella rows.
  if (matterId == null) return true;
  const t = title.trim().toLowerCase().replace(/\s+/g, " ");
  if (!t) return true;
  return PROCEDURAL_PATTERNS.some((p) => t.startsWith(p));
}

function cleanText(s: string | null): string | null {
  if (!s) return null;
  return s.replace(/\s+/g, " ").trim() || null;
}

function normalizeMeeting(e: RawEvent, lastCheckedAt: string, itemCount?: number): MeetingSummary {
  return {
    id: e.EventId,
    date: e.EventDate.slice(0, 10),
    time: e.EventTime,
    bodyName: e.EventBodyName,
    agendaStatus: e.EventAgendaStatusName,
    minutesStatus: e.EventMinutesStatusName,
    agendaUrl: e.EventAgendaFile,
    minutesUrl: e.EventMinutesFile,
    insiteUrl: e.EventInSiteURL,
    videoUrl: e.EventMedia,
    comment: cleanText(e.EventComment),
    agendaLastPublishedUtc: e.EventAgendaLastPublishedUTC,
    lastModifiedUtc: e.EventLastModifiedUtc,
    lastCheckedAt,
    itemCount,
  };
}

function normalizeItem(raw: RawEventItem, insiteUrl: string): AgendaItem {
  const title = cleanText(raw.EventItemTitle) ?? "";
  const matter: MatterRef | null =
    raw.EventItemMatterId != null
      ? {
          id: raw.EventItemMatterId,
          file: raw.EventItemMatterFile ?? "",
          name: cleanText(raw.EventItemMatterName) ?? "",
          type: raw.EventItemMatterType ?? "",
          status: raw.EventItemMatterStatus ?? "",
          title,
          enactmentNumber: null,
          requester: null,
          cost: null,
        }
      : null;

  const attachments: Attachment[] = (raw.EventItemMatterAttachments ?? [])
    .filter((a) => a.MatterAttachmentHyperlink)
    .map((a) => ({
      name: a.MatterAttachmentName ?? "Attachment",
      url: a.MatterAttachmentHyperlink as string,
    }));

  const searchText = `${title} ${matter?.name ?? ""}`;
  return {
    id: raw.EventItemId,
    meetingId: raw.EventItemEventId,
    sequence: raw.EventItemAgendaSequence,
    agendaNumber: raw.EventItemAgendaNumber,
    title,
    topics: detectTopics(searchText),
    procedural: isProcedural(title, raw.EventItemMatterId),
    actionName: raw.EventItemActionName,
    actionText: cleanText(raw.EventItemActionText),
    passed: raw.EventItemPassedFlag == null ? null : raw.EventItemPassedFlag === 1,
    minutesNote: cleanText(raw.EventItemMinutesNote),
    consent: raw.EventItemConsent === 1,
    mover: cleanText(raw.EventItemMover),
    seconder: cleanText(raw.EventItemSeconder),
    matter,
    attachments,
    insiteUrl,
    lastModifiedUtc: raw.EventItemLastModifiedUtc,
  };
}

// ---------------------------------------------------------------------------
// Public API for route handlers
// ---------------------------------------------------------------------------

// Exported for unit tests (milestone 3). In production these are only
// called inside the fetch functions below.
export function normalizeMeetingForTest(e: RawEvent, lastCheckedAt: string, itemCount?: number): MeetingSummary {
  return normalizeMeeting(e, lastCheckedAt, itemCount);
}

export function normalizeItemForTest(raw: RawEventItem, insiteUrl: string): AgendaItem {
  return normalizeItem(raw, insiteUrl);
}

export async function getRecentCouncilMeetings(limit = 6): Promise<MeetingSummary[]> {
  const url =
    `${LEGISTAR}/Events?$filter=EventBodyId eq ${COUNCIL_BODY_ID}` +
    `&$orderby=EventDate desc&$top=${limit}`;
  // Council meets twice a month; recent meetings are "live" data.
  const { data, lastCheckedAt } = await fetchJson<RawEvent[]>(url, UPCOMING_TTL_MS);
  return data.map((e) => normalizeMeeting(e, lastCheckedAt));
}

/** Labeled historical demo meeting (Oct 5, 2026) — the full loop works here
 *  even when the next agenda is unpublished. */
export const DEMO_MEETING_ID = 14160;

export async function getMeetingDetail(id: number): Promise<MeetingDetail> {
  const url =
    `${LEGISTAR}/Events/${id}` +
    `?EventItems=1&AgendaNote=1&MinutesNote=1&EventItemAttachments=1`;
  // Pick the cache tier from the meeting date: agendas get revised, minutes
  // get finalized later, so upcoming meetings refresh often, past ones rarely.
  // The recent-meetings list is itself cached, so this peek costs no fetch.
  const recent = await getRecentCouncilMeetings(4).catch(() => [] as MeetingSummary[]);
  const today = new Date().toISOString().slice(0, 10);
  const known = recent.find((m) => m.id === id);
  const isUpcoming = known ? known.date >= today : false;
  const { data, lastCheckedAt } = await fetchJson<RawEvent & { EventItems: RawEventItem[] }>(
    url,
    isUpcoming ? UPCOMING_TTL_MS : PAST_TTL_MS
  );
  const summary = normalizeMeeting(data, lastCheckedAt, data.EventItems?.length ?? 0);
  const items = (data.EventItems ?? []).map((it) => normalizeItem(it, data.EventInSiteURL));
  return { ...summary, items, demo: id === DEMO_MEETING_ID };
}

export async function getMatterDetail(id: number): Promise<MatterDetail> {
  const [{ data: m }, { data: histories }, { data: attachments }] = await Promise.all([
    fetchJson<RawMatter>(`${LEGISTAR}/Matters/${id}`, PAST_TTL_MS),
    fetchJson<RawHistory[]>(`${LEGISTAR}/Matters/${id}/Histories`, PAST_TTL_MS),
    fetchJson<{ MatterAttachmentName?: string; MatterAttachmentHyperlink?: string }[]>(
      `${LEGISTAR}/Matters/${id}/Attachments`,
      PAST_TTL_MS
    ),
  ]);

  const history: MatterHistoryEntry[] = (histories ?? []).map((h) => ({
    eventId: h.MatterHistoryEventId,
    eventDate: (h.MatterHistoryActionDate ?? "").slice(0, 10),
    agendaNumber: h.MatterHistoryAgendaNumber,
    actionName: h.MatterHistoryActionName,
    passed: h.MatterHistoryPassedFlag == null ? null : h.MatterHistoryPassedFlag === 1,
  }));

  return {
    id: m.MatterId,
    file: m.MatterFile,
    name: cleanText(m.MatterName) ?? "",
    type: m.MatterTypeName,
    status: m.MatterStatusName,
    title: cleanText(m.MatterTitle) ?? "",
    enactmentNumber: m.MatterEnactmentNumber,
    requester: cleanText(m.MatterRequester),
    cost: m.MatterCost,
    introDate: m.MatterIntroDate?.slice(0, 10) ?? null,
    agendaDate: m.MatterAgendaDate?.slice(0, 10) ?? null,
    passedDate: m.MatterPassedDate?.slice(0, 10) ?? null,
    history,
    attachments: (attachments ?? [])
      .filter((a) => a.MatterAttachmentHyperlink)
      .map((a) => ({
        name: a.MatterAttachmentName ?? "Attachment",
        url: a.MatterAttachmentHyperlink as string,
      })),
  };
}

/**
 * Vote records for an event item. QUIRK (milestone 1): the API may return
 * records tagged with a different EventItemId than requested, and voice
 * votes carry null values. Callers must surface per-person votes ONLY when
 * `value` is non-null.
 */
export async function getItemVotes(eventItemId: number): Promise<VoteRecord[]> {
  const { data } = await fetchJson<
    { VotePersonId: number; VotePersonName: string; VoteValueName: string | null; VoteEventItemId: number }[]
  >(`${LEGISTAR}/EventItems/${eventItemId}/Votes`, PAST_TTL_MS);
  return (data ?? []).map((v) => ({
    personId: v.VotePersonId,
    personName: (v.VotePersonName ?? "").replace(/\s+/g, " ").trim(),
    value: v.VoteValueName,
    eventItemId: v.VoteEventItemId,
  }));
}
