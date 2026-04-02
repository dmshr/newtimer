"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation"; 
import { AnimatePresence } from "framer-motion";
import Pusher from "pusher-js"; // ✅ 1. Import Pusher Client
import BossRow from "@/components/boss/BossRow";
import BossModal from "@/components/boss/BossModal";
import { fetchBosses } from "@/services/bossServices";

function sortBySpawn(bosses) {
  return [...bosses].sort((a, b) => {
    if (!a.spawn || a.spawn === "--:--:--") return 1;
    if (!b.spawn || b.spawn === "--:--:--") return -1;
    return a.spawn.localeCompare(b.spawn);
  });
}

export default function BossList() {
  const [bosses, setBosses] = useState([]);
  const [selectedBoss, setSelectedBoss] = useState(null);
  
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.toLowerCase() || "";

  const loadBosses = useCallback(async () => {
    try {
      const data = await fetchBosses();
      setBosses(sortBySpawn(data));
    } catch (err) {
      console.error(err);
    }
  }, []);

  // Effect Utama: Ambil data saat halaman pertama dimuat
  useEffect(() => {
    loadBosses();
  }, [loadBosses]);

  // ✅ 2. EFFECT REAL-TIME: Mendengarkan Sinyal dari Pusher
  useEffect(() => {
    // Inisialisasi koneksi Pusher
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    });

    // Berlangganan ke channel yang sama dengan backend
    const channel = pusher.subscribe("boss-channel");

    // Tangkap event 'boss-updated'
    channel.bind("boss-updated", () => {
      console.log("⚡ Data update detected! Syncing with Neon...");
      loadBosses(); // Otomatis tarik data terbaru dari database
    });

    // Cleanup: Putus koneksi jika halaman ditutup agar tidak memakan kuota Pusher
    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [loadBosses]);

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
              onSelect={setSelectedBoss}
            />
          ))
        ) : (
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