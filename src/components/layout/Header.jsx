"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import { useSound } from "@/context/SoundContext";
import { useInvasion } from "@/context/InvasionContext"; 
import TableHeader from "@/components/boss/TableHeader";
import AddBossModal from "@/components/boss/AddBossModal";
import RegisterUserModal from "@/components/layout/RegisterUserModal"; 
import AnnouncementBar from "@/components/boss/AnnouncementBar"; 
import InvasionControl from "@/components/boss/InvasionControl";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { volume, setVolume, unlockAudio } = useSound();
  const { showInvasion } = useInvasion(); 

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [showVolume, setShowVolume] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [showAnnounceInput, setShowAnnounceInput] = useState(false);
  const [tempAnnounce, setTempAnnounce] = useState("");

  const searchRef = useRef(null);
  const toggleRef = useRef(null);
  const volumeRef = useRef(null);
  const inputRef = useRef(null);

  const userRole = session?.user?.role || "User";
  const isLoginPage = pathname === "/login";
  const canManage = ["Admin", "SuperAdmin", "Master"].includes(userRole);
  const isMaster = userRole === "Master";
  const queryValue = searchParams.get("q") || "";

  const currentView = searchParams.get("view") || "boss";
  const canSeeSalary = ["SuperAdmin", "Master"].includes(userRole);

  const dropdownAnimation = {
    initial: { height: 0, opacity: 0 },
    animate: { 
      height: "auto", 
      opacity: 1,
      transition: { height: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }, opacity: { duration: 0.25 } } 
    },
    exit: { 
      height: 0, 
      opacity: 0,
      transition: { height: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }, opacity: { duration: 0.2 } } 
    }
  };

  const switchView = (viewName) => {
    const params = new URLSearchParams(searchParams);
    if (viewName === "boss") params.delete("view");
    else params.set("view", viewName);
    router.replace(`?${params.toString()}`, { scroll: false });
    setIsMenuOpen(false);
  };

  // ✅ KEMBALIKAN FUNGSI CTRL + F
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault(); // Mencegah browser buka search bawaan
        setIsMenuOpen(false); // Tutup menu jika terbuka
        setShowAnnounceInput(false);
        setShowSearch(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isMaster && showAnnounceInput) {
      fetch("/api/settings?key=announcement_text")
        .then(res => res.json())
        .then(data => setTempAnnounce(data.value || ""));
    }
  }, [isMaster, showAnnounceInput]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target) && 
          toggleRef.current && !toggleRef.current.contains(e.target)) {
        setShowSearch(false);
      }
      if (volumeRef.current && !volumeRef.current.contains(e.target)) {
        setShowVolume(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleSearch = () => {
    if (!showSearch) {
      const params = new URLSearchParams(searchParams);
      params.delete("q");
      router.replace(`?${params.toString()}`, { scroll: false });
    }
    setShowSearch((p) => !p);
    setShowAnnounceInput(false); 
    setIsMenuOpen(false); 
    if (!showSearch) setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams);
    if (value) params.set("q", value);
    else params.delete("q");
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const saveAnnouncement = async () => {
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "announcement_text", value: tempAnnounce }),
    });
    setShowAnnounceInput(false);
  };

  const clearAnnouncement = async () => {
    setTempAnnounce("");
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "announcement_text", value: "" }),
    });
  };

  if (isLoginPage) return null;

  return (
    <header 
      onClick={unlockAudio} 
      className="sticky top-0 left-0 w-full z-[100] isolate bg-black border-b border-zinc-900 flex flex-col"
    >
      <div className="max-w-5xl mx-auto w-full">
        {/* TOP BAR */}
        <div className="flex items-center justify-between px-3 md:px-4 py-3 min-h-[60px] gap-2">
          
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <button 
              onClick={() => { setIsMenuOpen(!isMenuOpen); setShowSearch(false); }}
              className={`p-1.5 rounded-lg transition-all ${isMenuOpen ? 'text-red-600 bg-red-600/10' : 'text-zinc-500 hover:text-white'}`}
            >
              <AnimatePresence mode="wait">
                {isMenuOpen ? (
                  <motion.svg key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </motion.svg>
                ) : (
                  <motion.svg key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </motion.svg>
                )}
              </AnimatePresence>
            </button>

            <InvasionControl />
            
            <button 
              ref={toggleRef} 
              onClick={handleToggleSearch} 
              className={`hover:text-white transition-all p-1.5 rounded-lg ${showSearch ? 'text-red-600 bg-red-600/10' : 'text-zinc-500'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </button>
          </div>

          <div className="flex-1 text-center px-1 min-w-0">
            <div className="text-red-500 text-[16px] sm:text-[20px] font-mono tracking-[0.15em] uppercase leading-none font-black truncate">
              DOGE <span className="text-white">2</span>
            </div>
            <div className="text-[8px] sm:text-[9px] text-zinc-600 tracking-[0.1em] mt-1 font-semibold truncate uppercase font-bold">
              Authenticated as : <span className="text-red-600">{userRole}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-1 flex-shrink-0 relative">
            {isMaster && (
              <button 
                onClick={() => { setShowAnnounceInput(!showAnnounceInput); setShowSearch(false); setIsMenuOpen(false); }}
                className={`p-1.5 rounded-lg transition-all ${showAnnounceInput ? 'text-red-600 bg-red-600/10' : 'text-zinc-500 hover:text-white'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 sm:w-5 sm:h-5"><path d="m3 11 18-5v12L3 14v-3z" /><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" /></svg>
              </button>
            )}

            <div className="relative" ref={volumeRef}>
              <button onClick={() => setShowVolume(!showVolume)} className={`p-1.5 transition-colors rounded-lg ${showVolume ? 'text-white bg-zinc-800' : 'text-zinc-500 hover:text-white'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" /></svg>
              </button>
              <AnimatePresence>
                {showVolume && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute right-0 top-full mt-1 bg-zinc-950 border border-zinc-800 p-2 rounded-xl shadow-2xl z-[60] w-40">
                    <input type="range" min="0" max="100" value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-600" />
                    <div className="flex justify-between text-[10px] font-black font-mono text-zinc-500 uppercase mt-1">
                        <span>Min</span> <span className="text-red-500">{volume}%</span> <span>Max</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button onClick={() => signOut()} className="text-[8px] sm:text-[8px] text-red-800 hover:text-red-500 transition-colors uppercase font-bold tracking-widest border border-zinc-900 hover:border-red-900/50 px-2 py-1 rounded-lg">
              Logout
            </button>
          </div>
        </div>

        {/* MENU DRAWER (HAMBURGER) */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div {...dropdownAnimation} className="overflow-hidden bg-[#0a0a0a] border-t border-zinc-900">
              <div className="px-4 py-2 flex flex-wrap items-center gap-3 sm:gap-4">
                {canSeeSalary && (
                  <div className="flex bg-zinc-900 border border-zinc-800 p-0.5 rounded-xl">
                    <button onClick={() => switchView("boss")} className={`px-2 py-1 rounded-lg text-[9px] font-black transition-all ${currentView === 'boss' ? 'bg-red-600 text-white' : 'text-zinc-600 hover:text-zinc-400'}`}>Boss List</button>
                    <button onClick={() => switchView("salary")} className={`px-2 py-1 rounded-lg text-[9px] font-black transition-all ${currentView === 'salary' ? 'bg-red-600 text-white' : 'text-zinc-600 hover:text-zinc-400'}`}>Salary</button>
                  </div>
                )}
                {canManage && (
                  <button onClick={() => { setIsAddOpen(true); setIsMenuOpen(false); }} className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-2 py-1 rounded-xl text-[9px] font-black uppercase text-zinc-400 hover:text-white transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg> Add Boss
                  </button>
                )}
                {isMaster && (
                  <button onClick={() => { setIsRegisterOpen(true); setIsMenuOpen(false); }} className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-2 py-1 rounded-xl text-[9px] font-black uppercase text-zinc-400 hover:text-white transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg> Register
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SEARCH BAR DRAWER */}
        <AnimatePresence>
          {showSearch && (
            <motion.div {...dropdownAnimation} className="overflow-hidden bg-black">
              <div className="px-3 md:px-4 pb-4">
                <div ref={searchRef} className="relative">
                  <input ref={inputRef} value={queryValue} onChange={handleSearch} placeholder="FILTER BOSS NAME..." className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-11 py-2 text-white text-[11px] font-mono tracking-widest focus:border-red-600/50 outline-none" />
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ANNOUNCEMENT DRAWER */}
        <AnimatePresence>
          {showAnnounceInput && isMaster && (
            <motion.div {...dropdownAnimation} className="overflow-hidden bg-zinc-950 border-t border-zinc-900">
              <div className="px-4 py-3 flex flex-col gap-2">
                <div className="flex gap-2 items-center">
                  <input value={tempAnnounce} onChange={(e) => setTempAnnounce(e.target.value)} placeholder="TYPE ANNOUNCEMENT..." className="flex-1 bg-black border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-red-600 font-mono" />
                  <button onClick={saveAnnouncement} className="bg-red-600 hover:bg-red-500 text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-colors">Save</button>
                </div>
                <button onClick={clearAnnouncement} className="text-[9px] text-zinc-600 hover:text-red-500 font-bold uppercase tracking-widest text-left">Clear Announcement</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnnouncementBar />
      {currentView !== "salary" && <TableHeader />}
      {canManage && <AddBossModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />}
      {isMaster && <RegisterUserModal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />}
    </header>
  );
}