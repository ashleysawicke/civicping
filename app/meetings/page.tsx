// Meetings: a month calendar of council meetings plus upcoming/past lists.
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { MeetingSummary } from "@/lib/types";
import { ErrorBox, SkeletonCard } from "@/components/States";
import { formatMeetingDate } from "@/components/format";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DOW = ["S", "M", "T", "W", "T", "F", "S"];

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function MeetingCalendar({ meetings }: { meetings: MeetingSummary[] }) {
  const now = new Date();
  const [view, setView] = useState({ y: now.getFullYear(), m: now.getMonth() });

  const byDate = useMemo(() => {
    const map = new Map<string, number>();
    for (const mt of meetings) map.set(mt.date, mt.id);
    return map;
  }, [meetings]);

  const firstDow = new Date(view.y, view.m, 1).getDay();
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array<null>(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

  function shift(delta: number) {
    setView((v) => {
      const d = new Date(v.y, v.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  }

  return (
    <section
      aria-label="Meeting calendar"
      className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
    >
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => shift(-1)}
          aria-label="Previous month"
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-xl text-neutral-600 dark:text-neutral-300"
        >
          ‹
        </button>
        <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
          {MONTHS[view.m]} {view.y}
        </h2>
        <button
          type="button"
          onClick={() => shift(1)}
          aria-label="Next month"
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-xl text-neutral-600 dark:text-neutral-300"
        >
          ›
        </button>
      </div>
      <div className="mt-2 grid grid-cols-7 gap-1 text-center" role="grid">
        {DOW.map((d, i) => (
          <span
            key={i}
            className="py-1 text-xs font-semibold text-neutral-400 dark:text-neutral-500"
          >
            {d}
          </span>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <span key={i} />;
          const ds = `${view.y}-${pad(view.m + 1)}-${pad(day)}`;
          const meetingId = byDate.get(ds);
          const isToday = ds === todayStr;
          const dayEl = (
            <span
              className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-sm ${
                meetingId
                  ? "bg-blue-700 font-semibold text-white"
                  : isToday
                    ? "font-semibold text-blue-700 ring-2 ring-blue-700 dark:text-blue-400 dark:ring-blue-400"
                    : "text-neutral-700 dark:text-neutral-300"
              }`}
            >
              {day}
            </span>
          );
          return (
            <span key={i} className="flex justify-center py-0.5">
              {meetingId ? (
                <Link
                  href={`/meetings/${meetingId}`}
                  aria-label={`Council meeting on ${ds}`}
                  className="rounded-full"
                >
                  {dayEl}
                </Link>
              ) : (
                dayEl
              )}
            </span>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
        <span
          aria-hidden="true"
          className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-blue-700 align-middle"
        />
        Council meeting — tap the date for its agenda.
      </p>
    </section>
  );
}

function MeetingRow({ meeting }: { meeting: MeetingSummary }) {
  return (
    <Link
      href={`/meetings/${meeting.id}`}
      className="block min-h-[44px] rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
    >
      <p className="font-semibold text-neutral-900 dark:text-neutral-100">
        {formatMeetingDate(meeting.date)}
      </p>
      <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
        {meeting.time} · Agenda: {meeting.agendaStatus} · Minutes:{" "}
        {meeting.minutesStatus}
      </p>
    </Link>
  );
}

export default function MeetingsPage() {
  const [upcoming, setUpcoming] = useState<MeetingSummary[] | null>(null);
  const [recentPast, setRecentPast] = useState<MeetingSummary | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/meetings")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Could not load meetings.");
        if (!cancelled) {
          setUpcoming(data.upcoming as MeetingSummary[]);
          setRecentPast((data.recentPast as MeetingSummary | null) ?? null);
        }
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (failed) {
    return (
      <ErrorBox
        title="Could not load meetings"
        message="The city's agenda data could not be reached. Please try again later."
      />
    );
  }

  if (upcoming === null) {
    return (
      <div className="space-y-3" aria-label="Loading meetings">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
          Meetings
        </h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          Upcoming City Council meetings and the most recent one past.
        </p>
      </div>

      <MeetingCalendar meetings={[...upcoming, ...(recentPast ? [recentPast] : [])]} />

      <section aria-label="Upcoming meetings" className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          Upcoming ({upcoming.length})
        </h2>
        {upcoming.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No upcoming meetings are scheduled in the city&apos;s system right
            now.
          </p>
        ) : (
          upcoming.map((m) => <MeetingRow key={m.id} meeting={m} />)
        )}
      </section>

      {recentPast && (
        <section aria-label="Most recent meeting" className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Most recent meeting
          </h2>
          <MeetingRow meeting={recentPast} />
        </section>
      )}
    </div>
  );
}
