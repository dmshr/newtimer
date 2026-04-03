export function getCountdown(spawnTime) {
  // 1. Validasi Awal (Menangani data kosong atau format --:--:--)
  if (!spawnTime || spawnTime === "--:--:--" || spawnTime === "UNKNOWN" || spawnTime === "NULL") {
    return { label: "UNKNOWN", seconds: 0 };
  }

  const now = new Date();
  let targetDate;

  // 2. Konversi input ke objek Date
  if (spawnTime instanceof Date) {
    targetDate = spawnTime;
  } else {
    // Gunakan regex atau replace jika sewaktu-waktu format dari DB sedikit berbeda
    // Safari kadang rewel dengan format "04 Apr 2026", kita pastikan formatnya standar
    targetDate = new Date(spawnTime);
  }

  // 3. Validasi apakah objek Date valid
  if (isNaN(targetDate.getTime())) {
    return { label: "INVALID", seconds: 0 };
  }

  // 4. Hitung Selisih
  const diff = Math.floor((targetDate - now) / 1000);

  // Jika waktu target sudah terlewati
  if (diff <= 0) return { label: "SPAWNED", seconds: diff };

  // 5. Kalkulasi Label (HHh MMm SSs)
  const hours = Math.floor(diff / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  const seconds = diff % 60;

  let label = "";
  if (hours > 0) label += `${hours}h `;
  if (minutes > 0 || hours > 0) label += `${minutes}m `;
  label += `${seconds}s`;

  return { label: label.trim(), seconds: diff };
}