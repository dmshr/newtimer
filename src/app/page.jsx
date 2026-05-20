"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import BossList from "@/components/boss/BossList";
import SalaryView from "@/components/salary/SalaryView";
import { useSound } from "@/context/SoundContext"; 
import { pusherClient } from "@/lib/pusher";

function HomeContent() {
  const searchParams = useSearchParams();
  const currentView = searchParams.get("view") || "boss";

  return currentView === "salary" ? <SalaryView /> : <BossList />;
}

export default function HomePage() {
  const { unlockAudio, isUnlocked } = useSound(); 

  // State Peringatan (Otomatis False saat halaman baru diload/refresh)
  const [showUpdateWarning, setShowUpdateWarning] = useState(false);

  // 🎧 Telinga Pendengar Sinyal Pusher
  useEffect(() => {
    const channel = pusherClient?.subscribe("boss-timer-k3");
    
    // Jika mendengar teriakan "force-refresh" dari Master, munculkan tulisan!
    channel?.bind("force-refresh", () => {
      setShowUpdateWarning(true);
    });

    return () => {
      pusherClient?.unsubscribe("boss-timer-k3");
    };
  }, []);

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

        {/* ─── TULISAN PERINGATAN UPDATE MUNCUL DI SINI ────────────────── */}
        {showUpdateWarning && (
          <div 
            onClick={() => window.location.reload()} // Klik untuk refresh seketika
            className="text-center py-3 mb-4 bg-red-950/40 border border-red-900/50 rounded-xl cursor-pointer hover:bg-red-900/60 transition-colors"
          >
            <span className="text-[11px] md:text-sm text-red-500 font-black uppercase tracking-[0.15em] animate-pulse drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]">
              🚨 New Web Update! Please Refresh Your Page Now! 🚨
            </span>
          </div>
        )}

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