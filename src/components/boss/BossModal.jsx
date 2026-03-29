"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { updateBoss } from "@/services/bossServices";

export default function BossModal({ boss, onClose, onSaved }) {
  const [killedInput, setKilledInput] = useState("");

  useEffect(() => {
    if (boss) {
      setKilledInput(boss.killed || "");
    }
  }, [boss]);

  async function handleSave() {
    if (!boss) return;

    await updateBoss({
      name: boss.name,
      spawn: boss.spawn,
      killed: killedInput,
    });

    await onSaved();
    onClose();
  }

  async function handleJustNow() {
    if (!boss) return;

    const now = new Date().toISOString();

    await updateBoss({
      name: boss.name,
      spawn: boss.spawn,
      killed: now,
    });

    await onSaved();
    onClose();
  }

  return (
    <AnimatePresence>
      {boss && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-[#0b0b0b] w-[320px] rounded-2xl p-6 relative"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-400 hover:text-red-400"
            >
              ✕
            </button>

            <div className="text-center text-lg font-semibold mb-4">
              {boss.name}
            </div>

            <div className="text-center text-sm text-gray-400 mb-2">
              Time Killed
            </div>

            <input
              value={killedInput}
              onChange={(e) => setKilledInput(e.target.value)}
              className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-sm mb-4"
            />

            <button
              onClick={handleSave}
              className="w-full bg-red-700 hover:bg-red-600 py-2 rounded-lg mb-4"
            >
              Save
            </button>

            <div className="h-0.5 bg-linear-to-r from-transparent via-red-500 to-transparent mb-4" />

            <div className="flex gap-3">
              <button className="flex-1 bg-gray-800 py-2 rounded-lg text-sm">
                Not Spawn
              </button>
              <button
                onClick={handleJustNow}
                className="flex-1 bg-green-700 py-2 rounded-lg text-sm"
              >
                Just Now
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}