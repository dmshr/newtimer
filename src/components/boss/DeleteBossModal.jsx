"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { deleteBoss } from "@/services/bossServices";

export default function DeleteBossModal({ boss, onClose, onSaved }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!boss) return;
    
    setIsLoading(true);
    try {
      await deleteBoss(boss.id);
      if (onSaved) await onSaved();
      onClose();
    } catch (err) {
      alert("Failed to delete boss");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {boss && (
        <motion.div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-[110] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div 
            className="bg-[#0b0b0b] border border-red-900/30 w-full max-w-[320px] rounded-2xl p-6 relative shadow-[0_0_40px_rgba(153,27,27,0.2)]"
            initial={{ scale: 0.9, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 10 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon Peringatan */}
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-red-950/30 rounded-full flex items-center justify-center border border-red-900/50">
                <span className="text-red-600 text-2xl font-black">!</span>
              </div>
            </div>

            <h2 className="text-center text-white font-black uppercase tracking-widest text-sm mb-2">
              Confirm Delete
            </h2>
            
            <p className="text-center text-zinc-500 text-[11px] leading-relaxed mb-6">
              Are you sure you want to delete <span className="text-zinc-200 font-bold">"{boss.name}"</span>? 
              This action cannot be undone.
            </p>

            <div className="flex flex-col gap-2">
              <button 
                onClick={handleDelete}
                disabled={isLoading}
                className="w-full bg-red-700 hover:bg-red-600 text-white font-black py-3 rounded-xl text-[10px] uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
              >
                {isLoading ? "DELETING..." : "YES, DELETE BOSS"}
              </button>
              
              <button 
                onClick={onClose}
                className="w-full bg-transparent hover:bg-zinc-900 text-zinc-500 font-bold py-3 rounded-xl text-[10px] uppercase tracking-widest transition-all"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}