import { updateGlobalSetting, getGlobalSetting } from "@/repositories/bossRepository";
import { pusherServer } from "@/lib/pusher";

export const dynamic = "force-dynamic";

// Ambil status saat ini
export async function GET() {
  const status = await getGlobalSetting("showInvasion");
  return Response.json({ showInvasion: status ?? true });
}

// Simpan status baru (SINKRON DENGAN INVASION CONTEXT)
export async function POST(req) {
  try {
    const { showInvasion } = await req.json();
    
    // 1. Simpan ke Database
    await updateGlobalSetting("showInvasion", showInvasion);

    // 2. Broadcast via Pusher (Disamakan ke channel induk & event setting-updated)
    await pusherServer.trigger("boss-timer-k3", "setting-updated", { 
      key: "showInvasion", 
      value: showInvasion 
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}