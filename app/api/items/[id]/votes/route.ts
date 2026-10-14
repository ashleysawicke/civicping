import { getItemVotes } from "@/lib/legistar";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const itemId = Number(id);
  if (!Number.isInteger(itemId)) {
    return Response.json({ error: "Invalid item id." }, { status: 400 });
  }
  try {
    const votes = await getItemVotes(itemId);
    return Response.json({ votes });
  } catch (err) {
    return Response.json(
      { error: "Could not load vote records. Please try again." },
      { status: 502 }
    );
  }
}
