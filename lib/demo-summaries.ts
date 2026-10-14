// Verified demo summaries for the labeled historical demo set (Oct 5, 2026).
// Every summary below was written from the official agenda title, action,
// and minutes note actually observed via the Legistar API on 2026-10-14.
// New items without a verified summary show the official title with a
// "summary pending" label instead — the app never invents explanations.

export interface DemoSummary {
  eventItemId: number;
  summary: string;
  checkedAt: string; // ISO date the summary was verified
}

export const DEMO_SUMMARIES: DemoSummary[] = [
  {
    eventItemId: 226529, // CA-12
    summary:
      "Council approved buying the property at 6 Park View Place so the Ann Arbor Housing Development Corporation can use it for affordable housing. " +
      "The purchase price is $11,000,000. It passed on the consent agenda, moved by Councilmember Briggs and seconded by Councilmember Radina, and was enacted as Resolution R-26-387.",
    checkedAt: "2026-10-14",
  },
  {
    eventItemId: 226572, // CA-13
    summary:
      "Council approved a $450,000 grant agreement with the Ann Arbor Hands-On Museum to decarbonize the Energy House at the Leslie Science & Nature Center and fund related sustainability education. " +
      "It passed on the consent agenda. Eight votes were required.",
    checkedAt: "2026-10-14",
  },
  {
    eventItemId: 226538, // CA-1
    summary:
      "Council approved street closures for the Main Street Area Association Trick or Treat Parade on Sunday, October 25, 2026, from 9:00 AM to 4:00 PM. " +
      "It passed on the consent agenda.",
    checkedAt: "2026-10-14",
  },
  {
    eventItemId: 226537, // CA-2
    summary:
      "Council approved street closures for the Ann Arbor Thanksgiving Day Turkey Trot on Thursday, November 26, 2026. " +
      "It passed on the consent agenda.",
    checkedAt: "2026-10-14",
  },
  {
    eventItemId: 226545, // B-1
    summary:
      "Council adopted an ordinance rezoning 1.199 acres at 2080 South State Street from Township District to Office District (ORD-26-23). " +
      "A public hearing was held first; one resident spoke in opposition, preferring a transportation-corridor zoning instead. " +
      "On a voice vote the Mayor declared the motion carried.",
    checkedAt: "2026-10-14",
  },
  {
    eventItemId: 226546, // B-2
    summary:
      "Council adopted an ordinance amending the rate schedules for the Sustainable Energy Utility (ORD-26-26). " +
      "At the public hearing, two residents spoke in support. On a voice vote the Mayor declared the motion carried.",
    checkedAt: "2026-10-14",
  },
];

export function demoSummaryFor(eventItemId: number): DemoSummary | null {
  return DEMO_SUMMARIES.find((s) => s.eventItemId === eventItemId) ?? null;
}
