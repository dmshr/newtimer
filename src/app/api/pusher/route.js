import { saveBoss, getAllBosses } from "@/repositories/bossRepository";
import Pusher from "pusher"; // 1. Tambah Import Pusher

export const dynamic = "force-dynamic";

// 2. Inisialisasi Pusher Server
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
  useTLS: true,
});

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

    // 3. Simpan ke Database (Neon)
    await saveBoss(body);

    // 4. TRIGGER REAL-TIME: Kirim sinyal ke semua client
    // Channel dan Event harus SAMA dengan yang ada di BossList.jsx
    await pusher.trigger("boss-timer-k3", "boss-updated", {
      message: `Data ${body.name} updated`,
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}