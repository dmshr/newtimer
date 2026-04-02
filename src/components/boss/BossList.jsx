"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation"; // ✅ Pastikan ini digunakan
import { AnimatePresence } from "framer-motion";
import BossRow from "@/components/boss/BossRow";
import BossModal from "@/components/boss/BossModal";
import { fetchBosses } from "@/services/bossServices";

function sortBySpawn(bosses) {
  return [...bosses].sort((a, b) => {
    if (!a.spawn || a.spawn === "--:--:--") return 1; //
    if (!b.spawn || b.spawn === "--:--:--") return -1; //
    return a.spawn.localeCompare(b.spawn);
  });
}

export default function BossList() {
  const [bosses, setBosses] = useState([]);
  const [selectedBoss, setSelectedBoss] = useState(null);
  
  // ✅ 1. Inisialisasi searchParams untuk mengambil query 'q' dari URL
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.toLowerCase() || ""; //

  const loadBosses = useCallback(async () => {
    try {
      const data = await fetchBosses();
      setBosses(sortBySpawn(data));
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    loadBosses();
  }, [loadBosses]);

  // ✅ 2. Filter data boss berdasarkan nama yang diketik di search bar
  const filteredBosses = bosses.filter((boss) =>
    boss.name.toLowerCase().includes(query)
  ); //

  return (
    <div className="w-full bg-[#0f0f0f] rounded-2xl mt-4 overflow-hidden min-h-[200px]">
      <AnimatePresence mode="popLayout"> {/* ✅ popLayout membuat transisi filter lebih mulus */}
        {/* ✅ 3. Mapping data dari filteredBosses, bukan lagi langsung dari bosses */}
        {filteredBosses.length > 0 ? (
          filteredBosses.map((boss) => (
            <BossRow
              key={boss.id}
              boss={boss}
              onSelect={setSelectedBoss}
            />
          ))
        ) : (
          /* ✅ Feedback jika boss tidak ditemukan */
          <div className="py-20 text-center text-gray-500 italic">
            {bosses.length === 0 ? "Loading data..." : `No boss found for "${query}"`}
          </div>
        )}
      </AnimatePresence>

      <BossModal
        boss={selectedBoss}
        onClose={() => setSelectedBoss(null)}
        onSaved={loadBosses}
      />
    </div>
  );
}