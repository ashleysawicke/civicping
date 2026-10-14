// WhyMatch: transparently shows why an item was ranked for the resident.
import type { MatchReason } from "@/lib/types";

export default function WhyMatch({ reasons }: { reasons: MatchReason[] }) {
  if (reasons.length === 0) return null;
  return (
    <ul className="mt-2 space-y-1">
      {reasons.map((r, i) => (
        <li
          key={`${r.kind}-${i}`}
          className="text-xs text-blue-800 dark:text-blue-300"
        >
          <span aria-hidden="true">→ </span>
          {r.label}
        </li>
      ))}
    </ul>
  );
}
