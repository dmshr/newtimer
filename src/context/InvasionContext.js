"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { pusherClient } from "@/lib/pusher";
import { 
  fetchInvasionStatusGlobal, 
  updateInvasionStatusGlobal, 
  resetInvasionGlobal 
} from "@/services/bossServices";

const InvasionContext = createContext();

export function InvasionProvider({ children }) {
  // ✅ 1. Inisialisasi sebagai FALSE (Default OFF) agar tidak menyala otomatis
  const [showInvasion, setShowInvasion] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [loading, setLoading] = useState(true);

  // 2. Ambil status global saat pertama kali aplikasi dimuat
  useEffect(() => {
    const initStatus = async () => {
      try {
        const data = await fetchInvasionStatusGlobal();
        // Pastikan data ada sebelum set state
        if (data && typeof data.showInvasion === 'boolean') {
          setShowInvasion(data.showInvasion);
        }
      } catch (err) {
        console.error("Failed to fetch global invasion status:", err);
      } finally {
        setLoading(false);
      }
    };

    initStatus();

    // 3. Mendengarkan Sinyal Global dari Pusher
    // Pastikan channel name sinkron dengan yang ada di API (misal: boss-timer-k3)
    const channel = pusherClient?.subscribe("boss-timer-k3");

    // Sinyal jika ada orang lain/Master yang mengubah ON/OFF
    // Kita gunakan event 'setting-updated' agar sinkron dengan repo GlobalSetting
    channel?.bind("setting-updated", (data) => {
      if (data.key === "showInvasion") {
        setShowInvasion(data.value === true || data.value === "true");
      }
    });

    // Sinyal jika ada orang lain yang menekan RESET
    channel?.bind("invasion-reset", () => {
      setResetTrigger((prev) => prev + 1);
    });

    return () => {
      pusherClient?.unsubscribe("boss-timer-k3");
    };
  }, []);

  // 4. Fungsi untuk Mengubah Status secara GLOBAL (Untuk Admin/Master)
  const handleSetShowInvasion = async (status) => {
    try {
      // Update lokal (Optimistic)
      setShowInvasion(status);
      // Simpan ke Database Neon & Broadcast via Pusher
      await updateInvasionStatusGlobal(status);
    } catch (err) {
      console.error("Error updating global status:", err);
      // Rollback jika gagal
      const data = await fetchInvasionStatusGlobal();
      setShowInvasion(data.showInvasion);
    }
  };

  // 5. Fungsi untuk Reset secara GLOBAL
  const handleTriggerReset = async () => {
    try {
      await resetInvasionGlobal();
      // Reset trigger lokal akan diupdate via bind "invasion-reset" di atas
    } catch (err) {
      console.error("Error triggering global reset:", err);
    }
  };

  return (
    <InvasionContext.Provider 
      value={{ 
        showInvasion, 
        setShowInvasion: handleSetShowInvasion, 
        resetTrigger, 
        triggerReset: handleTriggerReset,
        loading // Bisa digunakan untuk skeleton/spinner jika perlu
      }}
    >
      {children}
    </InvasionContext.Provider>
  );
}

export const useInvasion = () => useContext(InvasionContext);