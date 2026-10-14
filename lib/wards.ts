// Ward and council roster data.
//
// Current roster (mayor + 10 councilmembers) verified from the official
// vote records of the Oct 5, 2026 City Council meeting, observed 2026-10-14.
// Ward -> member assignments are NOT in the Legistar data and have not been
// independently verified here — they are intentionally left null. Do not
// invent ward assignments. Confirm against a2gov.org before resident testing.
//
// The email action therefore drafts a message addressed by ward ("Dear
// Councilmembers, as a Ward N resident...") and hands the resident the
// city's official contact directory to address it, rather than guessing.

export interface CouncilMember {
  name: string;
  role: "Mayor" | "Councilmember";
  ward: number | null; // null = unverified; confirm before public use
}

export const COUNCIL_ROSTER: CouncilMember[] = [
  { name: "Christopher Taylor", role: "Mayor", ward: null },
  { name: "Erica Briggs", role: "Councilmember", ward: null },
  { name: "Lisa Disch", role: "Councilmember", ward: null },
  { name: "Jen Eyer", role: "Councilmember", ward: null },
  { name: "Travis Radina", role: "Councilmember", ward: null },
  { name: "Cynthia Harrison", role: "Councilmember", ward: null },
  { name: "Ayesha Ghazi Edwin", role: "Councilmember", ward: null },
  { name: "Chris Watson", role: "Councilmember", ward: null },
  { name: "Dharma Akmon", role: "Councilmember", ward: null },
  { name: "Jennifer Cornell", role: "Councilmember", ward: null },
  { name: "Jon Mallek", role: "Councilmember", ward: null },
];

export const WARDS = [1, 2, 3, 4, 5] as const;

// Official handoffs for the action panel. None of these submit anything on
// the resident's behalf; each opens or drafts in the official system.
export const CITY_CONTACT_URL = "https://www.a2gov.org/city-council/";
export const CLERK_PHONE = "734-794-6140"; // public-comment signup, from the official agenda
export const LEGISTAR_CALENDAR_URL = "https://a2gov.legistar.com/Calendar.aspx";
