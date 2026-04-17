export default function TableHeader() {
  return (
    <div className="w-full bg-black">
      {/* ✅ Kontainer ini harus membungkus Grid agar sejajar dengan Header & Row */}
      <div className="max-w-5xl mx-auto w-full">
        <div 
          /** * ✅ SINKRONISASI TOTAL:
            * 1. Grid-cols: Harus sama dengan BossRow [100px_1fr_130px] / [140px_1fr_190px]
            * 2. Padding: Harus sama dengan BossRow & Header (px-3 md:px-4)
            * 3. Gap: Harus sama dengan BossRow (gap-2) agar teks kolom tengah lurus
            */
          className="grid grid-cols-[1.5fr_1fr_110px] md:grid-cols-[1.5fr_1fr_150px] gap-2 px-3 md:px-4 py-2 text-zinc-500 text-[9px] md:text-[10px] uppercase font-bold tracking-widest border-t border-zinc-900 bg-black/50"
        >
          {/* Kolom Kiri: Sejajar Nama Boss (pl-4 dihapus agar lurus sempurna) */}
          <span className="text-left pl-4 whitespace-nowrap">Boss</span>

          {/* Kolom Tengah: Sejajar dengan Waktu Spawn (pr-4 dipertahankan untuk jam) */}
          <span className="text-right pr-6 whitespace-nowrap">Spawn</span>

          {/* Kolom Kanan: Sejajar dengan Countdown & Icon */}
          <span className="text-center whitespace-nowrap">Countdown</span>
        </div>
      </div>

      {/* LINE GRADIENT - Ditaruh di luar kontainer agar garisnya memenuhi layar */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-70" />
    </div>
  );
}