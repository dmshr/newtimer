"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      setError("AUTHENTICATION FAILED");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060606] flex items-center justify-center p-4">
      {/* Container Utama yang Compact & Rounded */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[300px] bg-[#0b0b0b] border border-zinc-900 p-7 rounded-2xl relative shadow-2xl shadow-black"
      >
        {/* Dekorasi Corner Accent (Rounded Version) */}
        <div className="absolute top-3 left-3 w-2 h-2 rounded-full bg-red-600/20" />
        <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-zinc-800" />

        {/* Branding Area */}
        <div className="mb-4 text-center">
          <h1 className="text-red-500 text-3xl font-mono font-black tracking-tighter flex items-center justify-center gap-2">
            DOGE <span className="text-white">2</span>
          </h1>
          <div className="flex justify-center items-center gap-1 mt-1">
            <span className="h-[1px] w-4 bg-zinc-800" />
            <p className="text-zinc-600 text-[8px] font-bold uppercase tracking-[0.3em]">
              Kain 3
            </p>
            <span className="h-[1px] w-4 bg-zinc-800" />
          </div>
        </div>

        {/* Form Login */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[9px] text-zinc-500 font-bold tracking-widest ml-1">Username</label>
            <input
              type="text"
              required
              spellCheck="false"
              className="w-full bg-black border border-zinc-800 px-4 py-2.5 text-white outline-none focus:border-red-600/50 transition-all font-mono text-xs rounded-xl placeholder:text-zinc-700"
              placeholder="USERNAME"
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest ml-1">Password</label>
            <input
              type="password"
              required
              className="w-full bg-black border border-zinc-800 px-4 py-2.5 text-white outline-none focus:border-red-600/50 transition-all font-mono text-xs rounded-xl placeholder:text-zinc-700"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }} 
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-[9px] font-black text-center uppercase py-2 bg-red-500/5 border border-red-500/10 rounded-lg"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-500 disabled:bg-zinc-900 text-white disabled:text-zinc-700 font-black py-2 rounded-xl text-[11px] uppercase transition-all mt-2 tracking-[0.1em] shadow-lg shadow-red-900/20 active:scale-95"
          >
            {loading ? "Verifying..." : "Login"}
          </button>
        </form>

        {/* Footer Metadata */}
        <div className="mt-4 pt-4 border-t border-red-900/50 flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest">
              Secure Connection
            </span>
          </div>
          <span className="text-[7px] text-zinc-600 font-mono uppercase">
            Contact : CookieMay - Kain 3
          </span>
        </div>
      </motion.div>
    </div>
  );
}