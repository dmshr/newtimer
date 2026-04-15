"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react"; // ✅ Import Session
import { useInvasion } from "@/context/InvasionContext";

export default function InvasionControl() {
  const { data: session } = useSession();
  const userRole = session?.user?.role || "User";
  const isUser = userRole === "User"; // ✅ Role Check

  const [isOpen, setIsOpen] = useState(false);
  const { showInvasion, setShowInvasion, triggerReset } = useInvasion();
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={menuRef}>
      <span
        // ✅ Hanya buka menu jika BUKAN role User
        onClick={() => !isUser && setIsOpen(!isOpen)}
        className={`text-[8px] sm:text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded border select-none transition-all ${
          showInvasion
            ? "bg-red-600 text-white border-red-500 animate-pulse"
            : "text-zinc-500 border-zinc-800 hover:text-white"
        } ${isUser ? "cursor-default opacity-80" : "cursor-pointer"}`} 
      >
        Invasion
      </span>

      <AnimatePresence>
        {/* ✅ Menu Popover diproteksi: Hanya render jika bukan User */}
        {isOpen && !isUser && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 5, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute left-0 top-full mt-2 w-32 bg-[#0f0f0f] border border-zinc-800 p-2 rounded-xl shadow-2xl z-[60]"
          >
            <div className="flex flex-col gap-2">
              <div className="flex bg-zinc-950 p-1 rounded-lg gap-1">
                <button
                  onClick={() => setShowInvasion(true)}
                  className={`flex-1 py-1.5 text-[10px] font-black rounded transition-all ${
                    showInvasion ? "bg-red-600 text-white" : "text-zinc-600 hover:text-zinc-400"
                  }`}
                >
                  ON
                </button>
                <button
                  onClick={() => setShowInvasion(false)}
                  className={`flex-1 py-1.5 text-[10px] font-black rounded transition-all ${
                    !showInvasion ? "bg-zinc-800 text-white" : "text-zinc-600 hover:text-zinc-400"
                  }`}
                >
                  OFF
                </button>
              </div>

              <div className="h-[1px] bg-zinc-800 w-full" />

              <button
                onClick={() => {
                  triggerReset();
                  setIsOpen(false);
                }}
                className="w-full py-2 text-[10px] font-bold bg-zinc-800 hover:bg-red-600/20 hover:text-red-500 text-zinc-400 rounded-lg transition-all"
              >
                RESET TIME
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}