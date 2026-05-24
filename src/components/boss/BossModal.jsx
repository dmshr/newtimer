"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { getServerTime } from "@/lib/time"; 

export default function BossModal({ boss, onClose, onSaved }) {
  const [currentScreen, setCurrentScreen] = useState("menu"); 
  const [confirmAction, setConfirmAction] = useState(null); 
  const [manualDate, setManualDate] = useState(""); 
  const [manualTime, setManualTime] = useState(""); 
  const [formattedOutput, setFormattedOutput] = useState(""); 
  const [initialState, setInitialState] = useState({ date: "", time: "" });
  
  // ✅ Proteksi Anti Klik Ganda
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getNowLocal = () => {
    const now = new Date(getServerTime()); 
    const offset = now.getTimezoneOffset() * 60000;
    const localISOTime = new Date(now.getTime() - offset).toISOString();
    return {
      date: localISOTime.split("T")[0],
      time: localISOTime.split("T")[1].slice(0, 8),
    };
  };

  const formatToGmt7 = (dateObj) => {
    const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Jakarta",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const parts = formatter.formatToParts(dateObj);
    const d = parts.find(p => p.type === "day").value;
    const m = parts.find(p => p.type === "month").value;
    const y = parts.find(p => p.type === "year").value;
    const time = `${parts.find(p => p.type === "hour").value}:${parts.find(p => p.type === "minute").value}:${parts.find(p => p.type === "second").value}`;
    return `${d} ${m} ${y} ${time}`;
  };

  useEffect(() => {
    if (boss) {
      const now = getNowLocal();
      setManualDate(now.date);
      setManualTime(now.time);
      setInitialState({ date: now.date, time: now.time });
      setConfirmAction(null);
      setCurrentScreen("menu"); 
    }
  }, [boss]);

  useEffect(() => {
    if (manualDate && manualTime) {
      const combined = new Date(`${manualDate}T${manualTime}`); 
      if (!isNaN(combined.getTime())) {
        setFormattedOutput(formatToGmt7(combined));
      }
    }
  }, [manualDate, manualTime]);

  const isEdited = manualDate !== initialState.date || manualTime !== initialState.time;

  const executeAction = async () => {
    if (isSubmitting) return; // Mencegah execute ganda
    setIsSubmitting(true);

    try {
      let payload = { 
        name: boss.name, 
        interval_hours: boss.interval_hours, 
        rarity: boss.rarity 
      };

      if (confirmAction === 'justnow') {
        payload.use_db_time = true;
      } 
      else if (confirmAction === 'notspawned') {
        payload.action = 'not_spawned'; 
      }
      else if (confirmAction === 'manual_killed') {
        if (!isEdited) { setIsSubmitting(false); return; }
        payload.killed = formattedOutput;
      }
      else if (confirmAction === 'manual_spawn') {
        if (!isEdited) { setIsSubmitting(false); return; }
        payload.spawn = formattedOutput;
        payload.manual_spawn = true; 
      }

      onClose(); 
      setConfirmAction(null);
      
      if (onSaved) {
        await onSaved(payload);
      }
    } catch (err) { 
      console.error("Action failed:", err); 
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {boss && (
        <motion.div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[110] backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="bg-[#0b0b0b] border border-red-900/40 w-[95%] max-w-[340px] rounded-2xl p-4 relative shadow-2xl overflow-hidden font-inter" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} onClick={(e) => e.stopPropagation()}>
            
            <AnimatePresence>
              {confirmAction && (
                <>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/70 z-105" onClick={() => setConfirmAction(null)} />
                  <motion.div initial={{ y: "-100%" }} animate={{ y: 0 }} exit={{ y: "-100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="absolute top-0 left-0 right-0 bg-[#0b0b0b] z-[110] flex flex-col items-center justify-center p-6 border-b border-red-900/40 shadow-2xl">
                    <div className="text-red-600 font-black text-xl uppercase tracking-tighter mb-1 leading-none">{boss.name}</div>
                    <p className="text-zinc-500 text-[9px] uppercase tracking-[0.2em] font-bold mb-6">Confirm Update ?</p>
                    <div className="flex gap-3 w-full">
                      <button onClick={() => setConfirmAction(null)} className="flex-1 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-500 font-bold text-[10px] uppercase hover:bg-red-700 hover:text-white hover:border-red-600 transition-all duration-200">
                        CANCEL
                      </button>
                      <button onClick={executeAction} disabled={isSubmitting} className="flex-1 py-3 bg-green-700 rounded-xl text-white font-black text-[10px] uppercase shadow-lg shadow-green-900/40 hover:bg-green-600 transition-all duration-200 disabled:opacity-50">
                        UPDATE
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-red-600 transition text-xs z-10">✕</button>
            <div className="text-center text-red-600 font-black tracking-widest uppercase mb-1">{boss.name}</div>

            {currentScreen === "menu" && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mt-4">
                <div className="text-center text-[10px] text-zinc-400 uppercase tracking-[0.4em] mb-4 font-bold opacity-80">QUICK ACTION</div>
                <div className="flex gap-3 mb-5">
                  <button onClick={() => setConfirmAction('notspawned')} className="flex-1 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 font-bold py-3 rounded-lg text-[10px] uppercase tracking-wider transition">Not Spawned</button>
                  <button onClick={() => setConfirmAction('justnow')} className="flex-1 bg-green-950/30 border border-green-900/50 hover:bg-green-950/50 text-green-500 font-bold py-3 rounded-lg text-[10px] uppercase tracking-wider transition">Just Now</button>
                </div>
                <div className="mt-2 mb-5 h-[2px] w-full bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-20" />
                <div className="text-center text-[10px] text-zinc-400 uppercase tracking-[0.3em] mb-3 font-bold opacity-80">MANUAL EDIT</div>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => { setCurrentScreen("spawn"); const now = getNowLocal(); setManualDate(now.date); setManualTime(now.time); setInitialState({ date: now.date, time: now.time }); }} className="w-full bg-black/40 border border-red-700/40 hover:bg-red-700 text-zinc-300 hover:text-white font-bold py-3 px-1 rounded-xl text-[9px] uppercase tracking-wider shadow-[0_0_10px_rgba(185,28,28,0.05)] hover:shadow-[0_0_15px_rgba(185,28,28,0.4)] transition-all duration-200 outline-none">
                    ⚙️ Spawn Time
                  </button>
                  <button onClick={() => { setCurrentScreen("killed"); const now = getNowLocal(); setManualDate(now.date); setManualTime(now.time); setInitialState({ date: now.date, time: now.time }); }} className="w-full bg-black/40 border border-red-700/40 hover:bg-red-700 text-zinc-300 hover:text-white font-bold py-3 px-1 rounded-xl text-[9px] uppercase tracking-wider shadow-[0_0_10px_rgba(185,28,28,0.05)] hover:shadow-[0_0_15px_rgba(185,28,28,0.4)] transition-all duration-200 outline-none">
                    💀 Killed Time
                  </button>
                </div>
              </motion.div>
            )}

            {(currentScreen === "spawn" || currentScreen === "killed") && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="mt-4">
                <div className="text-center text-[10px] text-zinc-400 uppercase tracking-[0.2em] mb-4 font-bold opacity-80">
                  {currentScreen === "spawn" ? "MANUAL SPAWN TIME INPUT" : "MANUAL KILLED TIME INPUT"}
                </div>
                <div className="grid grid-cols-[1fr_1fr_auto] gap-1.5 items-center">
                  <input 
                    type="date" 
                    value={manualDate} 
                    onChange={(e) => setManualDate(e.target.value)} 
                    className="w-full bg-black border border-zinc-900 rounded-lg px-1 py-2 text-[10px] text-white focus:border-red-800 outline-none transition font-mono accent-red-600" 
                  />
                  <input 
                    type="time" 
                    step="1" 
                    value={manualTime} 
                    onChange={(e) => setManualTime(e.target.value)} 
                    className="w-full bg-black border border-zinc-900 rounded-lg px-1.5 py-2 text-[10px] text-white focus:border-red-800 outline-none transition font-mono accent-red-600" 
                  />
                  <button 
                    onClick={() => setConfirmAction(currentScreen === "spawn" ? "manual_spawn" : "manual_killed")} 
                    disabled={!isEdited} 
                    className={`font-black h-full px-3 min-w-[55px] rounded-lg transition uppercase tracking-widest text-[10px] shadow-lg ${isEdited ? "bg-red-700 hover:bg-red-600 text-white shadow-red-900/20" : "bg-zinc-900 text-zinc-700 cursor-not-allowed opacity-50"}`}
                  >
                    Save
                  </button>
                </div>
                <div className="mt-3 min-h-[28px]">
                  <AnimatePresence>
                    {isEdited && formattedOutput && (
                      <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center py-1 px-2 bg-zinc-950 border border-zinc-800 rounded-md">
                        <span className="text-[9px] text-zinc-500 font-mono uppercase mr-2">New Time:</span>
                        <span className="text-[11px] text-red-500 font-mono font-bold tracking-tight">{formattedOutput}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <button onClick={() => setCurrentScreen("menu")} className="w-full mt-2 text-center text-zinc-600 hover:text-zinc-400 font-bold text-[9px] uppercase tracking-widest transition-colors py-1">
                  ◀ Back To Menu
                </button>
              </motion.div>
            )}

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}