"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { pusherClient } from "@/lib/pusher";

export default function SalaryView() {
  const { data: session } = useSession();
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const userRole = session?.user?.role || "User";
  const isMaster = userRole === "Master";

  const loadSalaryFromNeon = async () => {
    try {
      const res = await fetch("/api/salary");
      const data = await res.json();
      if (Array.isArray(data)) {
        setSalaries(data);
      } else {
        setSalaries([]);
      }
    } catch (err) {
      setSalaries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFromSheet = async () => {
    setUpdating(true);
    try {
      const res = await fetch("/api/salary", { method: "POST" });
      if (res.ok) {
        alert("Data Salary Berhasil Diperbarui dari Spreadsheet!");
      }
    } catch (err) {
      alert("Gagal mengambil data Spreadsheet");
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    loadSalaryFromNeon();
    const channel = pusherClient?.subscribe("boss-timer-k3");
    channel?.bind("salary-updated", () => {
      loadSalaryFromNeon(); 
    });
    return () => pusherClient?.unsubscribe("boss-timer-k3");
  }, []);

  const calculateTotalDiamonds = () => {
    const total = salaries.reduce((acc, item) => {
      const numericValue = parseInt(item.total_amount?.replace(/[^0-9]/g, "") || "0", 10);
      return acc + numericValue;
    }, 0);
    return new Intl.NumberFormat("id-ID").format(total);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="flex flex-col gap-3 mt-2"
    >
      <div className="bg-[#0f0f0f] rounded-2xl p-2 sm:p-5 border border-zinc-900 shadow-2xl overflow-x-auto scrollbar-hide">
        
        {loading ? (
          <div className="py-10 text-center text-zinc-700 text-[10px] md:text-xs uppercase font-bold animate-pulse tracking-widest">
            Accessing Secure Records...
          </div>
        ) : (
          <div className="grid grid-cols-[max-content_minmax(max-content,_1fr)_minmax(max-content,_1fr)_minmax(max-content,_1fr)_minmax(max-content,_1fr)_minmax(max-content,_1fr)] gap-x-0.5 min-w-full w-max">
            
            {/* Judul & Total Diamonds - Scaling text */}
            <div className="col-span-5 pb-4 px-1">
              <h2 className="text-red-600 font-bold tracking-wider text-xs sm:text-sm md:text-base lg:text-lg uppercase">Salary</h2>
              <p className="text-[9px] sm:text-[10px] md:text-xs lg:text-sm text-zinc-500 font-mono uppercase mt-0.5 font-bold">
                Total Diamond : <span className="text-white">{calculateTotalDiamonds()}</span>
              </p>
            </div>

            {/* Tombol Update - Scaling text */}
            <div className="col-start-6 pb-4 flex justify-end items-start px-1">
              {isMaster && (
                <button 
                  onClick={handleUpdateFromSheet}
                  disabled={updating}
                  className={`whitespace-nowrap px-2 sm:px-3 py-1.5 rounded-lg text-[8px] sm:text-[9px] md:text-xs font-bold uppercase transition-all flex items-center gap-1.5 ${
                    updating ? 'bg-zinc-800 text-zinc-500' : 'bg-green-700 hover:bg-green-600 text-white shadow-lg shadow-green-900/20'
                  }`}
                >
                  {updating ? "Sync" : "Update"}
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4">
                    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/>
                  </svg>
                </button>
              )}
            </div>

            {/* Header - Scaling text */}
            <div className="contents text-[9px] sm:text-[10px] md:text-xs lg:text-sm text-zinc-600 font-black uppercase">
              <span className="px-0.5 py-2 border-b border-zinc-900 whitespace-nowrap">Member</span>
              <span className="px-0.5 py-2 text-right border-b border-zinc-900 whitespace-nowrap">Last Wk</span>
              <span className="px-0.5 py-2 text-right border-b border-zinc-900 whitespace-nowrap">Salary</span>
              <span className="px-0.5 py-2 text-right border-b border-zinc-900 whitespace-nowrap">Debt</span>
              <span className="px-0.5 py-2 text-right border-b border-zinc-900 whitespace-nowrap">Recv</span>
              <span className="px-0.5 py-2 text-right border-b border-zinc-900 text-red-700 whitespace-nowrap">Total</span>
            </div>

            {/* Data Rows - Scaling text per column */}
            <AnimatePresence>
              {Array.isArray(salaries) && salaries.map((item) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="contents group"
                >
                  <span className="text-white text-[10px] sm:text-[11px] md:text-sm lg:text-base font-bold px-0.5 py-3.5 border-b border-zinc-900/50 group-hover:bg-white/[0.02] transition-colors whitespace-nowrap">
                    {item.member_name}
                  </span>
                  <span className="text-zinc-500 text-[10px] sm:text-[11px] md:text-sm lg:text-base font-mono text-right px-0.5 py-3.5 border-b border-zinc-900/50 group-hover:bg-white/[0.02] transition-colors whitespace-nowrap">
                    {item.last_week}
                  </span>
                  <span className="text-zinc-300 text-[10px] sm:text-[11px] md:text-sm lg:text-base font-mono text-right px-0.5 py-3.5 border-b border-zinc-900/50 group-hover:bg-white/[0.02] transition-colors whitespace-nowrap">
                    {item.current_salary}
                  </span>
                  <span className="text-red-700 text-[10px] sm:text-[11px] md:text-sm lg:text-base font-mono text-right px-0.5 py-3.5 border-b border-zinc-900/50 group-hover:bg-white/[0.02] transition-colors whitespace-nowrap">
                    {item.debt}
                  </span>
                  <span className="text-zinc-400 text-[10px] sm:text-[11px] md:text-sm lg:text-base font-mono text-right px-0.5 py-3.5 border-b border-zinc-900/50 group-hover:bg-white/[0.02] transition-colors whitespace-nowrap">
                    {item.receivables}
                  </span>
                  <span className="text-green-500 text-[11px] sm:text-xs md:text-base lg:text-lg font-mono font-black text-right px-0.5 py-3.5 border-b border-zinc-900/50 group-hover:bg-white/[0.02] transition-colors whitespace-nowrap">
                    {item.total_amount}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {(!Array.isArray(salaries) || salaries?.length === 0) && (
              <div className="col-span-6 py-10 text-center text-zinc-800 text-[10px] md:text-xs font-bold uppercase">
                No records found.
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}