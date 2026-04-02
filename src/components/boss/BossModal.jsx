"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { updateBoss } from "@/services/bossServices";

export default function BossModal({ boss, onClose, onSaved }) {
  const [killedInput, setKilledInput] = useState("");
  const [confirmAction, setConfirmAction] = useState(null); 
  const datetimeRef = useRef(null);

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

  // Logic Interval: Mengubah angka jam menjadi Milidetik untuk kalkulasi akurat
  const addHours = (baseDate, hours) => {
    const date = new Date(baseDate);
    date.setTime(date.getTime() + (parseInt(hours) * 60 * 60 * 1000));
    return formatToGmt7(date);
  };

  useEffect(() => {
    if (boss) setKilledInput("");
  }, [boss]);

  const executeAction = async () => {
    try {
      let payload = { 
        name: boss.name,
        interval_hours: boss.interval_hours 
      };

      if (confirmAction === 'save') {
        if (!killedInput) return alert("Please enter time!");
        const nextSpawn = addHours(new Date(killedInput), boss.interval_hours);
        payload = { ...payload, spawn: nextSpawn, killed: killedInput };
      }
      
      else if (confirmAction === 'justnow') {
        const now = new Date();
        const nextSpawn = addHours(now, boss.interval_hours);
        payload = { ...payload, spawn: nextSpawn, killed: formatToGmt7(now) };
      } 
      else if (confirmAction === 'notspawned') {
        // Not Spawned: Tambahkan jam ke jadwal spawn yang sudah ada
        const currentSpawn = boss.spawn.includes(" ") ? new Date(boss.spawn) : new Date();
        const nextSpawn = addHours(currentSpawn, boss.interval_hours);
        payload = { ...payload, spawn: nextSpawn, killed: boss.killed };
      }

      await updateBoss(payload);
      await onSaved();
      onClose();
    } catch (err) {
      alert("Action failed!");
    } finally {
      setConfirmAction(null);
    }
  };

  const handleCalendarChange = (e) => {
    const selectedDate = new Date(e.target.value);
    if (!isNaN(selectedDate)) setKilledInput(formatToGmt7(selectedDate));
  };

  return (
    <AnimatePresence>
      {boss && (
        <motion.div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="bg-[#0b0b0b] border border-red-900/40 w-full max-w-[380px] rounded-2xl p-6 relative shadow-2xl overflow-hidden font-inter" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} onClick={(e) => e.stopPropagation()}>
            
            {/* OVERLAY KONFIRMASI */}
            <AnimatePresence>
              {confirmAction && (
                <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} className="absolute inset-0 bg-black z-50 flex flex-col items-center justify-center p-6 text-center">
                  <div className="text-red-600 font-Bold mb-1 uppercase tracking-tighter text-lg">Confirm Time?</div>
                  <p className="text-zinc-600 text-[9px] uppercase tracking-widest mb-8">System will Update Spawn Time</p>
                  <div className="flex gap-4 w-full">
                    <button onClick={() => setConfirmAction(null)} className="flex-1 py-3 border border-zinc-800 rounded-lg text-zinc-500 font-bold text-[10px] uppercase hover:bg-zinc-900">CANCEL</button>
                    <button onClick={executeAction} className="flex-1 py-3 bg-green-700 rounded-lg text-white font-black text-[10px] uppercase shadow-lg shadow-green-900/40 hover:bg-green-500">UPDATE</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-red-600 transition text-xs">✕</button>

            <div className="text-center text-red-600 font-black tracking-widest uppercase mb-1">{boss.name}</div>
            <div className="text-center text-[10px] text-zinc-400 uppercase tracking-[0.3em] mb-4 font-bold opacity-80">KILLED ?</div>

            <div className="flex gap-3 mb-6">
              <button onClick={() => setConfirmAction('notspawned')} className="flex-1 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 font-bold py-3 rounded-lg text-[10px] uppercase tracking-wider transition">Not Spawned</button>
              <button onClick={() => setConfirmAction('justnow')} className="flex-1 bg-green-950/30 border border-green-900/50 hover:bg-green-950/50 text-green-500 font-bold py-3 rounded-lg text-[10px] uppercase tracking-wider transition">Just Now</button>
            </div>

            <div className="mt-2 mb-6 h-[2px] w-full bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-30" />

            <div className="mb-4">
              <label className="text-[9px] text-center text-zinc-600 uppercase tracking-[0.2em] mb-2 block font-black">Manual Timestamp Entry</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input value={killedInput} onChange={(e) => setKilledInput(e.target.value)} placeholder="DD Mmm YYYY HH:MM:SS" className="w-full bg-black border border-zinc-900 rounded-lg px-3 py-3 text-[11px] text-white focus:border-red-800 outline-none transition font-mono pr-9" />
                  <button type="button" onClick={() => datetimeRef.current.showPicker()} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-700 hover:text-red-600"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg></button>
                </div>
                <button onClick={() => setConfirmAction('save')} className="bg-red-700 hover:bg-red-600 text-white font-black px-5 py-3 rounded-lg transition uppercase tracking-widest text-[9px] shadow-lg shadow-red-900/20">Save 
                  Time</button>
              </div>
              <input ref={datetimeRef} type="datetime-local" className="absolute opacity-0 pointer-events-none" onChange={handleCalendarChange} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}