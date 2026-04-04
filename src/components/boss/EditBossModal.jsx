"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { updateBossDetail } from "@/services/bossServices";

export default function EditBossModal({ boss, onClose, onSaved }) {
  const [name, setName] = useState("");
  const [interval, setInterval] = useState("");
  const [rarity, setRarity] = useState("Blue");
  const [isLoading, setIsLoading] = useState(false);

  // ✅ POINT 4: Isi data otomatis saat modal dibuka (Pre-filled)
  useEffect(() => {
    if (boss) {
      setName(boss.name || "");
      setInterval(boss.interval_hours || "1");
      setRarity(boss.rarity || "Blue");
    }
  }, [boss]);

  const handleSave = async () => {
    if (!name.trim()) return alert("Name cannot be empty");
    
    setIsLoading(true);
    try {
      await updateBossDetail({
        id: boss.id,
        name: name.trim(),
        interval_hours: interval,
        rarity: rarity
      });
      if (onSaved) await onSaved();
      onClose();
    } catch (err) {
      alert("Failed to update boss detail");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {boss && (
        <motion.div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div className="bg-[#0b0b0b] border border-zinc-800 w-full max-w-[360px] rounded-2xl p-6 relative shadow-2xl" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} onClick={(e) => e.stopPropagation()}>
            
            <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition">✕</button>

            <h2 className="text-[18px] text-red-600 font-black tracking-widest uppercase mb-1 text-center">Edit Boss</h2>
            <p className="text-center text-[10px] text-zinc-500 uppercase tracking-[0.3em] mb-4 font-bold"></p>

            <div className="space-y-4">
              {/* 1. Edit Name */}
              <div>
                <label className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold mb-1 block ml-1">Boss Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black border border-zinc-900 rounded-lg px-3 py-1 text-sm text-white focus:border-red-800 outline-none transition font-semibold"
                />
              </div>

              {/* 2. Edit Interval */}
              <div>
                <label className="text-[9px] text-zinc-500 tracking-widest uppercase font-bold mb-1 block ml-1">Interval (Hours)</label>
                <input 
                  type="number" 
                  value={interval} 
                  onChange={(e) => setInterval(e.target.value)}
                  className="w-full bg-black border border-zinc-900 rounded-lg px-3 py-1 text-sm text-white focus:border-red-800 outline-none transition font-mono font-bold"
                />
              </div>

              {/* 3. Edit Rarity */}
              <div>
                <label className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold mb-1 block ml-1">Boss Rarity</label>
                <select 
                  value={rarity} 
                  onChange={(e) => setRarity(e.target.value)}
                  className="w-full bg-black border border-zinc-900 rounded-lg px-3 py-1 text-sm text-white focus:border-red-800 outline-none transition font-semibold appearance-none cursor-pointer"
                >
                  <option value="Blue" className="text-blue-400">BLUE</option>
                  <option value="Red" className="text-red-500">RED</option>
                  <option value="Purple" className="text-purple-500">PURPLE</option>
                </select>
              </div>
            </div>

            <button 
              onClick={handleSave}
              disabled={isLoading}
              className="w-full mt-4 bg-red-800 hover:bg-red-700 text-white font-black py-2 rounded-lg text-[11px] uppercase tracking-widest shadow-lg shadow-red-900/20 transition-all disabled:opacity-50"
            >
              {isLoading ? "UPDATING..." : "SAVE CHANGES"}
            </button>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}