import { sql } from "@/lib/db";

export async function getAllBosses() {
  // Ambil semua data boss
  return await sql`SELECT * FROM bosses ORDER BY name ASC`;
}

export async function saveBoss(data) {
  // ✅ 1. Ambil interval_hours dari data payload
  const { name, spawn, killed, interval_hours } = data;
  
  // ✅ 2. Pastikan nilai interval adalah angka (default ke 1 jika kosong)
  const interval = parseInt(interval_hours) || 1;

  // ✅ 3. Update query untuk menyertakan interval_hours
  return await sql`
    INSERT INTO bosses (name, spawn, killed, interval_hours)
    VALUES (${name}, ${spawn}, ${killed}, ${interval})
    ON CONFLICT (name) 
    DO UPDATE SET 
      spawn = EXCLUDED.spawn,
      killed = EXCLUDED.killed,
      interval_hours = EXCLUDED.interval_hours
  `;
}

export async function deleteBoss(name) {
  return await sql`DELETE FROM bosses WHERE name = ${name}`;
}