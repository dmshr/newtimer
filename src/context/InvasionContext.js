"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { pusherClient } from "@/lib/pusher"; // ✅ Import Pusher
import { 
  fetchInvasionStatusGlobal, 
  updateInvasionStatusGlobal, 
  resetInvasionGlobal 
} from "@/services/bossServices"; // ✅ Import Services

const InvasionContext = createContext();

export function InvasionProvider({ children }) {
  const [showInvasion, setShowInvasion] = useState(true);
  const [resetTrigger, setResetTrigger] = useState(0);

  // 1. Ambil status global saat pertama kali aplikasi dimuat
  useEffect(() => {
    const initStatus = async () => {
      try {
        const data = await fetchInvasionStatusGlobal();
        setShowInvasion(data.showInvasion);
      } catch (err) {
        console.error("Failed to fetch global invasion status:", err);
      }
    };
    initStatus();

    // 2. Mendengarkan Sinyal Global dari Pusher
    const channel = pusherClient?.subscribe("global-settings");

    // Sinyal jika ada orang lain yang mengubah ON/OFF
    channel?.bind("status-changed", (data) => {
      setShowInvasion(data.showInvasion);
    });

    // Sinyal jika ada orang lain yang menekan RESET
    channel?.bind("invasion-reset", () => {
      setResetTrigger((prev) => prev + 1);
    });

    return () => {
      pusherClient?.unsubscribe("global-settings");
    };
  }, []);

  // 3. Fungsi untuk Mengubah Status secara GLOBAL
  const handleSetShowInvasion = async (status) => {
    try {
      // Update lokal dulu agar UI terasa instan (Optimistic Update)
      setShowInvasion(status);
      // Kirim ke Database & Trigger Pusher via API
      await updateInvasionStatusGlobal(status);
    } catch (err) {
      console.error("Error updating global status:", err);
    }
  };

  // 4. Fungsi untuk Reset secara GLOBAL
  const handleTriggerReset = async () => {
    try {
      // Panggil API untuk hapus waktu di Neon & Trigger Pusher
      await resetInvasionGlobal();
    } catch (err) {
      console.error("Error triggering global reset:", err);
    }
  };

  return (
    <InvasionContext.Provider 
      value={{ 
        showInvasion, 
        setShowInvasion: handleSetShowInvasion, // ✅ Sekarang Global
        resetTrigger, 
        triggerReset: handleTriggerReset       // ✅ Sekarang Global
      }}
    >
      {children}
    </InvasionContext.Provider>
  );
}

export const useInvasion = () => useContext(InvasionContext);