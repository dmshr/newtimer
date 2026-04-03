import { saveBoss, getAllBosses } from "@/repositories/bossRepository";
import { pusherServer } from "@/lib/pusher"; // ✅ Tambahkan import ini

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

    // 1. Simpan ke Database
    await saveBoss(body);

    // 2. ✅ PICU PUSHER: Beritahu semua user di channel "boss-timer-k3"
    // Kita kirim event bernama "boss-updated"
    await pusherServer.trigger("boss-timer-k3", "boss-updated", {
      message: "Data updated",
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}