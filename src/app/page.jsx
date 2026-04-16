"use client";

import { Suspense } from "react";
import BossList from "@/components/boss/BossList";
import { useSound } from "@/context/SoundContext"; 

export default function HomePage() {
  const { unlockAudio, isUnlocked } = useSound(); 

  return (
    <main
      onClick={unlockAudio}
      /**
       * ✅ SOLUSI: 
       * Tambahkan 'pt-3' atau 'pt-4' untuk memberi jarak sedikit 
       * antara TableHeader (yang sticky) dengan isi BossRow.
       */
      className="min-h-screen bg-[#0b0b0b] text-white px-3 md:px-4 cursor-default relative z-0 pt-3"
    >
      <div className="max-w-5xl mx-auto pb-10">
        
        {!isUnlocked && (
          <div className="text-center py-2">
            <span className="text-[10px] text-zinc-600 uppercase tracking-[0.2em] animate-pulse">
              Click anywhere to enable audio
            </span>
          </div>
        )}

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