import { sql } from "@/lib/db";

export async function getAllBosses() {
  // Karena kita simpan datanya sudah rapi, SELECT cukup pakai bintang saja.
  // Ini 100% aman dari error 500.
  return await sql`SELECT * FROM bosses ORDER BY name ASC`;
}

export async function saveBoss(data) {
  const { name, killed, interval_hours, use_db_time } = data;
  const interval = parseInt(interval_hours) || 1;

  if (use_db_time) {
    // 🔥 SAAT SIMPAN: Kita langsung minta DB buat teks format Jakarta yang rapi
    return await sql`
      INSERT INTO bosses (name, killed, spawn, interval_hours)
      VALUES (
        ${name}, 
        TO_CHAR(NOW() AT TIME ZONE 'Asia/Jakarta', 'DD Mon YYYY HH24:MI:SS'), 
        TO_CHAR((NOW() + (${interval} || ' hours')::interval) AT TIME ZONE 'Asia/Jakarta', 'DD Mon YYYY HH24:MI:SS'), 
        ${interval}
      )
      ON CONFLICT (name) 
      DO UPDATE SET 
        killed = EXCLUDED.killed,
        spawn = EXCLUDED.spawn,
        interval_hours = EXCLUDED.interval_hours
    `;
  }

  // 📝 INPUT MANUAL: 
  // Kita biarkan database menghitung spawn dari killed yang dikirim frontend
  return await sql`
    INSERT INTO bosses (name, killed, spawn, interval_hours)
    VALUES (
      ${name}, 
      ${killed}, 
      TO_CHAR((${killed}::timestamp + (${interval} || ' hours')::interval), 'DD Mon YYYY HH24:MI:SS'), 
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