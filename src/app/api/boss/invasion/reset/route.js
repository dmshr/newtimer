import { resetInvasionTimes } from "@/repositories/bossRepository"; // Kamu perlu buat fungsi ini di repo
import { pusherServer } from "@/lib/pusher";

export async function POST() {
  try {
    await resetInvasionTimes();

    // Sinyal 1: Beritahu BossList untuk refresh data dari database
    await pusherServer.trigger("boss-timer-k3", "boss-updated", { message: "Invasion Reset" });
    
    // Sinyal 2: Beritahu Context untuk memicu animasi reset jika perlu
    await pusherServer.trigger("global-settings", "invasion-reset", {});

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}