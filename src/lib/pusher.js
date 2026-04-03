import Pusher from "pusher";
import PusherClient from "pusher-js";

// 1. SISI SERVER (Aman untuk API Route)
export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
  useTLS: true,
});

// 2. SISI CLIENT (Aman dari Error Server-side)
// Kita buat pengecekan: Jika bukan di browser, jangan inisialisasi dulu
export const pusherClient = 
  typeof window !== "undefined" 
    ? new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
      })
    : null;