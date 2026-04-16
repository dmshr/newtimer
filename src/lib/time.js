// Variable untuk menyimpan selisih waktu (Server - Lokal)
let timeOffset = 0;

/**
 * Fungsi untuk mensinkronisasi waktu server dengan waktu lokal.
 * Dipanggil sekali saat aplikasi pertama kali dimuat (via TimeSync component).
 */
export async function syncTime() {
  try {
    const start = Date.now();
    
    // ✅ PERBAIKAN: Tambahkan query param timestamp (?t=) agar API tidak di-cache oleh Vercel/Browser
    const res = await fetch(`/api/time?t=${start}`);
    const { serverTime } = await res.json();
    
    const end = Date.now();
    
    // Menghitung latency (waktu tempuh request) agar lebih akurat
    const latency = (end - start) / 2;
    
    // Offset = Waktu Server Sebenarnya - Waktu Lokal User
    timeOffset = (serverTime + latency) - end;
    
    console.log(`[TimeSync] Offset Established: ${timeOffset}ms`);
  } catch (err) {
    console.error("Failed to sync time:", err);
  }
}

/**
 * Mendapatkan waktu "Server" secara virtual di sisi client
 */
export function getServerTime() {
  return Date.now() + timeOffset;
}

/**
 * Menghitung countdown berdasarkan waktu server yang tersinkronisasi
 */
export function getCountdown(spawnTime) {
  // 1. Validasi Awal
  if (!spawnTime || spawnTime === "--:--:--" || spawnTime === "UNKNOWN" || spawnTime === "NULL") {
    return { label: "UNKNOWN", seconds: 0 };
  }

  // ✅ Gunakan getServerTime() agar jam akurat mengikuti server
  const now = getServerTime();
  let targetDate;

  // 2. Konversi input ke objek Date
  if (spawnTime instanceof Date) {
    targetDate = spawnTime;
  } else {
    targetDate = new Date(spawnTime);
  }

  // 3. Validasi objek Date
  const targetTime = targetDate.getTime();
  if (isNaN(targetTime)) {
    return { label: "INVALID", seconds: 0 };
  }

  // 4. Hitung selisih menggunakan timestamp server
  const diff = Math.floor((targetTime - now) / 1000);

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