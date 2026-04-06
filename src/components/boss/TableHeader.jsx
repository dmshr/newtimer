export default function TableHeader() {
  return (
    <div className="w-full bg-black">
      {/* ✅ Kontainer ini harus membungkus Grid agar sejajar dengan Header & Row */}
      <div className="max-w-5xl mx-auto w-full">
        <div 
          /** * ✅ SINKRONISASI TOTAL:
           * 1. Grid-cols: Harus sama dengan BossRow [80px_1fr_130px] / [140px_1fr_190px]
           * 2. Padding: Harus sama dengan BossRow & Header (px-2 md:px-4)
           * 3. Gap: Harus sama dengan BossRow (gap-2) agar teks kolom tengah lurus
           */
          className="grid grid-cols-[80px_1fr_130px] md:grid-cols-[140px_1fr_190px] gap-2 px-2 md:px-4 py-2 text-zinc-500 text-[9px] md:text-[10px] uppercase font-bold tracking-widest border-t border-zinc-900 bg-black/50"
        >
          {/* Kolom Kiri: Sejajar Nama Boss */}
          <span className="text-left pl-4 whitespace-nowrap">Boss</span>

          {/* Kolom Tengah: Sejajar dengan Waktu Spawn (Teks kanan agar lurus dengan jam) */}
          <span className="text-right pr-4 whitespace-nowrap">Spawn</span>

          {/* Kolom Kanan: Sejajar dengan Countdown & Icon */}
          <span className="text-center whitespace-nowrap">Countdown</span>
        </div>
      </div>

      {/* LINE GRADIENT - Ditaruh di luar kontainer agar garisnya memenuhi layar (optional) */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-70" />
    </div>
  );
}