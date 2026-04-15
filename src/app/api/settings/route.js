import { getGlobalSetting, updateGlobalSetting } from "@/repositories/bossRepository";
import { pusherServer } from "@/lib/pusher";
import { NextResponse } from "next/server";

/**
 * GET: Mengambil nilai setting berdasarkan key
 * Contoh: /api/settings?key=announcement_text
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json({ error: "Missing key parameter" }, { status: 400 });
    }

    const value = await getGlobalSetting(key);
    
    return NextResponse.json({ value });
  } catch (error) {
    console.error("🔥 GET Settings Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * POST: Menyimpan setting ke DB dan Broadcast ke Pusher
 * Body: { "key": "...", "value": "..." }
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const { key, value } = body;

    // Log untuk debugging di Terminal VS Code
    console.log(`[API Settings] Updating ${key} to:`, value);

    if (!key) {
      return NextResponse.json({ error: "Key is required" }, { status: 400 });
    }

    // 1. Simpan ke Database Neon (Persistence)
    await updateGlobalSetting(key, value);

    // 2. Broadcast ke Pusher (Real-time Sync)
    // Channel: boss-timer-k3, Event: setting-updated
    await pusherServer.trigger("boss-timer-k3", "setting-updated", { 
      key, 
      value 
    });

    return NextResponse.json({ 
      success: true, 
      message: `Setting ${key} updated and broadcasted.` 
    });

  } catch (error) {
    console.error("🔥 POST Settings Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}