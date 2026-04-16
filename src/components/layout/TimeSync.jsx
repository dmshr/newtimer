"use client";

import { useEffect } from "react";
import { syncTime } from "@/lib/time";

export default function TimeSync() {
  useEffect(() => {
    // Jalankan sinkronisasi pertama kali
    syncTime();

    // Sinkronisasi ulang setiap 15 menit agar tetap presisi
    const interval = setInterval(syncTime, 900000);
    
    return () => clearInterval(interval);
  }, []);

  return null; // Tidak menampilkan apa-apa di UI
}