import { 
  saveBoss, 
  getAllBosses, 
  updateBossDetail, 
  deleteBoss 
} from "@/repositories/bossRepository";
import { pusherServer } from "@/lib/pusher";
import { revalidateTag } from "next/cache"; // ✅ IMPORT REVALIDASI CACHE

// 1. AMBIL SEMUA DATA (GET)
export async function GET() {
  try {
    const bosses = await getAllBosses();
    return Response.json(bosses);
  } catch (error) {
    return Response.json({ error: "Failed to fetch bosses" }, { status: 500 });
  }
}

// 2. UPDATE TIMER / TENGKORAK (POST)
export async function POST(req) {
  try {
    const body = await req.json();
    if (!body.name) return Response.json({ error: "Name required" }, { status: 400 });

    const result = await saveBoss(body);

    // ✅ PENANGANAN ANTI-RACE CONDITION: 
    // Jika result kosong, berarti update ditolak oleh Database karena jadwal sudah berubah
    if (!result || result.length === 0) {
      console.log(`[RACE CONDITION PREVENTED] Update untuk ${body.name} ditolak.`);
      return Response.json({ success: false, ignored: true, message: "Update ditolak (Jadwal sudah berubah)" }, { status: 409 });
    }

    const updatedBoss = result[0];

    // ✅ MENGHANCURKAN CACHE LAMA AGAR PENGUNJUNG MENDAPAT DATA BARU
    revalidateTag("bosses-data");

    // Broadcast data LENGKAP 1 boss saja via Pusher
    await pusherServer.trigger("boss-timer-k3", "boss-updated", { 
      type: "UPDATE", 
      boss: updatedBoss 
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// 3. EDIT DETAIL (PATCH)
export async function PATCH(req) {
  try {
    const body = await req.json();
    if (!body.id) return Response.json({ error: "ID required" }, { status: 400 });

    const result = await updateBossDetail(body);
    const updatedBoss = result[0];

    // ✅ REVALIDASI CACHE
    revalidateTag("bosses-data");

    await pusherServer.trigger("boss-timer-k3", "boss-updated", { 
      type: "UPDATE", 
      boss: updatedBoss 
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// 4. HAPUS BOSS (DELETE)
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return Response.json({ error: "ID required" }, { status: 400 });

    await deleteBoss(id);

    // ✅ REVALIDASI CACHE
    revalidateTag("bosses-data");

    await pusherServer.trigger("boss-timer-k3", "boss-updated", { 
      type: "DELETE", 
      id: parseInt(id) 
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}