"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation"; 
import { AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react"; // ✅ Import Session
import { pusherClient } from "@/lib/pusher";
import BossRow from "@/components/boss/BossRow";
import BossModal from "@/components/boss/BossModal";
import EditBossModal from "@/components/boss/EditBossModal";
import DeleteBossModal from "@/components/boss/DeleteBossModal";
import { fetchBosses } from "@/services/bossServices"; 
import { useInvasion } from "@/context/InvasionContext";

function sortBySpawn(bosses) {
  return [...bosses].sort((a, b) => {
    if (!a.spawn || a.spawn === "--:--:--") return 1;
    if (!b.spawn || b.spawn === "--:--:--") return -1;
    const timeA = new Date(a.spawn).getTime();
    const timeB = new Date(b.spawn).getTime();
    return timeA - timeB;
  });
}

export default function BossList() {
  const { data: session } = useSession(); // ✅ Ambil data session
  const userRole = session?.user?.role || "User";

  const [bosses, setBosses] = useState([]);
  const [selectedBoss, setSelectedBoss] = useState(null); 
  const [editingBoss, setEditingBoss] = useState(null);   
  const [deletingBoss, setDeletingBoss] = useState(null);
  
  const { showInvasion, resetTrigger } = useInvasion();
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.toLowerCase() || "";

  const loadBosses = useCallback(async () => {
    try {
      const data = await fetchBosses();
      setBosses(sortBySpawn(data));
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  }, []);

  useEffect(() => {
    if (resetTrigger > 0) {
      setBosses((prevBosses) =>
        prevBosses.map((boss) => {
          const r = boss.rarity?.toLowerCase();
          return (r === "invasion" || r === "invasi") ? { ...boss, spawn: "--:--:--", killed: "--:--:--" } : boss;
        })
      );
    }
  }, [resetTrigger]);

  useEffect(() => {
    loadBosses();
  }, [loadBosses]);

  useEffect(() => {
    const channel = pusherClient?.subscribe("boss-timer-k3");
    channel?.bind("boss-updated", () => { loadBosses(); });
    return () => {
      pusherClient?.unsubscribe("boss-timer-k3");
    };
  }, [loadBosses]);

  // ✅ LOGIKA FILTER ROLE & RARITY
  const filteredBosses = bosses.filter((boss) => {
    const r = boss.rarity?.toLowerCase();
    const matchesSearch = boss.name.toLowerCase().includes(query);
    
    // Filter 1: Toggle Invasion Global
    const isVisibleInvasion = (r === "invasion" || r === "invasi") ? showInvasion : true;

    // Filter 2: Mini Boss Visibility (Hanya SuperAdmin & Master yang bisa lihat)
    const isMiniBoss = r === "mini boss" || r === "miniboss";
    const canSeeMiniBoss = userRole === "SuperAdmin" || userRole === "Master";
    
    if (isMiniBoss && !canSeeMiniBoss) {
      return false; // User & Admin tidak akan bisa melihat Mini Boss
    }

    return matchesSearch && isVisibleInvasion;
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full bg-[#0f0f0f] rounded-2xl overflow-hidden min-h-[200px]">
        <AnimatePresence mode="popLayout">
          {filteredBosses.length > 0 ? (
            filteredBosses.map((boss) => (
              <BossRow
                key={boss.id}
                boss={boss}
                onSelect={setSelectedBoss}
                onEdit={setEditingBoss}
                onDelete={setDeletingBoss}
                animateInvasion={showInvasion} 
              />
            ))
          ) : (
            <div className="py-20 text-center text-zinc-600 italic text-[11px] uppercase tracking-widest">
              {bosses.length === 0 ? "Synchronizing data..." : `No active bosses for "${query}"`}
            </div>
          )}
        </AnimatePresence>

        <BossModal boss={selectedBoss} onClose={() => setSelectedBoss(null)} onSaved={loadBosses} />
        <EditBossModal boss={editingBoss} onClose={() => setEditingBoss(null)} onSaved={loadBosses} />
        <DeleteBossModal deletingBoss={deletingBoss} boss={deletingBoss} onClose={() => setDeletingBoss(null)} onSaved={loadBosses} />
      </div>
    </div>
  );
}