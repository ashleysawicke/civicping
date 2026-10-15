// Meeting detail: header, status, source links, and the full item list.
import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getMeetingDetail } from "@/lib/legistar";
import Breadcrumbs from "@/components/Breadcrumbs";
import OutcomeBadge from "@/components/OutcomeBadge";
import { EmptyNotice, ErrorBox, SkeletonCard } from "@/components/States";
import { formatCheckedAt, formatMeetingDate } from "@/components/format";

function StatusPill({ label, value }: { label: string; value: string }) {
  const tone =
    value === "Final" || value === "Final-revised"
      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      : value === "Draft"
        ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
        : "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${tone}`}
    >
      {label}: {value}
    </span>
  );
}

async function MeetingContent({
  params,
}: {
  params: Promise<{ meetingId: string }>;
}) {
  const { meetingId } = await params;
  const id = Number(meetingId);
  if (!Number.isInteger(id)) notFound();

  let meeting;
  try {
    meeting = await getMeetingDetail(id);
  } catch {
    return (
      <ErrorBox
        title="Could not load this meeting"
        message="The city's agenda data could not be reached. Please try again later."
      />
    );
  }

  const items = meeting.items
    .filter((i) => !i.procedural)
    .sort((a, b) => a.sequence - b.sequence);

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: `${formatMeetingDate(meeting.date)} meeting` },
        ]}
      />

      {meeting.demo && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          Demo meeting — {formatMeetingDate(meeting.date)}, shown so you can
          explore the full loop.
        </p>
      )}

      <div>
        <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
          {formatMeetingDate(meeting.date)} · {meeting.time}
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {meeting.bodyName}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <StatusPill label="Agenda" value={meeting.agendaStatus} />
          <StatusPill label="Minutes" value={meeting.minutesStatus} />
        </div>
        <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
          Checked {formatCheckedAt(meeting.lastCheckedAt)}
        </p>
      </div>

      <section
        aria-label="Official sources"
        className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
      >
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          Official sources
        </h2>
        <ul className="mt-2 space-y-1">
          {meeting.agendaUrl ? (
            <li>
              <a
                href={meeting.agendaUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-[44px] items-center text-sm font-medium text-blue-700 underline dark:text-blue-400"
              >
                Agenda (PDF)
              </a>
            </li>
          ) : (
            <li className="py-2 text-sm text-neutral-500 dark:text-neutral-400">
              Agenda not yet published
            </li>
          )}
          {meeting.minutesUrl && (
            <li>
              <a
                href={meeting.minutesUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-[44px] items-center text-sm font-medium text-blue-700 underline dark:text-blue-400"
              >
                Minutes (PDF)
              </a>
            </li>
          )}
          <li>
            <a
              href={meeting.insiteUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-[44px] items-center text-sm font-medium text-blue-700 underline dark:text-blue-400"
            >
              Official Legistar meeting page
            </a>
          </li>
          {meeting.videoUrl && (
            <li>
              <a
                href={meeting.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-[44px] items-center text-sm font-medium text-blue-700 underline dark:text-blue-400"
              >
                Meeting video
              </a>
            </li>
          )}
        </ul>
      </section>

      <section aria-label="Agenda items">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          Agenda items ({items.length})
        </h2>
        {items.length === 0 ? (
          <div className="mt-2">
            <EmptyNotice title="No agenda items found for this meeting." />
          </div>
        ) : (
          <div className="mt-2 space-y-2">
            {items.map((item) => (
              <Link
                key={item.id}
                href={`/meetings/${meeting.id}/items/${item.id}`}
                className="block min-h-[44px] rounded-xl border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="flex flex-wrap items-center gap-2">
                  {item.agendaNumber && (
                    <span className="inline-flex items-center rounded-md bg-neutral-900 px-2 py-0.5 text-xs font-semibold text-white dark:bg-neutral-100 dark:text-neutral-900">
                      {item.agendaNumber}
                    </span>
                  )}
                  <OutcomeBadge item={item} minutesStatus={meeting.minutesStatus} />
                </div>
                <p className="mt-1.5 text-sm font-medium leading-snug text-neutral-900 dark:text-neutral-100">
                  {item.title}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function MeetingPage({
  params,
}: {
  params: Promise<{ meetingId: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="space-y-3" aria-label="Loading meeting">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      }
    >
      <MeetingContent params={params} />
    </Suspense>
  );
}
