"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { updateBoss } from "@/services/bossServices";
import { getServerTime } from "@/lib/time"; 

export default function BossModal({ boss, onClose, onSaved }) {
  const [killedInput, setKilledInput] = useState("");
  const [manualDate, setManualDate] = useState(""); 
  const [manualTime, setManualTime] = useState(""); 
  
  const [initialState, setInitialState] = useState({ date: "", time: "" });
  const [confirmAction, setConfirmAction] = useState(null); 

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
    }
  }, [boss]);

  useEffect(() => {
    if (manualDate && manualTime) {
      const combined = new Date(`${manualDate}T${manualTime}`); 
      if (!isNaN(combined.getTime())) {
        setKilledInput(formatToGmt7(combined));
      }
    }
  }, [manualDate, manualTime]);

  const isEdited = manualDate !== initialState.date || manualTime !== initialState.time;

  const executeAction = async () => {
    try {
      let payload = { 
        name: boss.name,
        interval_hours: boss.interval_hours,
        rarity: boss.rarity 
      };

      if (confirmAction === 'justnow') {
        payload.use_db_time = true;
      } 
      else if (confirmAction === 'save') {
        if (!isEdited) return;
        payload.killed = killedInput;
      } 
      else if (confirmAction === 'notspawned') {
        payload.killed = boss.spawn; 
      }

      await updateBoss(payload);
      if (onSaved) await onSaved();
      onClose();
    } catch (err) {
      alert("Action failed!");
    } finally {
      setConfirmAction(null);
    }
  };

  return (
    <AnimatePresence>
      {boss && (
        <motion.div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="bg-[#0b0b0b] border border-red-900/40 w-[90%] max-w-[320px] rounded-2xl p-4 relative shadow-2xl overflow-hidden font-inter" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} onClick={(e) => e.stopPropagation()}>
            
            {/* ✅ MODAL KONFIRMASI (Drawer Atas + Overlay Meredup) */}
            <AnimatePresence>
              {confirmAction && (
                <>
                  {/* Overlay Hitam (Ringan, Tanpa Blur) agar konten belakang meredup */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/70 z-40"
                    onClick={() => setConfirmAction(null)}
                  />

                  {/* Kotak Konfirmasi Singkat */}
                  <motion.div 
                    initial={{ y: "-100%" }} 
                    animate={{ y: 0 }} 
                    exit={{ y: "-100%" }} 
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="absolute top-0 left-0 right-0 bg-[#0b0b0b] z-50 flex flex-col items-center justify-center p-6 border-b border-red-900/40 shadow-2xl"
                  >
                    <div className="text-red-600 font-black text-xl uppercase tracking-tighter mb-1 leading-none">
                      {boss.name}
                    </div>
                    <p className="text-zinc-500 text-[9px] uppercase tracking-[0.2em] font-bold mb-6">Confirm Update ?</p>
                    
                    <div className="flex gap-3 w-full">
                      <button 
                        onClick={() => setConfirmAction(null)} 
                        className="flex-1 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-500 font-bold text-[10px] uppercase hover:bg-red-700 hover:text-white hover:border-red-600 transition-all duration-200"
                      >
                        CANCEL
                      </button>
                      <button 
                        onClick={executeAction} 
                        className="flex-1 py-3 bg-green-700 rounded-xl text-white font-black text-[10px] uppercase shadow-lg shadow-green-900/40 hover:bg-green-600 transition-all duration-200"
                      >
                        UPDATE
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* ✅ UI UTAMA (DIBELAKANG KONFIRMASI) */}
            <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-red-600 transition text-xs z-10">✕</button>

            <div className="text-center text-red-600 font-black tracking-widest uppercase mb-1">{boss.name}</div>
            <div className="text-center text-[10px] text-zinc-400 uppercase tracking-[0.3em] mb-4 font-bold opacity-80">KILLED ?</div>

            <div className="flex gap-3 mb-6">
              <button onClick={() => setConfirmAction('notspawned')} className="flex-1 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 font-bold py-3 rounded-lg text-[10px] uppercase tracking-wider transition">Not Spawned</button>
              <button onClick={() => setConfirmAction('justnow')} className="flex-1 bg-green-950/30 border border-green-900/50 hover:bg-green-950/50 text-green-500 font-bold py-3 rounded-lg text-[10px] uppercase tracking-wider transition">Just Now</button>
            </div>

            <div className="mt-2 mb-6 h-[2px] w-full bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-30" />

            <div className="mb-2">
              <label className="text-[9px] text-zinc-500 uppercase tracking-[0.2em] font-bold block mb-2">Manual Killed Time Input</label>
              
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
                  onClick={() => setConfirmAction('save')} 
                  disabled={!isEdited}
                  className={`font-black h-full px-3 min-w-[55px] rounded-lg transition uppercase tracking-widest text-[10px] shadow-lg ${
                    isEdited 
                    ? "bg-red-700 hover:bg-red-600 text-white shadow-red-900/20" 
                    : "bg-zinc-900 text-zinc-700 cursor-not-allowed opacity-50"
                  }`}
                >
                  Save
                </button>
              </div>

              <div className="mt-2 min-h-[30px]">
                <AnimatePresence>
                  {isEdited && killedInput && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      className="flex items-center justify-center py-1 px-2 bg-zinc-950 border border-zinc-800 rounded-md"
                    >
                      <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-normal mr-2">
                        New Time:
                      </span>
                      <span className="text-[11px] text-red-500 font-mono font-bold tracking-tight">
                        {killedInput}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}