"use client";

import BossList from "@/components/boss/BossList";
import { useSound } from "@/context/SoundContext"; // ✅ Import hook suara

export default function HomePage() {
  const { unlockAudio, isUnlocked } = useSound(); // ✅ Ambil fungsi unlock

  return (
    <main
      // ✅ Klik pertama di mana saja pada halaman akan mengaktifkan izin suara browser
      onClick={unlockAudio}
      style={{ paddingTop: "var(--header-height)" }}
      className="min-h-screen bg-[#0b0b0b] text-white px-3 md:px-6 transition-all duration-300 ease-in-out cursor-default"
    >
      {/* Container utama dengan max-width agar rapi di desktop */}
      <div className="max-w-5xl mx-auto pb-10">
        
        {/* Opsional: Indikator kecil jika suara belum aktif */}
        {!isUnlocked && (
          <div className="text-center mb-4">
            <span className="text-[10px] text-zinc-600 uppercase tracking-[0.2em] animate-pulse">
              Click anywhere to initialize system audio
            </span>
          </div>
        )}

        <BossList />
      </div>
    </main>
  );
}