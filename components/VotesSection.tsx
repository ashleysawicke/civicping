
// Votes for one agenda item. Per-person votes are shown ONLY when the
// official record includes individual values; voice votes get an honest
// aggregate line instead. Nothing is invented.
"use client";

import { useEffect, useState } from "react";
import type { VoteRecord } from "@/lib/types";

export default function VotesSection({ itemId }: { itemId: number }) {
  const [votes, setVotes] = useState<VoteRecord[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/items/${itemId}/votes`)
      .then(async (res) => {
        if (!res.ok) throw new Error("votes unavailable");
        const data = await res.json();
        if (!cancelled) setVotes(data.votes as VoteRecord[]);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [itemId]);

  if (failed) {
    return (
      <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
        Vote records could not be loaded.
      </p>
    );
  }
  if (votes === null) {
    return (
      <div className="mt-4 animate-pulse space-y-2" aria-label="Loading votes">
        <div className="h-4 w-24 rounded bg-neutral-200 dark:bg-neutral-700" />
        <div className="h-4 w-40 rounded bg-neutral-200 dark:bg-neutral-700" />
      </div>
    );
  }
  if (votes.length === 0) return null;

  const withValues = votes.filter((v) => v.value !== null);

  return (
    <section aria-label="Votes" className="mt-6">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
        Votes
      </h2>
      {withValues.length === 0 ? (
        <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">
          {votes.length} members recorded · voice vote — individual positions
          not published.
        </p>
      ) : (
        <ul className="mt-2 divide-y divide-neutral-200 rounded-xl border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
          {withValues.map((v) => (
            <li
              key={v.personId}
              className="flex items-center justify-between px-4 py-3"
            >
              <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {v.personName}
              </span>
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                {v.value}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
