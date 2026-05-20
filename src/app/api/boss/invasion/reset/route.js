import { resetInvasionTimes } from "@/repositories/bossRepository";
import { pusherServer } from "@/lib/pusher";

export async function POST() {
  try {
    // 1. Reset data di Database Neon
    await resetInvasionTimes();

    // 2. Sinyal 1: Beritahu BossList untuk sinkronisasi data sisa boss lainnya
    await pusherServer.trigger("boss-timer-k3", "boss-updated", { message: "Invasion Reset" });
    
    // 3. Sinyal 2: Beritahu InvasionContext di channel yang SAMA (boss-timer-k3) untuk trigger animasi reset
    await pusherServer.trigger("boss-timer-k3", "invasion-reset", {});

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}