"use client";

import { useEffect, useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import BossRow from "@/components/boss/BossRow";
import BossModal from "@/components/boss/BossModal";
import { fetchBosses } from "@/services/bossServices";

function sortBySpawn(bosses) {
  return [...bosses].sort((a, b) => {
    if (!a.spawn) return 1;
    if (!b.spawn) return -1;
    return a.spawn.localeCompare(b.spawn);
  });
}

export default function BossList() {
  const [bosses, setBosses] = useState([]);
  const [selectedBoss, setSelectedBoss] = useState(null);

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

  return (
    <div className="w-full bg-[#0f0f0f] rounded-2xl mt-4 overflow-hidden">
      <AnimatePresence>
        {bosses.map((boss) => (
          <BossRow
            key={boss.id}
            boss={boss}
            onSelect={setSelectedBoss}
          />
        ))}
      </AnimatePresence>

      <BossModal
        boss={selectedBoss}
        onClose={() => setSelectedBoss(null)}
        onSaved={loadBosses}
      />
    </div>
  );
}