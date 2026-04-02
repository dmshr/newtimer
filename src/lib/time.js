export function getCountdown(spawnTime) {
  // 1. Validasi Awal
  if (!spawnTime || spawnTime === "--:--:--" || spawnTime === "UNKNOWN") {
    return { label: "UNKNOWN", seconds: 0 };
  }

  const now = new Date();
  let targetDate;

  // 2. Deteksi Tipe Input
  if (spawnTime instanceof Date) {
    // Jika input sudah berupa objek Date
    targetDate = spawnTime;
  } else if (typeof spawnTime === "string") {
    if (spawnTime.includes(" ")) {
      // Jika format tanggal lengkap: "01 Apr 2026 14:00:00"
      targetDate = new Date(spawnTime);
    } else {
      // Jika format jam lama: "HH:mm:ss"
      const parts = spawnTime.split(":");
      if (parts.length !== 3) return { label: "INVALID", seconds: 0 };

      const [h, m, s] = parts.map(Number);
      targetDate = new Date();
      targetDate.setHours(h, m, s, 0);

      // Logic lama: Jika jam sudah lewat, asumsikan besok 
      // (hanya berlaku untuk input yang tidak punya tanggal)
      if (targetDate < now) targetDate.setDate(targetDate.getDate() + 1);
    }
  }

  // 3. Hitung Selisih (Selisih milidetik diubah ke detik)
  const diff = Math.floor((targetDate - now) / 1000);

  // Jika waktu target sudah terlewati
  if (diff <= 0) return { label: "SPAWNED", seconds: 0 };

  // 4. Kalkulasi Jam, Menit, Detik untuk Label
  const hours = Math.floor(diff / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  const seconds = diff % 60;

  let label = "";
  if (hours > 0) label += `${hours}h `;
  if (minutes > 0 || hours > 0) label += `${minutes}m `;
  label += `${seconds}s`;

  return { label: label.trim(), seconds: diff };
}