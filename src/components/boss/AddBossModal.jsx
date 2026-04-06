"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { updateBoss } from "@/services/bossServices";

export default function AddBossModal({ isOpen, onClose, onSaved }) {
  const [name, setName] = useState("");
  const [interval, setInterval] = useState("1");
  const [rarity, setRarity] = useState("World");
  const [isLoading, setIsLoading] = useState(false);

  // Helper Warna sesuai BossRow.jsx
  const getRarityClass = (variant) => {
    switch (variant?.toLowerCase()) {
      case 'invasi': return 'text-orange-500 border-orange-900/50 shadow-[0_0_10px_rgba(249,115,22,0.1)]';
      case 'legendary': return 'text-purple-500 border-purple-900/50 shadow-[0_0_10px_rgba(168,85,247,0.1)]';
      case 'epic': return 'text-red-500 border-red-900/50 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]';
      case 'rare': return 'text-blue-400 border-blue-900/50 shadow-[0_0_10px_rgba(59,130,246,0.1)]';
      case 'world': return 'text-white border-zinc-700';
      default: return 'text-zinc-300 border-zinc-800';
    }
  };

  async function handleAdd() {
    if (!name.trim()) return alert("Boss Name is required!");
    
    const intervalNum = parseInt(interval);
    if (isNaN(intervalNum) || intervalNum < 1) {
      return alert("Interval must be a number (minimum 1 hour)!");
    }

    setIsLoading(true);
    try {
      await updateBoss({
        name: name.trim(),
        interval_hours: intervalNum,
        spawn: "--:--:--",
        killed: null,
        rarity: rarity
      });
      
      if (onSaved) await onSaved();

      setName("");
      setInterval("1");
      setRarity("World");
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to add boss. Make sure the name is unique.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] px-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div className="bg-[#0b0b0b] border border-red-900/40 w-full max-w-[340px] rounded-2xl p-6 md:p-8 relative shadow-2xl shadow-red-950/30" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()}>
            
            <h2 className="text-xl font-black text-red-600 mb-1 text-center uppercase tracking-widest font-sans">Add New Boss</h2>
            <p className="text-center text-gray-500 text-[10px] mb-8 uppercase tracking-widest opacity-70 font-sans font-bold">Configure spawn settings</p>

            <div className="space-y-6">
              <div className="relative">
                <label className="absolute -top-2 left-3 bg-[#0b0b0b] px-1.5 text-[10px] text-gray-500 uppercase tracking-wider z-10 font-bold">Boss Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Basila"
                  disabled={isLoading}
                  className="w-full bg-black border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-red-700 outline-none transition placeholder-gray-900 text-base font-bold"
                  autoFocus
                />
              </div>

              <div className="relative">
                <label className="absolute -top-2 left-3 bg-[#0b0b0b] px-1.5 text-[10px] text-gray-500 uppercase tracking-wider z-10 font-bold">Respawn Interval (Hours)</label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    min="1"
                    value={interval}
                    onChange={(e) => setInterval(e.target.value)}
                    disabled={isLoading}
                    className="w-full bg-black border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-red-700 outline-none transition text-base font-bold font-mono"
                  />
                  <span className="absolute right-12 text-zinc-600 font-black uppercase text-[10px]">HRS</span>
                </div>
              </div>

              {/* Input Rarity Sesuai Kategori Kamu */}
              <div className="relative">
                <label className="absolute -top-2 left-3 bg-[#0b0b0b] px-1.5 text-[10px] text-gray-500 uppercase tracking-wider z-10 font-bold">Boss Rarity</label>
                <div className="relative">
                  <select 
                    value={rarity} 
                    onChange={(e) => setRarity(e.target.value)}
                    disabled={isLoading}
                    className={`w-full bg-black border rounded-lg px-4 py-3 text-sm outline-none transition-all duration-300 font-bold appearance-none cursor-pointer ${getRarityClass(rarity)}`}
                  >
                    <option value="World" className="bg-black text-white">WORLD (WHITE)</option>
                    <option value="Rare" className="bg-black text-blue-400">RARE (BLUE)</option>
                    <option value="Epic" className="bg-black text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]">EPIC (RED)</option>
                    <option value="Legendary" className="bg-black text-purple-500">LEGENDARY (PURPLE)</option>
                    <option value="Invasi" className="bg-black text-orange-500">INVASI (ORANGE)</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[10px] opacity-30 text-white">▼</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <button onClick={onClose} disabled={isLoading} className="w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-500 font-bold py-3 rounded-lg transition uppercase tracking-wider text-[11px] disabled:opacity-50">Cancel</button>
                <button onClick={handleAdd} disabled={isLoading} className="w-full bg-red-700 hover:bg-red-600 text-white font-extrabold py-3 rounded-lg transition shadow-md shadow-red-900/20 uppercase tracking-wider text-[11px] disabled:opacity-50">
                  {isLoading ? "Saving..." : "Save Boss"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}