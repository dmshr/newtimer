import { saveBoss, getAllBosses } from "@/repositories/bossRepository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const bosses = await getAllBosses();
  return Response.json(bosses);
}

export async function POST(req) {
  const body = await req.json();

  if (!body.name) {
    return Response.json(
      { error: "Name is required" },
      { status: 400 }
    );
  }

  await saveBoss(body);

  return Response.json({ success: true });
}