"use client";

import { motion, AnimatePresence } from "framer-motion"; 
import { useEffect, useState } from "react";
import { getCountdown } from "@/lib/time";
import { useSound } from "@/context/SoundContext";

const rowVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export default function BossRow({ boss, onSelect }) {
  const [time, setTime] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { playAlert } = useSound();
  const [hasAlerted, setHasAlerted] = useState(false);

  const formatOnlyTime = (fullStr) => {
    if (!fullStr || fullStr === "--:--:--") return "--:--:--";
    const parts = fullStr.split(" ");
    return parts[parts.length - 1];
  };

  // ✅ EFFECT 1: Update Timer setiap detik
  useEffect(() => {
    const update = () => {
      const targetDate = boss.spawn && boss.spawn.includes(" ") 
        ? new Date(boss.spawn) 
        : boss.spawn;
      
      setTime(getCountdown(targetDate));
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [boss.spawn]);

  // ✅ EFFECT 2: Trigger Sound Alert (Pengecekan setiap detik)
  useEffect(() => {
    if (time && time.seconds === 119 && !hasAlerted) {
      playAlert();
      setHasAlerted(true); 
    }
    
    // Reset status alert jika waktu di-update kembali ke atas 2 menit
    if (time && time.seconds >= 120) {
      setHasAlerted(false);
    }
  }, [time?.seconds, hasAlerted, playAlert]);

  if (!time) {
    return (
      <div className="grid grid-cols-3 px-4 py-4 opacity-0 font-inter">
        loading...
      </div>
    );
  }

  const { label, seconds } = time;
  const isUrgent = seconds > 0 && seconds < 120;
  // ✅ LOGIKA BARU: Cek jika statusnya SPAWNED
  const isSpawned = label === "SPAWNED";

  return (
    <motion.div
      layout
      variants={rowVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.25 }}
      className="grid grid-cols-[80px_1fr_130px] md:grid-cols-[140px_1fr_190px] gap-2 px-2 md:px-4 py-4 items-center border-b border-gray-800 font-mono"
    >
      {/* Kolom 1: Nama */}
      <span className="font-bold text-left tracking-wide text-[10px] sm:text-sm md:text-base overflow-visible">
        {boss.name}
      </span>

      {/* Kolom 2: Waktu (Fleksibel) */}
      <div className="text-right flex flex-col justify-center min-w-0 overflow-hidden">
        <div className="text-[11px] sm:text-sm md:text-base font-black text-white font-mono whitespace-nowrap">
          {formatOnlyTime(boss.spawn)}
        </div>
        <div className="text-[9px] sm:text-[10px] text-zinc-500 font-bold tracking-tighter whitespace-nowrap opacity-80">
          Kill: {formatOnlyTime(boss.killed)}
        </div>
      </div>

      {/* Kolom 3: ACTION AREA */}
      <div className="flex justify-end items-center gap-2 sm:gap-1 relative whitespace-nowrap">
        <span className={`
          ${isSpawned 
            ? 'text-red-600 animate-pulse drop-shadow-[0_0_10px_rgba(220,38,38,0.8)] font-black' 
            : isUrgent 
              ? 'text-red-500 animate-pulse' 
              : 'text-zinc-300'
          } 
          text-[12px] sm:text-sm md:text-xl font-mono tracking-tighter transition-all
        `}>
          {label}
        </span>

        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(boss);
          }}
          className="text-lg sm:text-2xl filter drop-shadow-sm flex-shrink-0"
        >
          💀
        </motion.button>

        <span
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((prev) => !prev);
          }}
          className="cursor-pointer text-zinc-700 hover:text-white text-lg sm:text-2xl px-1 flex-shrink-0"
        >
          ⋮
        </span>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute right-0 top-10 bg-[#0b0b0b] border border-zinc-800 rounded-lg w-24 sm:w-28 shadow-2xl z-20 overflow-hidden"
            >
              <div className="px-3 py-2 hover:bg-zinc-900 cursor-pointer text-[9px] sm:text-[10px] uppercase font-bold text-zinc-400">
                Edit
              </div>
              <div className="px-3 py-2 hover:bg-red-950/30 cursor-pointer text-red-900 text-[9px] sm:text-[10px] uppercase font-bold border-t border-zinc-900">
                Delete
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}