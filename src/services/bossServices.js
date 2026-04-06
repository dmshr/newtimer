const BASE_URL = "/api/boss";

// 1. Ambil Semua Data Boss
export async function fetchBosses() {
  const res = await fetch(BASE_URL, {
    cache: "no-store", 
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error("Failed fetch bosses: " + text);
  }

  return res.json();
}

// 2. Update Timer (Tombol Tengkorak)
export async function updateBoss(data) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error("Failed update: " + text);
  }

  return res.json();
}

// 3. Edit Detail Boss (Nama, Interval, Rarity)
export async function updateBossDetail(data) {
  const res = await fetch(BASE_URL, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error("Failed update detail: " + text);
  }

  return res.json();
}

// 4. Hapus Boss
export async function deleteBoss(id) {
  const res = await fetch(`${BASE_URL}?id=${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error("Failed delete: " + text);
  }

  return res.json();
}

// 🔥 --- FUNGSI GLOBAL BARU --- 🔥

// 5. Reset Semua Waktu Boss Invasion (Global)
export async function resetInvasionGlobal() {
  const res = await fetch(`${BASE_URL}/invasion/reset`, {
    method: "POST",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error("Failed global reset: " + text);
  }

  return res.json();
}

// 6. Update Status ON/OFF Invasion (Global)
export async function updateInvasionStatusGlobal(status) {
  const res = await fetch(`${BASE_URL}/invasion/status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ showInvasion: status }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error("Failed update global status: " + text);
  }

  return res.json();
}

// 7. Ambil Status ON/OFF Invasion Saat Ini (Global)
export async function fetchInvasionStatusGlobal() {
  const res = await fetch(`${BASE_URL}/invasion/status`);
  
  if (!res.ok) return { showInvasion: true }; // Default jika error
  
  return res.json();
}