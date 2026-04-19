"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import BossList from "@/components/boss/BossList";
import SalaryView from "@/components/salary/SalaryView"; // ✅ Pastikan file ini ada
import { useSound } from "@/context/SoundContext"; 

export default function HomePage() {
  const { unlockAudio, isUnlocked } = useSound(); 
  const searchParams = useSearchParams();
  
  // ✅ LOGIKA DETEKSI VIEW
  const currentView = searchParams.get("view") || "boss";

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

        <Suspense fallback={
          <div className="py-20 text-center text-zinc-500 uppercase text-[10px] tracking-widest animate-pulse">
            Initializing System
          </div>
        }>
          {/* ✅ SWITCHER KONTEN */}
          {currentView === "salary" ? (
            <SalaryView />
          ) : (
            <BossList />
          )}
        </Suspense>

      </div>
    </main>
  );
}