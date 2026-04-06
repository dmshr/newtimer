import { sql } from "@/lib/db";

export async function getAllBosses() {
  // Ditambah rarity dan diurutkan berdasarkan name
  return await sql`SELECT * FROM bosses ORDER BY name ASC`;
}

// 1. UPDATE TIMER & ADD BOSS
export async function saveBoss(data) {
  // ✅ TAMBAHKAN 'rarity' di destructuring
  const { name, killed, interval_hours, use_db_time, rarity } = data; 
  const interval = parseInt(interval_hours) || 1;
  const bossRarity = rarity || 'World'; // Default jika kosong

  if (use_db_time) {
    return await sql`
      INSERT INTO bosses (name, killed, spawn, interval_hours, rarity)
      VALUES (
        ${name}, 
        TO_CHAR(NOW() AT TIME ZONE 'Asia/Jakarta', 'DD Mon YYYY HH24:MI:SS'), 
        TO_CHAR((NOW() + (${interval} || ' hours')::interval) AT TIME ZONE 'Asia/Jakarta', 'DD Mon YYYY HH24:MI:SS'), 
        ${interval},
        ${bossRarity}
      )
      ON CONFLICT (name) 
      DO UPDATE SET 
        killed = EXCLUDED.killed,
        spawn = EXCLUDED.spawn,
        interval_hours = EXCLUDED.interval_hours,
        rarity = EXCLUDED.rarity
    `;
  }

  return await sql`
    INSERT INTO bosses (name, killed, spawn, interval_hours, rarity)
    VALUES (
      ${name}, 
      ${killed}, 
      TO_CHAR((${killed}::timestamp + (${interval} || ' hours')::interval), 'DD Mon YYYY HH24:MI:SS'), 
      ${interval},
      ${bossRarity}
    )
    ON CONFLICT (name) 
    DO UPDATE SET 
      killed = EXCLUDED.killed,
      spawn = EXCLUDED.spawn,
      interval_hours = EXCLUDED.interval_hours,
      rarity = EXCLUDED.rarity
  `;
}

// 2. UPDATE DETAIL (Nama, Interval, Rarity)
export async function updateBossDetail(data) {
  const { id, name, interval_hours, rarity } = data;
  const interval = parseInt(interval_hours) || 1;

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

// 3. DELETE BOSS
export async function deleteBoss(id) {
  return await sql`DELETE FROM bosses WHERE id = ${id}`;
}