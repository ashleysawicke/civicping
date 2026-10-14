import { getMeetingDetail } from "@/lib/legistar";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const meetingId = Number(id);
  if (!Number.isInteger(meetingId)) {
    return Response.json({ error: "Invalid meeting id." }, { status: 400 });
  }
  try {
    const meeting = await getMeetingDetail(meetingId);
    return Response.json({ meeting });
  } catch (err) {
    return Response.json(
      { error: "Could not load this meeting's agenda. Please try again." },
      { status: 502 }
    );
  }
}
