"use client";

import { useEffect, useState, useRef } from "react";
import { pusherClient } from "@/lib/pusher";
import { motion, AnimatePresence } from "framer-motion";

export default function AnnouncementBar() {
  const [text, setText] = useState("");
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const [shouldScroll, setShouldScroll] = useState(false);
  const [scrollDuration, setScrollDuration] = useState(10);

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

  // ✅ Logika Deteksi Panjang Teks
  useEffect(() => {
    if (containerRef.current && textRef.current && text) {
      const containerWidth = containerRef.current.offsetWidth;
      const textWidth = textRef.current.scrollWidth;

      if (textWidth > containerWidth) {
        setShouldScroll(true);
        // Semakin panjang teks, semakin lambat durasinya agar kecepatan tetap konsisten
        setScrollDuration(textWidth / 40); 
      } else {
        setShouldScroll(false);
      }
    }
  }, [text]);

  return (
    <AnimatePresence>
      {text && text.trim() !== "" && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }} 
          exit={{ opacity: 0, y: -10 }}
          className="w-full mb-1"
        >
          <div className="max-w-5xl mx-auto px-4 md:px-6">
            <div className="bg-red-900/5 border border-red-700/50 rounded-xl px-4 py-1.5 flex items-center gap-3 shadow-sm overflow-hidden">
              
              {/* Badge Tetap Diam di Kiri (z-10 agar menutupi teks saat lewat) */}
              <div className="flex-shrink-0 flex items-center gap-1 bg-red-700 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter z-10">
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

              {/* ✅ Area Teks Berjalan */}
              <div 
                ref={containerRef} 
                className="flex-1 overflow-hidden whitespace-nowrap relative"
              >
                <motion.p
                  ref={textRef}
                  key={text}
                  initial={{ x: 0 }}
                  animate={shouldScroll ? { x: [0, -textRef.current?.scrollWidth / 2 || -100] } : { x: 0 }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: scrollDuration, 
                    ease: "linear",
                    repeatDelay: 1 
                  }}
                  className="text-[11px] sm:text-xs font-bold text-red-600 tracking-wide leading-tight inline-block"
                >
                  {/* Kita tampilkan teksnya, jika scrolling kita beri jarak sedikit */}
                  {text} {shouldScroll && <span className="inline-block w-20" />} 
                  {shouldScroll && text}
                </motion.p>
              </div>

            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}