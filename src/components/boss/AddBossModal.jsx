"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { updateBoss } from "@/services/bossServices";

export default function AddBossModal({ isOpen, onClose, onSaved }) {
  const [name, setName] = useState("");
  const [interval, setInterval] = useState("1");
  const [isLoading, setIsLoading] = useState(false);

  // --- FUNGSI notifyUpdate TELAH DIHAPUS KARENA SUDAH DIHANDLE BACKEND ---

  async function handleAdd() {
    if (!name.trim()) return alert("Boss Name is required!");
    
    const intervalNum = parseInt(interval);
    if (isNaN(intervalNum) || intervalNum < 1) {
      return alert("Interval must be a number (minimum 1 hour)!");
    }

    setIsLoading(true);
    try {
      // 1. Simpan ke database via Service
      // API Backend otomatis akan memicu Pusher untuk user lain
      await updateBoss({
        name: name.trim(),
        interval_hours: intervalNum,
        spawn: "--:--:--",
        killed: null
      });
      
      // 2. Update UI lokal secara instan
      if (onSaved) await onSaved();

      // 3. Reset & Close
      setName("");
      setInterval("1");
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
        <motion.div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] px-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-[#0b0b0b] border border-red-900/40 w-full max-w-[340px] rounded-2xl p-5 md:p-7 relative shadow-2xl shadow-red-950/30"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-black text-red-600 mb-1 text-center uppercase tracking-widest">
              Add New Boss
            </h2>
            <p className="text-center text-gray-500 text-[10px] mb-6 uppercase tracking-widest opacity-70">
              Configure spawn settings
            </p>

            <div className="space-y-5">
              <div className="relative">
                <label className="absolute -top-2 left-3 bg-[#0b0b0b] px-1.5 text-[10px] text-gray-500 uppercase tracking-wider z-10">
                  Boss Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Basila"
                  disabled={isLoading}
                  className="w-full bg-black border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-red-700 outline-none transition placeholder-gray-800 text-base font-bold"
                  autoFocus
                />
              </div>

              <div className="relative">
                <label className="absolute -top-2 left-3 bg-[#0b0b0b] px-1.5 text-[10px] text-gray-500 uppercase tracking-wider z-10">
                  Respawn Interval (Hours)
                </label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    min="1"
                    value={interval}
                    onChange={(e) => setInterval(e.target.value)}
                    disabled={isLoading}
                    className="w-full bg-black border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-red-700 outline-none transition text-base font-bold font-mono"
                  />
                  <span className="absolute right-9 text-gray-600 font-bold uppercase text-[10px]">
                    HRS
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-8">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-500 font-bold py-2.5 rounded-lg transition uppercase tracking-wider text-[11px] disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  disabled={isLoading}
                  className="w-full bg-red-700 hover:bg-red-600 text-white font-extrabold py-2.5 rounded-lg transition shadow-md shadow-red-900/20 uppercase tracking-wider text-[11px] disabled:opacity-50"
                >
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