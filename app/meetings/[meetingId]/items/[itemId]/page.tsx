// Item detail: explanation, outcome, minutes note, votes, matter timeline,
// and the action panel.
import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getMeetingDetail } from "@/lib/legistar";
import type { AgendaItem } from "@/lib/types";
import { topicLabel } from "@/lib/topics";
import Explanation from "@/components/Explanation";
import OutcomeBadge from "@/components/OutcomeBadge";
import VotesSection from "@/components/VotesSection";
import MatterTimeline from "@/components/MatterTimeline";
import ActionPanel from "@/components/ActionPanel";
import { ErrorBox, SkeletonCard } from "@/components/States";

function MoverLine({ item }: { item: AgendaItem }) {
  if (!item.mover && !item.seconder) return null;
  return (
    <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
      {item.mover && (
        <>
          Moved by <span className="font-medium">{item.mover}</span>
        </>
      )}
      {item.mover && item.seconder && " · "}
      {item.seconder && (
        <>
          Seconded by <span className="font-medium">{item.seconder}</span>
        </>
      )}
    </p>
  );
}

async function ItemContent({
  params,
}: {
  params: Promise<{ meetingId: string; itemId: string }>;
}) {
  const { meetingId, itemId } = await params;
  const mid = Number(meetingId);
  if (!Number.isInteger(mid)) notFound();

  let meeting;
  try {
    meeting = await getMeetingDetail(mid);
  } catch {
    return (
      <ErrorBox
        title="Could not load this item"
        message="The city's agenda data could not be reached. Please try again later."
      />
    );
  }

  const item = meeting.items.find((i) => String(i.id) === itemId);
  if (!item) notFound();

  return (
    <div className="space-y-2">
      <Link
        href={`/meetings/${meeting.id}`}
        className="inline-flex min-h-[44px] items-center text-sm font-medium text-blue-700 underline dark:text-blue-400"
      >
        ← Back to meeting
      </Link>

      <article>
        {item.agendaNumber && (
          <span className="inline-flex items-center rounded-md bg-neutral-900 px-2 py-0.5 text-xs font-semibold text-white dark:bg-neutral-100 dark:text-neutral-900">
            {item.agendaNumber}
          </span>
        )}
        <h1 className="mt-2 text-xl font-bold leading-snug text-neutral-900 dark:text-neutral-100">
          {item.title}
        </h1>

        {item.topics.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {item.topics.map((slug) => (
              <span
                key={slug}
                className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
              >
                {topicLabel(slug)}
              </span>
            ))}
          </div>
        )}

        <div className="mt-3">
          <OutcomeBadge item={item} minutesStatus={meeting.minutesStatus} />
        </div>
        <MoverLine item={item} />

        <Explanation itemId={item.id} title={item.title} />

        {item.minutesNote && (
          <section aria-label="Minutes note" className="mt-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              From the official minutes
            </h2>
            <p className="mt-2 rounded-xl border border-neutral-200 bg-white p-4 text-sm leading-relaxed text-neutral-800 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200">
              {item.minutesNote}
            </p>
          </section>
        )}

        <VotesSection itemId={item.id} />

        {item.matter && <MatterTimeline matter={item.matter} />}

        <div className="mt-6">
          <a
            href={item.insiteUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-[44px] items-center text-sm font-medium text-blue-700 underline dark:text-blue-400"
          >
            View this item on the city&apos;s Legistar page
          </a>
        </div>

        <ActionPanel item={item} meeting={meeting} />
      </article>
    </div>
  );
}

export default function ItemPage({
  params,
}: {
  params: Promise<{ meetingId: string; itemId: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="space-y-3" aria-label="Loading item">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      }
    >
      <ItemContent params={params} />
    </Suspense>
  );
}
