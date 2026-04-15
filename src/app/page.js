"use client";

import { Suspense } from "react";
import BossList from "@/components/boss/BossList";
import AnnouncementBar from "@/components/boss/AnnouncementBar"; // ✅ 1. Import Komponen
import { useSound } from "@/context/SoundContext"; 

export default function HomePage() {
  const { unlockAudio, isUnlocked } = useSound(); 

  return (
    <main
      onClick={unlockAudio}
      style={{ paddingTop: "var(--header-height)" }}
      className="min-h-screen bg-[#0b0b0b] text-white px-3 md:px-6 transition-all duration-300 ease-in-out cursor-default"
    >
      <div className="max-w-5xl mx-auto pb-10">
        
        {!isUnlocked && (
          <div className="text-center mb-4">
            <span className="text-[10px] text-zinc-600 uppercase tracking-[0.2em] animate-pulse">
              Click anywhere to enable audio
            </span>
          </div>
        )}

        {/* ✅ 2. Letakkan AnnouncementBar tepat di atas BossList */}
        <AnnouncementBar />

        {/* BossList otomatis mendeteksi InvasionProvider dari layout.js */}
        <Suspense fallback={
          <div className="py-20 text-center text-zinc-500 uppercase text-[10px] tracking-widest animate-pulse">
            Initializing System
          </div>
        }>
          <BossList />
        </Suspense>

      </div>
    </main>
  );
}