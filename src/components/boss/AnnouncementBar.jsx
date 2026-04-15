"use client";

import { useEffect, useState } from "react";
import { pusherClient } from "@/lib/pusher";
import { motion, AnimatePresence } from "framer-motion";

export default function AnnouncementBar() {
  const [text, setText] = useState("");

  useEffect(() => {
    // 1. Ambil data awal
    fetch("/api/settings?key=announcement_text")
      .then(res => res.json())
      .then(data => {
        if (data.value) setText(data.value);
      });

    // 2. Real-time update via Pusher
    const channel = pusherClient?.subscribe("boss-timer-k3");
    channel?.bind("setting-updated", (data) => {
      if (data.key === "announcement_text") setText(data.value);
    });

    return () => pusherClient?.unsubscribe("boss-timer-k3");
  }, []);

  return (
    <AnimatePresence>
      {text && text.trim() !== "" && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }} 
          exit={{ opacity: 0, y: -10 }}
          className="w-full mb-3 px-1"
        >
          <div className="bg-red-600/5 border border-red-900/20 rounded-xl px-4 py-1 flex items-center gap-3 shadow-sm">
            {/* Badge Info Statis */}
            <div className="flex-shrink-0 flex items-center gap-1 bg-red-700 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-100 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-100"></span>
              </span>
              <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="w-4 h-4 sm:w-5 sm:h-5"
                >
                  <path d="m3 11 18-5v12L3 14v-3z" />
                  <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
                </svg>
            </div>

            {/* Teks Statis (Bukan Marquee) */}
            <div className="flex-1">
              <p className="text-[11px] sm:text-xs font-bold text-red-500 tracking-wide leading-tight">
                {text}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}