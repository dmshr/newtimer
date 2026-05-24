// src/lib/time.js

// Variable untuk menyimpan selisih waktu (Server - Lokal)
let timeOffset = 0;

export async function syncTime() {
  try {
    const start = Date.now();
    const res = await fetch(`/api/time?t=${start}`);
    const { serverTime } = await res.json();
    const end = Date.now();
    
    const latency = (end - start) / 2;
    timeOffset = (serverTime + latency) - end;
    
    console.log(`[TimeSync] Offset Established: ${timeOffset}ms`);
  } catch (err) {
    console.error("Failed to sync time:", err);
  }
}

export function getServerTime() {
  return Date.now() + timeOffset;
}

export function getCountdown(spawnTime) {
  if (!spawnTime || spawnTime === "--:--:--" || spawnTime === "UNKNOWN" || spawnTime === "NULL") {
    return { label: "UNKNOWN", seconds: 0 };
  }

  const now = getServerTime();
  let targetDate;

  if (spawnTime instanceof Date) {
    targetDate = spawnTime;
  } else {
    // ✅ PERBAIKAN LOGIKA BISNIS: Paksa string sebagai waktu Jakarta (GMT+0700)
    // Menghindari perbedaan kalkulasi timer bagi user yang membuka web dari zona waktu berbeda
    const cleanString = String(spawnTime).trim();
    targetDate = new Date(`${cleanString} GMT+0700`);
  }

  const targetTime = targetDate.getTime();
  if (isNaN(targetTime)) {
    return { label: "INVALID", seconds: 0 };
  }

  const diff = Math.floor((targetTime - now) / 1000);

  if (diff <= 0) return { label: "SPAWNED", seconds: diff };

  const hours = Math.floor(diff / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  const seconds = diff % 60;

  let label = "";
  if (hours > 0) label += `${hours}h `;
  if (minutes > 0 || hours > 0) label += `${minutes}m `;
  label += `${seconds}s`;

  return { label: label.trim(), seconds: diff };
}