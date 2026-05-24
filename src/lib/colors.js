// src/lib/colors.js

// Untuk Teks (Digunakan di BossRow)
export const getRarityColor = (variant) => {
  switch (variant?.toLowerCase()) {
    case 'invasi': case 'invasion': case 'orange': return 'text-orange-500';
    case 'legendary': case 'purple': return 'text-purple-500';
    case 'epic': case 'red': return 'text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]';
    case 'rare': case 'blue': return 'text-blue-400';
    case 'world': case 'white': return 'text-white';
    case 'mini boss': case 'miniboss': case 'cyan': return 'text-cyan-400'; 
    default: return 'text-zinc-300';
  }
};

// Untuk Teks + Border/Shadow (Digunakan di Modal)
export const getRarityClass = (variant) => {
  switch (variant?.toLowerCase()) {
    case 'invasi': case 'invasion': return 'text-orange-500 border-orange-900/50 shadow-[0_0_10px_rgba(249,115,22,0.1)]';
    case 'legendary': return 'text-purple-500 border-purple-900/50 shadow-[0_0_10px_rgba(168,85,247,0.1)]';
    case 'epic': return 'text-red-500 border-red-900/50 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]';
    case 'rare': return 'text-blue-400 border-blue-900/50 shadow-[0_0_10px_rgba(59,130,246,0.1)]';
    case 'world': return 'text-white border-zinc-700';
    case 'mini boss': return 'text-cyan-400 border-cyan-900/50 shadow-[0_0_10px_rgba(34,211,238,0.1)]';
    default: return 'text-zinc-300 border-zinc-800';
  }
};