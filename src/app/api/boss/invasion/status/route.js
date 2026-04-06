import { updateGlobalSetting, getGlobalSetting } from "@/repositories/bossRepository"; // Kamu perlu buat fungsi ini
import { pusherServer } from "@/lib/pusher";

export const dynamic = "force-dynamic";

// Ambil status saat ini
export async function GET() {
  const status = await getGlobalSetting("showInvasion");
  return Response.json({ showInvasion: status ?? true });
}

// Simpan status baru
export async function POST(req) {
  try {
    const { showInvasion } = await req.json();
    
    await updateGlobalSetting("showInvasion", showInvasion);

    // Beritahu semua user agar tombol Invasion mereka berubah warna/status secara real-time
    await pusherServer.trigger("global-settings", "status-changed", { showInvasion });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}