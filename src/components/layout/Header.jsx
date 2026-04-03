"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation"; 
import { motion, AnimatePresence } from "framer-motion";
import { useSound } from "@/context/SoundContext";
import TableHeader from "@/components/boss/TableHeader";
import AddBossModal from "@/components/boss/AddBossModal";

export default function Header() {
  const [showSearch, setShowSearch] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [showVolume, setShowVolume] = useState(false);
  const [isAlertActive, setIsAlertActive] = useState(false);

  const { volume, setVolume, unlockAudio } = useSound();

  const searchRef = useRef(null);
  const toggleRef = useRef(null);
  const volumeRef = useRef(null);
  const inputRef = useRef(null); // Ref tambahan untuk auto-focus

  const router = useRouter();
  const searchParams = useSearchParams();
  const queryValue = searchParams.get("q") || "";

  // Fitur 1: Shortcut Ctrl + F
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault(); // Mencegah search bawaan browser
        if (!showSearch) {
          handleToggleSearch();
        } else {
          inputRef.current?.focus();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showSearch]);

  // Fitur 2: Reset input saat bar dimunculkan kembali
  const handleToggleSearch = () => {
    if (!showSearch) {
      // Jika akan membuka: Bersihkan query di URL agar input kosong
      const params = new URLSearchParams(searchParams);
      params.delete("q");
      router.replace(`?${params.toString()}`, { scroll: false });
    }
    setShowSearch((p) => !p);
  };

  // Auto-focus saat bar muncul
  useEffect(() => {
    if (showSearch) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [showSearch]);

  useEffect(() => {
    const height = showSearch ? "150px" : "110px";
    document.documentElement.style.setProperty("--header-height", height);
  }, [showSearch]);

  const handleSearch = (e) => {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams);
    if (value) params.set("q", value);
    else params.delete("q");
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target) && 
          toggleRef.current && !toggleRef.current.contains(e.target)) {
        setShowSearch(false);
      }
      if (volumeRef.current && !volumeRef.current.contains(e.target)) {
        setShowVolume(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header 
      onClick={unlockAudio} 
      className="fixed top-0 left-0 w-full z-50 bg-black transition-all duration-500 ease-in-out font-sans border-b border-zinc-900"
    >
      <div className="max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between px-2 md:px-4 py-3 min-h-[60px] gap-2">
          
          <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
            <span 
              onClick={() => setIsAlertActive(!isAlertActive)}
              className={`text-[8px] sm:text-[10px] cursor-pointer transition-all uppercase tracking-wider font-bold px-1.5 py-0.5 rounded border ${
                isAlertActive ? 'bg-red-600 text-white border-red-500 animate-pulse' : 'text-zinc-500 border-zinc-800 hover:text-white'
              }`}
            >
              Invasion
            </span>
            
            <div className="flex items-center gap-1">
              {/* Gunakan handleToggleSearch di sini */}
              <button ref={toggleRef} onClick={handleToggleSearch} className={`hover:text-white transition-all p-1 ${showSearch ? 'text-red-600' : 'text-zinc-500'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </button>

              <button onClick={() => setIsAddOpen(true)} className="text-zinc-500 hover:text-white transition-all p-1">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex-1 text-center px-1 min-w-0">
            <div className="text-green-500 text-[16px] sm:text-[20px] font-mono tracking-[0.1em] uppercase leading-none font-bold truncate">
              Kain 3
            </div>
            <div className="text-[8px] sm:text-[9px] text-zinc-500 tracking-[0.05em] mt-0 font-medium whitespace-nowrap overflow-hidden">
              Authenticated as : Admin
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0 relative">
            <div className="relative" ref={volumeRef}>
              <button onClick={() => setShowVolume(!showVolume)} className={`p-1 transition-colors ${showVolume ? 'text-white' : 'text-zinc-500 hover:text-white'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                </svg>
              </button>

              <AnimatePresence>
                {showVolume && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute right-0 top-full mt-2 bg-zinc-900 border border-zinc-800 p-3 rounded-lg shadow-2xl z-[60] w-32">
                    <div className="flex flex-col gap-2">
                      <input type="range" min="0" max="100" value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-600" />
                      <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                        <span>0%</span>
                        <span>{volume}%</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button className="text-zinc-500 hover:text-white transition-colors p-1 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.592c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c.007.378.138.75.43.99l1.004.827c.422.348.53.94.26 1.43l-1.297 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.592c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c-.007-.378.138-.75-.43-.99l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            </button>

            <button className="text-[8px] sm:text-[10px] text-red-600/70 hover:text-red-500 transition-colors uppercase font-bold tracking-widest flex-shrink-0">Logout</button>
          </div>
        </div>

        {/* Perbaikan Animasi: Gunakan opacity dan ease-in-out */}
        <AnimatePresence>
          {showSearch && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} 
              animate={{ height: 45, opacity: 1 }} 
              exit={{ height: 0, opacity: 0 }} 
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden bg-black px-2 md:px-4 pb-4"
            >
              <div ref={searchRef} className="relative">
                <input 
                  ref={inputRef}
                  value={queryValue} 
                  onChange={handleSearch} 
                  placeholder="Search BOSS..." 
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-10 py-1 text-white text-[10px] font-mono tracking-widest focus:border-red-600 transition-colors outline-none" 
                />
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-800">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <TableHeader />
      <AddBossModal 
        isOpen={isAddOpen} 
        onClose={() => setIsAddOpen(false)} 
      />
    </header>
  );
}