const BASE_URL = "/api/boss";

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

// 💀 UPDATE TIMER (Tombol Tengkorak) - Menggunakan POST
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

// ✅ 1. EDIT DETAIL (Nama, Interval, Rarity) - Menggunakan PATCH
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

// ✅ 2. DELETE BOSS - Menggunakan DELETE
export async function deleteBoss(id) {
  // Kita kirim ID lewat query string: /api/boss?id=123
  const res = await fetch(`${BASE_URL}?id=${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error("Failed delete: " + text);
  }

  return res.json();
}