"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { updateBossDetail } from "@/services/bossServices";

export default function EditBossModal({ boss, onClose, onSaved }) {
  const [name, setName] = useState("");
  const [interval, setInterval] = useState("");
  const [rarity, setRarity] = useState("World");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (boss) {
      setName(boss.name || "");
      setInterval(boss.interval_hours || "1");
      setRarity(boss.rarity || "World");
    }
  }, [boss]);

  const getRarityClass = (variant) => {
    switch (variant?.toLowerCase()) {
      case 'invasi': case 'invasion': return 'text-orange-500 border-orange-900/50 shadow-[0_0_10px_rgba(249,115,22,0.1)]';
      case 'legendary': return 'text-purple-500 border-purple-900/50 shadow-[0_0_10px_rgba(168,85,247,0.1)]';
      case 'epic': return 'text-red-500 border-red-900/50 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]';
      case 'rare': return 'text-blue-400 border-blue-900/50 shadow-[0_0_10px_rgba(59,130,246,0.1)]';
      case 'world': return 'text-white border-zinc-700';
      case 'mini boss': return 'text-cyan-400 border-cyan-900/50 shadow-[0_0_10px_rgba(34,211,238,0.1)]'; // ✅ Tambah warna Mini Boss
      default: return 'text-zinc-300 border-zinc-800';
    }
  };

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
        <motion.div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] backdrop-blur-sm px-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div className="bg-[#0b0b0b] border border-zinc-800 w-full max-w-[360px] rounded-2xl p-6 relative shadow-2xl" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} onClick={(e) => e.stopPropagation()}>
            
            <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition">✕</button>

            <h2 className="text-[18px] text-red-600 font-black tracking-widest uppercase mb-1 text-center font-sans">Edit Boss</h2>
            <p className="text-center text-[10px] text-zinc-500 uppercase tracking-[0.3em] mb-6 font-bold font-sans">Attributes Configuration</p>

            <div className="space-y-5">
              <div>
                <label className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold mb-1.5 block ml-1">Boss Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black border border-zinc-900 rounded-lg px-3 py-2.5 text-sm text-white focus:border-red-800 outline-none transition font-semibold"
                />
              </div>

              <div>
                <label className="text-[9px] text-zinc-500 tracking-widest uppercase font-bold mb-1.5 block ml-1">Interval (Hours)</label>
                <input 
                  type="number" 
                  value={interval} 
                  onChange={(e) => setInterval(e.target.value)}
                  className="w-full bg-black border border-zinc-900 rounded-lg px-3 py-2.5 text-sm text-white focus:border-red-800 outline-none transition font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold mb-1.5 block ml-1">Boss Rarity</label>
                <div className="relative">
                  <select 
                    value={rarity} 
                    onChange={(e) => setRarity(e.target.value)}
                    className={`w-full bg-black border rounded-lg px-3 py-2.5 text-sm outline-none transition-all duration-300 font-bold appearance-none cursor-pointer ${getRarityClass(rarity)}`}
                  >
                    <option value="World" className="bg-black text-white">WORLD (WHITE)</option>
                    <option value="Rare" className="bg-black text-blue-400">RARE (BLUE)</option>
                    <option value="Epic" className="bg-black text-red-500">EPIC (RED)</option>
                    <option value="Legendary" className="bg-black text-purple-500">LEGENDARY (PURPLE)</option>
                    <option value="Invasi" className="bg-black text-orange-500">INVASI (ORANGE)</option>
                    <option value="Mini Boss" className="bg-black text-cyan-400">MINI BOSS (CYAN)</option> {/* ✅ Opsi Baru */}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[10px] opacity-30 text-white">▼</div>
                </div>
              </div>
            </div>

            <button 
              onClick={handleSave}
              disabled={isLoading}
              className="w-full mt-6 bg-red-800 hover:bg-red-700 text-white font-black py-3 rounded-lg text-[11px] uppercase tracking-widest shadow-lg shadow-red-900/20 transition-all disabled:opacity-50"
            >
              {isLoading ? "UPDATING..." : "SAVE CHANGES"}
            </button>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}