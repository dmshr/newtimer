import Pusher from "pusher";
import { NextResponse } from "next/server";

// Inisialisasi Pusher Server
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
  useTLS: true,
});

export async function POST(request) {
  try {
    const { message } = await request.json();

    // Mengirim sinyal ke channel 'boss-channel' dengan event 'boss-updated'
    await pusher.trigger("boss-channel", "boss-updated", {
      message: message || "Data updated",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Pusher Trigger Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}