import { getMatterDetail } from "@/lib/legistar";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const matterId = Number(id);
  if (!Number.isInteger(matterId)) {
    return Response.json({ error: "Invalid matter id." }, { status: 400 });
  }
  try {
    const matter = await getMatterDetail(matterId);
    return Response.json({ matter });
  } catch (err) {
    return Response.json(
      { error: "Could not load this item's record. Please try again." },
      { status: 502 }
    );
  }
}
