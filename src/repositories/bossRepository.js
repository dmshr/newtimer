import { sql } from "@/lib/db";

export async function getAllBosses() {
  return await sql`SELECT * FROM bosses ORDER BY name ASC`;
}

export async function saveBoss(data) {
  // 1. Tambahkan properti 'use_db_time' dari payload
  const { name, spawn, killed, interval_hours, use_db_time } = data;
  const interval = parseInt(interval_hours) || 1;

  // 2. Jika menggunakan waktu database (Fitur "Just Now")
  if (use_db_time) {
    return await sql`
      INSERT INTO bosses (name, killed, spawn, interval_hours)
      VALUES (
        ${name}, 
        NOW(), 
        NOW() + (${interval} || ' hours')::interval, 
        ${interval}
      )
      ON CONFLICT (name) 
      DO UPDATE SET 
        killed = EXCLUDED.killed,
        spawn = EXCLUDED.spawn,
        interval_hours = EXCLUDED.interval_hours
    `;
  }

  // 3. Jika input manual (User mengetik waktu tertentu)
  // Kita tetap biarkan database yang menghitung 'spawn' berdasarkan 'killed' yang diinput
  return await sql`
    INSERT INTO bosses (name, killed, spawn, interval_hours)
    VALUES (
      ${name}, 
      ${killed}, 
      (${killed}::timestamp + (${interval} || ' hours')::interval), 
      ${interval}
    )
    ON CONFLICT (name) 
    DO UPDATE SET 
      killed = EXCLUDED.killed,
      spawn = EXCLUDED.spawn,
      interval_hours = EXCLUDED.interval_hours
  `;
}

export async function deleteBoss(name) {
  return await sql`DELETE FROM bosses WHERE name = ${name}`;
}