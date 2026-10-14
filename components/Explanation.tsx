// Plain-language explanation for an agenda item. Verified demo summaries
// are shown as-is; everything else is labeled "summary pending" —
// the app never invents explanations.
import { demoSummaryFor } from "@/lib/demo-summaries";

export default function Explanation({
  itemId,
  title,
}: {
  itemId: number;
  title: string;
}) {
  const summary = demoSummaryFor(itemId);

  return (
    <section aria-label="Explanation" className="mt-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
        In plain language
      </h2>
      {summary ? (
        <div className="mt-2 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
          <p className="text-sm leading-relaxed text-neutral-900 dark:text-neutral-100">
            {summary.summary}
          </p>
          <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
            Verified summary · checked {summary.checkedAt}
          </p>
        </div>
      ) : (
        <div className="mt-2 rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Summary pending
          </p>
          <p className="mt-1 text-sm text-neutral-700 dark:text-neutral-300">
            This item does not have a verified summary yet. Here is the
            official title:
          </p>
          <p className="mt-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {title}
          </p>
        </div>
      )}
    </section>
  );
}
