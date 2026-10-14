import { DEMO_MEETING_ID, getRecentCouncilMeetings } from "@/lib/legistar";

export async function GET() {
  try {
    const meetings = await getRecentCouncilMeetings(6);
    return Response.json({ meetings, demoMeetingId: DEMO_MEETING_ID });
  } catch (err) {
    // TEMPORARY diagnostic: include the underlying error so we can see why
    // the Legistar fetch fails on Vercel. Will be narrowed once diagnosed.
    return Response.json(
      {
        error: "Could not reach the city's agenda data. Please try again.",
        details: err instanceof Error ? `${err.name}: ${err.message}` : String(err),
      },
      { status: 502 }
    );
  }
}
