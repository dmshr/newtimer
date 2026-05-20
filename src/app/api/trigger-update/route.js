import { NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher"; 

export async function POST() {
  try {
    // Menembakkan sinyal 'force-refresh' ke channel 'boss-timer-k3'
    await pusherServer.trigger("boss-timer-k3", "force-refresh", {
      message: "New update! Please Refresh your page!"
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}