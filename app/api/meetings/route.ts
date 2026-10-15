import {
  DEMO_MEETING_ID,
  getMostRecentPastMeeting,
  getUpcomingCouncilMeetings,
} from "@/lib/legistar";

export async function GET() {
  try {
    const [upcoming, recentPast] = await Promise.all([
      getUpcomingCouncilMeetings(8),
      getMostRecentPastMeeting(),
    ]);
    return Response.json({
      upcoming,
      recentPast,
      demoMeetingId: DEMO_MEETING_ID,
    });
  } catch {
    return Response.json(
      { error: "Could not reach the city's agenda data. Please try again." },
      { status: 502 }
    );
  }
}
