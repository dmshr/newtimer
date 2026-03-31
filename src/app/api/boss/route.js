import { saveBoss, getAllBosses } from "@/repositories/bossRepository";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const bosses = await getAllBosses();
    return Response.json(bosses);
  } catch (error) {
    return Response.json({ error: "Failed to fetch bosses" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    if (!body.name) return Response.json({ error: "Name required" }, { status: 400 });

    await saveBoss(body);
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}