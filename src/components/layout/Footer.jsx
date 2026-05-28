export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-zinc-900 bg-black mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-4 md:py-6 text-center flex flex-col items-center justify-center gap-1.5">
        
        {/* Teks Copyright Utama */}
        <p className="text-[10px] sm:text-[11px] text-zinc-500 font-mono tracking-widest uppercase">
          &copy; {currentYear} <span className="text-red-600 font-black">DOGE 2</span> BOSS TIMER. ALL RIGHTS RESERVED.
        </p>
        
        {/* Sub-teks */}
        <p className="text-[8px] sm:text-[9px] text-zinc-700 font-semibold uppercase tracking-[0.2em]">
          Designed & Built for Lineage2M by Cookie
        </p>

      </div>
    </footer>
  );
}