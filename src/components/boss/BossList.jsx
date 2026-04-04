"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation"; 
import { AnimatePresence } from "framer-motion";
import { pusherClient } from "@/lib/pusher";
import BossRow from "@/components/boss/BossRow";
import BossModal from "@/components/boss/BossModal";
import EditBossModal from "@/components/boss/EditBossModal"; // ✅ Import Modal Baru (Akan kita buat)
import { fetchBosses, deleteBoss } from "@/services/bossServices"; // ✅ Tambah deleteBoss

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
  const [selectedBoss, setSelectedBoss] = useState(null); // Untuk Update Timer (💀)
  const [editingBoss, setEditingBoss] = useState(null);   // ✅ Untuk Edit Detail (⋮)
  
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
    loadBosses();
  }, [loadBosses]);

  useEffect(() => {
    const channel = pusherClient?.subscribe("boss-timer-k3");
    channel?.bind("boss-updated", () => {
      loadBosses(); 
    });

    return () => {
      channel?.unbind("boss-updated");
      pusherClient?.unsubscribe("boss-timer-k3");
    };
  }, [loadBosses]);

  // ✅ FUNGSI DELETE
  const handleDelete = async (name) => {
    try {
      await deleteBoss(name);
      await loadBosses(); // Refresh list setelah hapus
    } catch (err) {
      alert("Failed to delete boss");
    }
  };

  const filteredBosses = bosses.filter((boss) =>
    boss.name.toLowerCase().includes(query)
  );

  return (
    <div className="w-full bg-[#0f0f0f] rounded-2xl mt-4 overflow-hidden min-h-[200px]">
      <AnimatePresence mode="popLayout">
        {filteredBosses.length > 0 ? (
          filteredBosses.map((boss) => (
            <BossRow
              key={boss.id}
              boss={boss}
              onSelect={setSelectedBoss} // Klik Tengkorak
              onEdit={setEditingBoss}     // ✅ Klik Edit di Titik 3
              onDelete={handleDelete}    // ✅ Klik Delete di Titik 3
            />
          ))
        ) : (
          <div className="py-20 text-center text-gray-500 italic">
            {bosses.length === 0 ? "Loading data..." : `No boss found for "${query}"`}
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 1: Update Timer (Tengkorak) */}
      <BossModal
        boss={selectedBoss}
        onClose={() => setSelectedBoss(null)}
        onSaved={loadBosses}
      />

      {/* ✅ MODAL 2: Edit Detail Boss (Titik 3) */}
      <EditBossModal
        boss={editingBoss}
        onClose={() => setEditingBoss(null)}
        onSaved={loadBosses}
      />
    </div>
  );
}