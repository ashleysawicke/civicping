
// Home feed: the next City Council meeting's agenda, ranked for the resident.
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type {
  MeetingDetail,
  MeetingSummary,
  ResidentPrefs,
} from "@/lib/types";
import { rankItems } from "@/lib/ranking";
import { DEFAULT_PREFS, loadPrefs } from "@/lib/preferences";
import ItemCard from "@/components/ItemCard";
import { EmptyNotice, ErrorBox, SkeletonCard } from "@/components/States";
import { formatMeetingDate, todayStr } from "@/components/format";

type Phase = "loading" | "ready" | "no-agenda" | "error";

export default function HomePage() {
  const [prefs, setPrefs] = useState<ResidentPrefs | null>(null);
  const [phase, setPhase] = useState<Phase>("loading");
  const [detail, setDetail] = useState<MeetingDetail | null>(null);
  const [nextMeeting, setNextMeeting] = useState<MeetingSummary | null>(null);
  const [demoMeetingId, setDemoMeetingId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setPrefs(loadPrefs());
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setPhase("loading");
      setErrorMsg("");
      try {
        const res = await fetch("/api/meetings");
        const data = await res.json();
        if (!res.ok) {
          throw new Error(
            typeof data.error === "string"
              ? data.error
              : "Could not load meetings."
          );
        }
        const list = data.meetings as MeetingSummary[];
        const upcoming = list
          .filter((m) => m.date >= todayStr())
          .sort((a, b) => a.date.localeCompare(b.date));
        const next = upcoming[0] ?? null;
        if (!cancelled) {
          setNextMeeting(next);
          setDemoMeetingId(data.demoMeetingId as number);
        }

        let targetId: number;
        if (next && next.agendaUrl) {
          targetId = next.id;
        } else if (next) {
          // The next meeting exists but its agenda is not published yet.
          if (!cancelled) setPhase("no-agenda");
          return;
        } else {
          targetId = data.demoMeetingId as number;
        }

        const dres = await fetch(`/api/meetings/${targetId}`);
        const ddata = await dres.json();
        if (!dres.ok) {
          throw new Error(
            typeof ddata.error === "string"
              ? ddata.error
              : "Could not load the meeting agenda."
          );
        }
        if (!cancelled) {
          setDetail(ddata.meeting as MeetingDetail);
          setPhase("ready");
        }
      } catch (e) {
        if (!cancelled) {
          setErrorMsg(
            e instanceof Error ? e.message : "Something went wrong."
          );
          setPhase("error");
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  if (phase === "loading") {
    return (
      <div className="space-y-3" aria-label="Loading agenda">
        <div className="animate-pulse">
          <div className="h-7 w-2/3 rounded bg-neutral-200 dark:bg-neutral-700" />
          <div className="mt-2 h-4 w-1/3 rounded bg-neutral-200 dark:bg-neutral-700" />
        </div>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (phase === "error") {
    return (
      <ErrorBox
        title="Could not load the agenda"
        message={errorMsg}
        onRetry={() => setAttempt((a) => a + 1)}
      />
    );
  }

  if (phase === "no-agenda" && nextMeeting) {
    return (
      <div className="space-y-4">
        <EmptyNotice
          title={`The agenda for ${formatMeetingDate(nextMeeting.date)} hasn't been published yet — check back closer to the meeting.`}
        >
          <p>
            Agendas are usually published a few days before the meeting. In
            the meantime, you can explore how CivicPing works:
          </p>
        </EmptyNotice>
        {demoMeetingId != null && (
          <Link
            href={`/meetings/${demoMeetingId}`}
            className="block min-h-[44px] rounded-xl border border-blue-200 bg-blue-50 p-4 text-center font-medium text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-200"
          >
            Explore a demo meeting from Oct 5, 2026
          </Link>
        )}
      </div>
    );
  }

  if (phase === "ready" && detail) {
    const ranked = rankItems(detail.items, prefs ?? DEFAULT_PREFS);
    return (
      <div className="space-y-4">
        {prefs !== null && !prefs.onboarded && (
          <Link
            href="/onboarding"
            className="block min-h-[44px] rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950"
          >
            <p className="font-semibold text-blue-900 dark:text-blue-100">
              Personalize your feed
            </p>
            <p className="mt-1 text-sm text-blue-800 dark:text-blue-300">
              Tell us your topics + ward to personalize — it takes 30 seconds.
            </p>
          </Link>
        )}

        <div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                {formatMeetingDate(detail.date)}
              </h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {detail.bodyName} · {detail.time} · Agenda: {detail.agendaStatus}
              </p>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                {prefs !== null && prefs.onboarded
                  ? "Upcoming agenda items, ranked for you. Tap any item for a plain-language summary and ways to weigh in."
                  : "The next council meeting's agenda. Tap any item for details — or personalize your feed to see what matters to you first."}
              </p>
            </div>
            {prefs !== null && prefs.onboarded && (
              <Link
                href="/onboarding"
                className="inline-flex min-h-[44px] shrink-0 items-center rounded-lg px-3 text-sm font-medium text-blue-700 underline dark:text-blue-400"
              >
                Edit topics &amp; ward
              </Link>
            )}
          </div>
          {detail.demo && (
            <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-200">
              Demo meeting — shown so you can explore the full loop.
            </p>
          )}
          <Link
            href={`/meetings/${detail.id}`}
            className="mt-1 inline-flex min-h-[44px] items-center text-sm font-medium text-blue-700 underline dark:text-blue-400"
          >
            Full meeting details
          </Link>
        </div>

        {ranked.length === 0 ? (
          <EmptyNotice title="No agenda items found for this meeting." />
        ) : (
          <div className="space-y-3">
            {ranked.map((item) => (
              <ItemCard key={item.id} item={item} meetingId={detail.id} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
}
