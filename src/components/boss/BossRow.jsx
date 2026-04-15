"use client";

import { motion, AnimatePresence } from "framer-motion"; 
import { useEffect, useState } from "react";
import { getCountdown } from "@/lib/time";
import { useSound } from "@/context/SoundContext";

const rowVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export default function BossRow({ boss, onSelect, onEdit, onDelete, animateInvasion }) {
  const [time, setTime] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { playAlert } = useSound();
  const [hasAlerted, setHasAlerted] = useState(false);

  const formatOnlyTime = (fullStr) => {
    if (!fullStr || fullStr === "--:--:--") return "--:--:--";
    const parts = fullStr.split(" ");
    return parts[parts.length - 1];
  };

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

  useEffect(() => {
    if (time && time.seconds === 59 && !hasAlerted) {
      playAlert();
      setHasAlerted(true); 
    }
    if (time && time.seconds >= 60) setHasAlerted(false);
  }, [time?.seconds, hasAlerted, playAlert]);

  if (!time) return <div className="grid grid-cols-3 px-4 py-4 opacity-0 font-inter">loading...</div>;

  const { label, seconds } = time;
  const isUrgent = seconds > 0 && seconds < 120;
  const isSpawned = label === "SPAWNED";

  const getRarityColor = (rarity) => {
    switch (rarity?.toLowerCase()) {
      case 'invasi': case 'invasion': case 'orange': return 'text-orange-500';
      case 'legendary': case 'purple': return 'text-purple-500';
      case 'epic': case 'red': return 'text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]';
      case 'rare': case 'blue': return 'text-blue-400';
      case 'world': case 'white': return 'text-white';
      default: return 'text-zinc-300';
    }
  };

  const isInvasion = boss.rarity?.toLowerCase() === 'invasi' || boss.rarity?.toLowerCase() === 'invasion';
  const shouldAnimate = isInvasion ? animateInvasion : true; 

  return (
    <motion.div
      layout
      variants={rowVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.25 }}
      // PADDING & GRID 
      className="grid grid-cols-[80px_1fr_130px] md:grid-cols-[140px_1fr_190px] gap-2 px-3 md:px-4 py-3 items-center border-b border-zinc-800 font-mono"
    >
      {/* Kolom 1: Nama */}
      <span className={`font-semibold font-sans text-left tracking-wider text-[10px] sm:text-sm md:text-base overflow-visible ${getRarityColor(boss.rarity)}`}>
        {boss.name}
      </span>

      {/* Kolom 2: Waktu */}
      <div className="text-right flex flex-col justify-center min-w-0 overflow-hidden">
        <div className="text-[11px] sm:text-sm md:text-base font-semibold text-zinc-300 font-sans tracking-wider whitespace-nowrap">
          {formatOnlyTime(boss.spawn)}
        </div>
        <div className="text-[9px] sm:text-[10px] text-zinc-500 font-semibold tracking-tighter whitespace-nowrap opacity-90">
          Kill: {formatOnlyTime(boss.killed)}
        </div>
      </div>

      {/* Kolom 3: ACTION AREA */}
      <div className="flex justify-end items-center gap-2 sm:gap-1 relative whitespace-nowrap">
        <span className={`
          ${isSpawned && shouldAnimate
            ? 'text-red-600 animate-pulse drop-shadow-[0_0_10px_rgba(220,38,38,0.8)] font-bold' 
            : isUrgent && shouldAnimate
              ? 'text-red-500 animate-pulse' 
              : 'text-zinc-200'
          } 
          text-[12px] font-bold sm:text-sm md:text-xl font-sans tracking-tighter transition-all
        `}>
          {label}
        </span>

        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.8 }}
          onClick={(e) => { e.stopPropagation(); onSelect(boss); }}
          className="text-sm sm:text-lg filter drop-shadow-sm flex-shrink-0 opacity-80 hover:opacity-100 transition-opacity"
        >
          💀
        </motion.button>

        <span
          onClick={(e) => { e.stopPropagation(); setMenuOpen((prev) => !prev); }}
          className="cursor-pointer text-zinc-600 hover:text-white text-xl sm:text-2xl px-0.5 flex-shrink-0 font-black leading-none transition-colors"
        >
          ⋮
        </span>

        <AnimatePresence>
          {menuOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMenuOpen(false)} className="fixed inset-0 z-10" />
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute right-0 top-10 bg-[#0b0b0b] border border-zinc-800 rounded-lg w-24 sm:w-28 shadow-2xl z-20 overflow-hidden"
              >
                <div onClick={(e) => { e.stopPropagation(); onEdit(boss); setMenuOpen(false); }} className="px-3 py-2 hover:bg-zinc-800 cursor-pointer text-[9px] sm:text-[10px] uppercase font-bold text-zinc-400">Edit</div>
                <div onClick={(e) => { e.stopPropagation(); onDelete(boss); setMenuOpen(false); }} className="px-3 py-2 hover:bg-red-950/30 cursor-pointer text-red-900 text-[9px] sm:text-[10px] uppercase font-bold border-t border-zinc-900">Delete</div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}