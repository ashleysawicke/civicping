// Small date/format helpers for the UI. All inputs are ISO "YYYY-MM-DD"
// (or ISO datetimes, which are truncated to the date part).

/** Local "today" as YYYY-MM-DD, safe for lexicographic comparison. */
export function todayStr(): string {
  const t = new Date();
  const m = String(t.getMonth() + 1).padStart(2, "0");
  const d = String(t.getDate()).padStart(2, "0");
  return `${t.getFullYear()}-${m}-${d}`;
}

/** True when the given ISO date is today or in the future. */
export function isUpcoming(dateStr: string): boolean {
  return dateStr.slice(0, 10) >= todayStr();
}

/** "2026-10-19" -> "Mon, Oct 19, 2026" */
export function formatMeetingDate(dateStr: string): string {
  const d = new Date(`${dateStr.slice(0, 10)}T12:00:00`);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** "2026-10-19" -> "Oct 19, 2026" */
export function formatShortDate(dateStr: string): string {
  const d = new Date(`${dateStr.slice(0, 10)}T12:00:00`);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** ISO datetime -> "Oct 19, 2026, 2:15 PM" (local time) */
export function formatCheckedAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** 11000000 -> "$11,000,000" */
export function formatCost(cost: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cost);
}
