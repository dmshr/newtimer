import { 
  saveBoss, 
  getAllBosses, 
  updateBossDetail, 
  deleteBoss 
} from "@/repositories/bossRepository";
import { pusherServer } from "@/lib/pusher";

export const dynamic = "force-dynamic";

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
    const updatedBoss = result[0];

    // Broadcast data lengkap (Payload)
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

    // Broadcast ID yang dihapus
    await pusherServer.trigger("boss-timer-k3", "boss-updated", { 
      type: "DELETE", 
      id: parseInt(id) 
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}