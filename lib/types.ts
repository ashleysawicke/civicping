// Shared CivicPing data contracts.
// These are the normalized records the server adapter produces and the
// browser-facing API returns. Raw Legistar field names never leave the server.

export interface MeetingSummary {
  id: number;
  date: string; // ISO date, e.g. "2026-10-19"
  time: string; // "7:00 PM"
  bodyName: string;
  agendaStatus: string; // "Final" | "Final-revised" | ...
  minutesStatus: string; // "Draft" | "Final" | ...
  agendaUrl: string | null;
  minutesUrl: string | null;
  insiteUrl: string;
  videoUrl: string | null;
  comment: string | null; // speaking-signup instructions, when present
  agendaLastPublishedUtc: string | null;
  lastModifiedUtc: string;
  lastCheckedAt: string; // when CivicPing last verified this record
  itemCount?: number;
}

export interface MatterRef {
  id: number;
  file: string; // e.g. "26-1379"
  name: string;
  type: string; // "Resolution" | "Ordinance" | ...
  status: string; // "Passed" | "Second Reading" | ...
  title: string;
  enactmentNumber: string | null; // e.g. "R-26-387"
  requester: string | null;
  cost: number | null;
}

export interface Attachment {
  name: string;
  url: string;
}

export interface MatchReason {
  kind: "topic" | "ward" | "keyword";
  label: string; // human-readable, e.g. 'Topic: Housing'
}

export interface AgendaItem {
  id: number;
  meetingId: number;
  sequence: number;
  agendaNumber: string | null; // "CA-12", "PH-1", ...
  title: string;
  topics: string[]; // detected topic slugs
  procedural: boolean; // true for call-to-order, roll call, etc.
  actionName: string | null; // "Approved", "Adopted on Second Reading", ...
  actionText: string | null;
  passed: boolean | null;
  minutesNote: string | null;
  consent: boolean;
  mover: string | null;
  seconder: string | null;
  matter: MatterRef | null;
  attachments: Attachment[];
  insiteUrl: string; // link to the official item page
  lastModifiedUtc: string;
}

export interface MeetingDetail extends MeetingSummary {
  items: AgendaItem[];
  demo: boolean; // true for the labeled historical demo meeting
}

export interface VoteRecord {
  personId: number;
  personName: string;
  value: string | null; // null for voice votes — never invent a value
  eventItemId: number; // as returned by the API (may differ from the queried item)
}

export interface MatterDetail extends MatterRef {
  introDate: string | null;
  agendaDate: string | null;
  passedDate: string | null;
  history: MatterHistoryEntry[];
  attachments: Attachment[];
}

export interface MatterHistoryEntry {
  eventId: number;
  eventDate: string;
  agendaNumber: string | null;
  actionName: string | null;
  passed: boolean | null;
}

export interface ResidentPrefs {
  topics: string[]; // topic slugs
  ward: number | null; // 1-5
  onboarded: boolean;
}

export interface RankedItem extends AgendaItem {
  score: number;
  reasons: MatchReason[];
}
