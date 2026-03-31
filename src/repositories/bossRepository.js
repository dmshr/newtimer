import { sql } from "@/lib/db";

export async function getAllBosses() {
  // Ambil semua data boss
  return await sql`SELECT * FROM bosses ORDER BY name ASC`;
}

export async function saveBoss(data) {
  const { name, spawn, killed } = data;
  
  // Logika UPSERT: Jika nama sudah ada, update datanya.
  return await sql`
    INSERT INTO bosses (name, spawn, killed)
    VALUES (${name}, ${spawn}, ${killed})
    ON CONFLICT (name) 
    DO UPDATE SET 
      spawn = EXCLUDED.spawn,
      killed = EXCLUDED.killed
  `;
}

export async function deleteBoss(name) {
  return await sql`DELETE FROM bosses WHERE name = ${name}`;
}