// OutcomeBadge: shows only what the official record says. Never invents outcomes.
import type { AgendaItem } from "@/lib/types";

export default function OutcomeBadge({
  item,
  minutesStatus,
}: {
  item: AgendaItem;
  minutesStatus?: string;
}) {
  if (item.actionName == null) {
    return (
      <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
        Awaiting decision
      </span>
    );
  }

  const passedPill =
    item.passed === true ? (
      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
        Passed
      </span>
    ) : item.passed === false ? (
      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
        Did not pass
      </span>
    ) : null;

  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
        {item.actionName}
        {minutesStatus === "Draft" ? " (draft minutes)" : ""}
      </span>
      {passedPill}
    </span>
  );
}
