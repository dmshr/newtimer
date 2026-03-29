"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getCountdown } from "@/lib/time";

const rowVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export default function BossRow({ boss, onSelect }) {
  const [time, setTime] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false); // ✅ PINDAH KE SINI

  useEffect(() => {
    const update = () => {
      setTime(getCountdown(boss.spawn));
    };

    update();
    const interval = setInterval(update, 1000);

    return () => clearInterval(interval);
  }, [boss.spawn]);

  if (!time) {
    return (
      <div className="grid grid-cols-3 px-4 py-4 opacity-0">
        loading...
      </div>
    );
  }

  const { label, seconds } = time;
  const isUrgent = seconds > 0 && seconds < 120;

  return (
    <motion.div
      layout
      variants={rowVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.25 }}
      className="grid grid-cols-[1fr_180px_1fr] px-4 py-4 items-center border-b border-gray-800"
    >
      {/* Nama */}
      <span className="font-medium truncate text-left">
        {boss.name}
      </span>

      {/* Waktu */}
      <div className="text-center text-xs md:text-sm">
        <div>{boss.spawn}</div>
        <div className="text-xs text-gray-500">
          Killed: {boss.killed || "--:--:--"}
        </div>
      </div>

      {/* ✅ ACTION AREA (FIX DI SINI) */}
      <div
        onClick={() => setMenuOpen(false)} // ✅ klik luar close
        className="flex justify-end items-center gap-3 min-w-30 relative"
      >
        {/* Countdown */}
        {isUrgent ? (
          <motion.span
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="text-red-400 text-sm tabular-nums"
          >
            {label}
          </motion.span>
        ) : (
          <span className="text-gray-300 text-sm tabular-nums">
            {label}
          </span>
        )}

        {/* Skull */}
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation(); // ✅ biar tidak nutup menu
            onSelect(boss);
          }}
          className="text-lg"
        >
          💀
        </motion.button>

        {/* 3 DOT */}
        <span
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((prev) => !prev);
          }}
          className="cursor-pointer text-gray-500 hover:text-white text-xl px-2 py-1 rounded-lg hover:bg-gray-800/60"
        >
          ⋮
        </span>

        {/* DROPDOWN */}
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute right-0 top-8 bg-black border border-gray-700 rounded-lg w-28 shadow-lg z-20"
          >
            <div className="px-3 py-2 hover:bg-gray-800 cursor-pointer">
              Edit
            </div>
            <div className="px-3 py-2 hover:bg-red-700 cursor-pointer text-red-400">
              Delete
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}