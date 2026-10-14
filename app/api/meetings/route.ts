import { DEMO_MEETING_ID, getRecentCouncilMeetings } from "@/lib/legistar";

export async function GET() {
  try {
    const meetings = await getRecentCouncilMeetings(6);
    return Response.json({ meetings, demoMeetingId: DEMO_MEETING_ID });
  } catch (err) {
    return Response.json(
      { error: "Could not reach the city's agenda data. Please try again." },
      { status: 502 }
    );
  }
}
