"use client";

import { useState, useRef, useEffect } from "react";
import TableHeader from "@/components/boss/TableHeader";

export default function Header() {
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef(null);
  const toggleRef = useRef(null);

  // ✅ FIX HEIGHT (STABIL, TIDAK TERBALIK)
  useEffect(() => {
    const height = showSearch ? "180px" : "110px"; // sesuaikan jika perlu
    document.documentElement.style.setProperty("--header-height", height);
  }, [showSearch]);

  // ✅ CLICK OUTSIDE
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        (searchRef.current && searchRef.current.contains(e.target)) ||
        (toggleRef.current && toggleRef.current.contains(e.target))
      ) return;

      setShowSearch(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-black transition-all duration-300">
      
      {/* TOP BAR */}
      <div className="relative flex items-center px-4 md:px-6 py-4">
        
        {/* LEFT */}
        <div className="flex items-center gap-4 text-yellow-400 text-xl">
          <span
            ref={toggleRef}
            onClick={() => setShowSearch((p) => !p)}
            className="cursor-pointer hover:scale-110 transition"
          >
            🔍
          </span>

          <span className="cursor-pointer hover:scale-110 transition">＋</span>

          <span className="text-sm text-blue-400 cursor-pointer hover:text-red-400 transition">
            Invasion
          </span>
        </div>

        {/* CENTER */}
        <div className="absolute left-1/2 -translate-x-1/2 text-center">
          <div className="text-green-400 font-bold tracking-widest">
            KAIN
          </div>
          <div className="text-xs text-gray-400">
            Login as User
          </div>
        </div>

        {/* RIGHT */}
        <div className="ml-auto flex items-center gap-4 text-gray-400">
          <span className="cursor-pointer hover:text-white transition">🔊</span>
          <span className="cursor-pointer hover:text-white transition">⚙️</span>
          <span className="text-sm text-red-400 cursor-pointer hover:text-red-300 transition">
            Logout
          </span>
        </div>
      </div>

      {/* 🔍 SEARCH POPUP */}
      <div
        className={`overflow-hidden transition-all duration-300 ${
          showSearch ? "max-h-24" : "max-h-0"
        }`}
      >
        <div ref={searchRef} className="p-4">
          <input
            placeholder="Search boss..."
            className="w-full bg-black border border-gray-700 rounded-full px-4 py-2 focus:outline-none focus:border-red-500"
          />
        </div>
      </div>

      {/* TABLE HEADER */}
      <TableHeader />
    </header>
  );
}