"use client";

import { motion, AnimatePresence } from "framer-motion"; 
import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react"; 
import { getCountdown } from "@/lib/time";
import { useSound } from "@/context/SoundContext";
import { updateBoss } from "@/services/bossServices";
import { getRarityColor } from "@/lib/colors"; 

const rowVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export default function BossRow({ boss, onSelect, onEdit, onDelete, animateInvasion }) {
  const { data: session } = useSession();
  const userRole = session?.user?.role || "User";
  
  // ✅ Pembagian Hak Akses
  const isReadOnly = userRole === "User"; // User biasa tidak bisa klik manual
  const canAutoUpdate = userRole === "SuperAdmin" || userRole === "Master"; // HANYA SuperAdmin & Master yang kirim auto-update

  const [time, setTime] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { playAlert } = useSound();
  const [hasAlerted, setHasAlerted] = useState(false);

  // ─── STATE SINKRONISASI INDIKATOR LAMPU & ANTRIAN ──────────────────
  const [syncStatus, setSyncStatus] = useState("idle"); 
  const [lastPayload, setLastPayload] = useState(null);
  const [autoUpdateLocked, setAutoUpdateLocked] = useState(false);
  const timeoutRef = useRef(null);

  const formatOnlyTime = (fullStr) => {
    if (!fullStr || fullStr === "--:--:--") return "--:--:--";
    const parts = fullStr.split(" ");
    return parts[parts.length - 1];
  };

  // ─── 1. SIKLUS UTAMA LOOP TIMER VISUAL ───────
  useEffect(() => {
    const update = () => {
      const countdown = getCountdown(boss.spawn);
      setTime(countdown);

      if (countdown) {
        if (countdown.label === "SPAWNED" || countdown.seconds <= 0) {
          setSyncStatus((current) => (current === "success" ? "idle" : current));
        }
      }
    };
    
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [boss.spawn]);

  useEffect(() => {
    setAutoUpdateLocked(false);
    setSyncStatus("idle");
  }, [boss.spawn]);

  // ─── 2. SISTEM AUTO UPDATE LATAR BELAKANG (ANTI-LOOP & ANTI-DDOS) ───────
  useEffect(() => {
    // ✅ PERBAIKAN: Syarat canAutoUpdate ditambahkan. 
    // Jika rolenya User atau Admin, blok kode ini akan dilewati sepenuhnya.
    if (canAutoUpdate && time && time.seconds <= 0 && !autoUpdateLocked) {
      const secondsPastSpawn = Math.abs(time.seconds);
      let maxWaitSeconds = 5 * 60; // 5 Menit
      const rarityLower = boss.rarity?.toLowerCase() || "";

      if (rarityLower.includes("rare") || rarityLower.includes("blue") || rarityLower.includes("mini") || rarityLower.includes("cyan")) {
        maxWaitSeconds = 3 * 60; 
      } 
      else if (rarityLower.includes("epic") || rarityLower.includes("red") || rarityLower.includes("invasi") || rarityLower.includes("invasion") || rarityLower.includes("orange")) {
        maxWaitSeconds = 5 * 60; 
      } 
      else if (rarityLower.includes("legendary") || rarityLower.includes("purple")) {
        maxWaitSeconds = 10 * 60; 
      }

      if (secondsPastSpawn >= maxWaitSeconds) {
        console.log(`[Auto Update] System triggered update for ${boss.name}`);
        
        setAutoUpdateLocked(true); 
        
        const autoPayload = {
          name: boss.name,
          interval_hours: boss.interval_hours,
          rarity: boss.rarity,
          action: 'not_spawned' 
        };

        triggerBackgroundUpdate(autoPayload);
      }
    }
  }, [time, autoUpdateLocked, boss, canAutoUpdate]); // ✅ canAutoUpdate masuk dalam dependency

  useEffect(() => {
    if (time && time.seconds === 59 && !hasAlerted) {
      playAlert();
      setHasAlerted(true); 
    }
    if (time && time.seconds >= 60) setHasAlerted(false);
  }, [time?.seconds, hasAlerted, playAlert]);

  // ─── 3. INDEPENDENT BACKGROUND HANDLING ─────────
  const triggerBackgroundUpdate = async (payload) => {
    setSyncStatus("sending");
    setLastPayload(payload);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      setSyncStatus("error");
    }, 5 * 60 * 1000);

    try {
      const res = await updateBoss(payload);
      if (res && res.success !== false) {
        setSyncStatus("success");
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      } else {
        setSyncStatus("error");
      }
    } catch (error) {
      console.error("Background sync error:", error);
      setSyncStatus("error");
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!time) return (
    <div className="grid grid-cols-[1.5fr_1fr_120px] md:grid-cols-[1.5fr_1fr_160px] px-3 md:px-4 py-3 opacity-0 font-mono">
      loading...
    </div>
  );

  const { label, seconds } = time;
  const isUrgent = seconds > 0 && seconds < 120;
  const isSpawned = label === "SPAWNED";

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  const isInvasion = boss.rarity?.toLowerCase() === 'invasi' || boss.rarity?.toLowerCase() === 'invasion';
  const shouldAnimate = isInvasion ? animateInvasion : true; 

  return (
    <motion.div
      layout
      variants={rowVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.25 }}
      className="grid grid-cols-[1.5fr_1fr_120px] md:grid-cols-[1.5fr_1fr_160px] gap-2 px-3 md:px-4 py-3 items-center border-b border-zinc-800 font-mono"
    >
      <span className={`font-semibold font-sans text-left tracking-wider text-[12px] sm:text-sm md:text-base overflow-visible ${getRarityColor(boss.rarity)}`}>
        {boss.name}
      </span>

      <div className="text-right flex flex-col justify-center min-w-0 overflow-hidden pr-3">
        <div className="text-[11px] sm:text-sm md:text-base font-semibold text-zinc-300 font-sans tracking-wider whitespace-nowrap">
          {formatOnlyTime(boss.spawn)}
        </div>
        <div className="text-[9px] sm:text-[10px] text-zinc-500 font-semibold tracking-tighter whitespace-nowrap opacity-90">
          Kill: {formatOnlyTime(boss.killed)}
        </div>
      </div>

      <div className="flex justify-end items-center gap-2 sm:gap-1 relative whitespace-nowrap">
        <div className={`
          ${isSpawned && shouldAnimate
            ? 'text-red-600 animate-pulse drop-shadow-[0_0_10px_rgba(220,38,38,0.8)] font-bold' 
            : isUrgent && shouldAnimate
              ? 'text-red-500 animate-pulse' 
              : 'text-zinc-200'
          } 
          text-[14px] sm:text-sm md:text-xl font-mono font-bold tracking-tighter transition-all
          flex justify-end w-full
        `}>
          {isSpawned ? (
            <span className="w-full text-right">{label}</span>
          ) : (
            <div className="flex items-center">
              {h > 0 && <span className="inline-block w-[1.8em] text-right">{h}h</span>}
              {(m > 0 || h > 0) && <span className="inline-block w-[1.8em] text-right">{m}m</span>}
              <span className="inline-block w-[1.8em] text-right">{s}s</span>
            </div>
          )}
        </div>

        {!isReadOnly && (
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.8 }}
            onClick={(e) => { e.stopPropagation(); onSelect(boss, triggerBackgroundUpdate); }}
            className="text-sm sm:text-lg filter drop-shadow-sm flex-shrink-0 opacity-80 hover:opacity-100 transition-opacity"
          >
            💀
          </motion.button>
        )}

        {!isReadOnly && (
          <span
            onClick={(e) => { e.stopPropagation(); setMenuOpen((prev) => !prev); }}
            className="cursor-pointer text-zinc-600 hover:text-white text-xl sm:text-2xl px-0.5 flex-shrink-0 font-black leading-none transition-colors"
          >
            ⋮
          </span>
        )}

        <div className="relative group flex items-center justify-center w-5 h-5 ml-0.5">
          {syncStatus === "sending" && (
            <>
              <div className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse" />
              <div className="absolute bottom-full mb-2 hidden group-hover:block bg-zinc-950 border border-zinc-800 text-amber-500 font-sans font-black text-[9px] uppercase tracking-wider px-2 py-1 rounded shadow-2xl z-50 pointer-events-none">
                Updating...
              </div>
            </>
          )}

          {syncStatus === "success" && (
            <>
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
              <div className="absolute bottom-full mb-2 hidden group-hover:block bg-zinc-950 border border-zinc-800 text-green-500 font-sans font-black text-[9px] uppercase tracking-wider px-2 py-1 rounded shadow-2xl z-50 pointer-events-none">
                Updated
              </div>
            </>
          )}

          {syncStatus === "error" && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); triggerBackgroundUpdate(lastPayload); }}
                className="w-5 h-5 flex items-center justify-center bg-red-950/40 hover:bg-red-600 text-red-500 hover:text-white border border-red-900/50 rounded-full transition-all duration-150 active:scale-90 shadow-lg"
              >
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              </button>
              <div className="absolute bottom-full mb-2 hidden group-hover:block bg-zinc-950 border border-zinc-800 text-red-500 font-sans font-black text-[9px] uppercase tracking-wider px-2 py-1 rounded shadow-2xl z-50 pointer-events-none">
                Retry
              </div>
            </>
          )}

          {syncStatus === "idle" && (
            <div className="w-2.5 h-2.5 bg-zinc-800 rounded-full opacity-20" />
          )}
        </div>

        <AnimatePresence>
          {menuOpen && !isReadOnly && (
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