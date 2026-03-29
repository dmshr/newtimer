const BASE_URL = "/api/boss";

export async function fetchBosses() {
  const res = await fetch(BASE_URL, {
    cache: "no-store", // 🔥 penting di Next.js
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error("Failed fetch bosses: " + text);
  }

  return res.json();
}

export async function updateBoss(data) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error("Failed update: " + text);
  }

  return res.json(); // 🔥 penting kalau mau dipakai nanti
}