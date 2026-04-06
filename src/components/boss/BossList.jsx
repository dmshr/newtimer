"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation"; 
import { AnimatePresence } from "framer-motion";
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

  const filteredBosses = bosses.filter((boss) => {
    const matchesSearch = boss.name.toLowerCase().includes(query);
    const r = boss.rarity?.toLowerCase();
    const isVisibleInvasion = (r === "invasion" || r === "invasi") ? showInvasion : true;
    return matchesSearch && isVisibleInvasion;
  });

  return (
    <div className="flex flex-col gap-4">
      {/* ✅ KEMBALIKAN BG & ROUNDED SESUAI GAYA ASLI */}
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
            <div className="py-20 text-center text-gray-500 italic">
              {bosses.length === 0 ? "Loading data..." : `No boss found for "${query}"`}
            </div>
          )}
        </AnimatePresence>

        <BossModal boss={selectedBoss} onClose={() => setSelectedBoss(null)} onSaved={loadBosses} />
        <EditBossModal boss={editingBoss} onClose={() => setEditingBoss(null)} onSaved={loadBosses} />
        <DeleteBossModal boss={deletingBoss} onClose={() => setDeletingBoss(null)} onSaved={loadBosses} />
      </div>
    </div>
  );
}