"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import BossList from "@/components/boss/BossList";
import SalaryView from "@/components/salary/SalaryView";
import { useSound } from "@/context/SoundContext"; 

// ✅ Komponen pembantu untuk menangani logika searchParams
function HomeContent() {
  const searchParams = useSearchParams();
  const currentView = searchParams.get("view") || "boss";

  return currentView === "salary" ? (
    <SalaryView />
  ) : (
    <BossList />
  );
}

export default function HomePage() {
  const { unlockAudio, isUnlocked } = useSound(); 

  return (
    <main
      onClick={unlockAudio}
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

        {/* ✅ Sekarang seluruh konten yang menggunakan useSearchParams dibungkus Suspense */}
        <Suspense fallback={
          <div className="py-20 text-center text-zinc-500 uppercase text-[10px] tracking-widest animate-pulse">
            Initializing System
          </div>
        }>
          <HomeContent />
        </Suspense>

      </div>
    </main>
  );
}