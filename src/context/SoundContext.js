"use client";
import { createContext, useContext, useState, useRef } from "react";

const SoundContext = createContext();

export function SoundProvider({ children }) {
  const [volume, setVolume] = useState(50);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const audioRef = useRef(null);

  const unlockAudio = () => {
    if (isUnlocked) return;

    // Inisialisasi audio object jika belum ada
    if (!audioRef.current) {
      audioRef.current = new Audio("/sounds/alert.mp3");
    }

    // Pancing browser dengan play & pause untuk bypass kebijakan Autoplay
    audioRef.current.play()
      .then(() => {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsUnlocked(true);
        console.log("🔊 Audio System: UNLOCKED");
      })
      .catch((err) => {
        console.error("❌ Audio System: Failed to unlock", err);
      });
  };

  const playAlert = () => {
    if (!audioRef.current || !isUnlocked) {
      console.warn("⚠️ Cannot play: System locked or Audio not initialized");
      return;
    }

    // Ambil nilai volume terbaru (0.0 sampai 1.0)
    const currentVolume = volume / 100;
    audioRef.current.volume = currentVolume;

    // --- BUNYI PERTAMA ---
    audioRef.current.currentTime = 0;
    audioRef.current.play()
      .then(() => {
        // --- BUNYI KEDUA (Dijalankan setelah jeda 1.5 detik) ---
        // Jeda ini memastikan suara pertama terdengar jelas sebelum diulang
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(e => console.error("Playback 2 error:", e));
          }
        }, 1500); // 1500ms = 1.5 detik. Sesuaikan dengan panjang file mp3 kamu.
      })
      .catch(e => console.error("Playback 1 error:", e));
  };

  return (
    <SoundContext.Provider value={{ volume, setVolume, playAlert, unlockAudio, isUnlocked }}>
      {children}
    </SoundContext.Provider>
  );
}

export const useSound = () => useContext(SoundContext);