
// Feed card for one ranked agenda item.
import Link from "next/link";
import type { RankedItem } from "@/lib/types";
import { topicLabel } from "@/lib/topics";
import OutcomeBadge from "@/components/OutcomeBadge";
import WhyMatch from "@/components/WhyMatch";

export default function ItemCard({
  item,
  meetingId,
}: {
  item: RankedItem;
  meetingId: number;
}) {
  return (
    <Link
      href={`/meetings/${meetingId}/items/${item.id}`}
      className="block min-h-[44px] rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition-colors hover:border-blue-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-blue-700"
    >
      <div className="flex flex-wrap items-center gap-2">
        {item.agendaNumber && (
          <span className="inline-flex items-center rounded-md bg-neutral-900 px-2 py-0.5 text-xs font-semibold text-white dark:bg-neutral-100 dark:text-neutral-900">
            {item.agendaNumber}
          </span>
        )}
        <OutcomeBadge item={item} />
      </div>
      <h3 className="mt-2 text-base font-semibold leading-snug text-neutral-900 dark:text-neutral-100">
        {item.title}
      </h3>
      {item.topics.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {item.topics.map((slug) => (
            <span
              key={slug}
              className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
            >
              {topicLabel(slug)}
            </span>
          ))}
        </div>
      )}
      <WhyMatch reasons={item.reasons} />
    </Link>
  );
}
