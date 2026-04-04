import { sql } from "@/lib/db";

export async function getAllBosses() {
  // Ditambah rarity dan diurutkan berdasarkan name
  return await sql`SELECT * FROM bosses ORDER BY name ASC`;
}

// 1. UPDATE TIMER (Logika Tengkorak - Tetap pakai Name untuk ON CONFLICT agar aman)
export async function saveBoss(data) {
  const { name, killed, interval_hours, use_db_time } = data;
  const interval = parseInt(interval_hours) || 1;

  if (use_db_time) {
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

// 2. ✅ FUNGSI BARU: UPDATE DETAIL (Untuk Menu Titik 3 - Menggunakan ID)
export async function updateBossDetail(data) {
  const { id, name, interval_hours, rarity } = data;
  const interval = parseInt(interval_hours) || 1;

  // Kita update Name, Interval, dan Rarity berdasarkan ID
  // Kita juga hitung ulang 'spawn' secara otomatis jika interval diubah
  return await sql`
    UPDATE bosses 
    SET 
      name = ${name},
      interval_hours = ${interval},
      rarity = ${rarity},
      spawn = TO_CHAR((killed::timestamp + (${interval} || ' hours')::interval), 'DD Mon YYYY HH24:MI:SS')
    WHERE id = ${id}
  `;
}

// 3. ✅ UPDATE: DELETE MENGGUNAKAN ID (Lebih Akurat)
export async function deleteBoss(id) {
  return await sql`DELETE FROM bosses WHERE id = ${id}`;
}