import { sql } from "@/lib/db";

// 1. AMBIL SEMUA DATA BOSS
export async function getAllBosses() {
  return await sql`SELECT * FROM bosses ORDER BY name ASC`;
}

// 2. UPDATE TIMER & ADD BOSS
export async function saveBoss(data) {
  const { name, killed, spawn, interval_hours, use_db_time, rarity, action, manual_spawn, expected_spawn } = data; 
  const interval = parseFloat(interval_hours) || 60;
  const bossRarity = rarity || 'World';
  const safeKilled = killed || null;
  const safeSpawn = spawn || null;

  // 🔥 LOGIKA 1: "NOT SPAWNED" 
  // (Spawn time lama + interval = Spawn time baru). Killed time aman.
  if (action === 'not_spawned') {
    return await sql`
      UPDATE bosses 
      SET spawn = TO_CHAR(TO_TIMESTAMP(spawn, 'DD Mon YYYY HH24:MI:SS') + (${interval} * interval '1 minute'), 'DD Mon YYYY HH24:MI:SS')
      WHERE name = ${name} 
      AND spawn = ${expected_spawn} -- 🔒 KUNCI: Hanya update jika spawn di DB masih sama dengan expected_spawn
      AND spawn <> '--:--:--' AND spawn IS NOT NULL
      RETURNING *
    `;
  }

  // 🔥 LOGIKA 3: "⚙️ SPAWN TIME"
  // (Hanya mengubah Spawn time sesuai input manual). Killed time aman.
  if (manual_spawn) {
    return await sql`
      UPDATE bosses 
      SET 
        spawn = ${safeSpawn},
        interval_hours = ${interval},
        rarity = ${bossRarity}
      WHERE name = ${name}
      AND spawn = ${expected_spawn} -- 🔒 KUNCI
      RETURNING *
    `;
  }

  // 🔥 LOGIKA 2: "JUST NOW"
  // (Ambil waktu server saat ini untuk Killed, hitung Spawn baru).
  if (use_db_time) {
    return await sql`
      INSERT INTO bosses (name, killed, spawn, interval_hours, rarity)
      VALUES (
        ${name}, 
        TO_CHAR(NOW() AT TIME ZONE 'Asia/Jakarta', 'DD Mon YYYY HH24:MI:SS'), 
        TO_CHAR((NOW() + (${interval} * interval '1 minute')) AT TIME ZONE 'Asia/Jakarta', 'DD Mon YYYY HH24:MI:SS'), 
        ${interval},
        ${bossRarity}
      )
      ON CONFLICT (name) 
      DO UPDATE SET 
        killed = EXCLUDED.killed,
        spawn = EXCLUDED.spawn,
        interval_hours = EXCLUDED.interval_hours,
        rarity = EXCLUDED.rarity
      WHERE bosses.spawn = ${expected_spawn}
      RETURNING *
    `;
  }

  // 🔥 LOGIKA 4: "💀 KILLED TIME"
  // (Mengubah killed manual + kalkulasi otomatis spawn time baru).
  return await sql`
    INSERT INTO bosses (name, killed, spawn, interval_hours, rarity)
    VALUES (
      ${name}, 
      ${safeKilled}, 
      CASE 
        WHEN ${safeKilled}::text IS NOT NULL THEN TO_CHAR((TO_TIMESTAMP(${safeKilled}::text, 'DD Mon YYYY HH24:MI:SS') + (${interval} * interval '1 minute')), 'DD Mon YYYY HH24:MI:SS')
        ELSE NULL 
      END, 
      ${interval},
      ${bossRarity}
    )
    ON CONFLICT (name) 
    DO UPDATE SET 
      killed = COALESCE(EXCLUDED.killed, bosses.killed),
      spawn = COALESCE(EXCLUDED.spawn, bosses.spawn),
      interval_hours = EXCLUDED.interval_hours,
      rarity = EXCLUDED.rarity
    WHERE bosses.spawn = ${expected_spawn}
    RETURNING *
  `;
}

// 3. UPDATE DETAIL (Nama, Interval, Rarity)
export async function updateBossDetail(data) {
  const { id, name, interval_hours, rarity } = data;
  const interval = parseFloat(interval_hours) || 60;

  return await sql`
    UPDATE bosses 
    SET 
      name = ${name},
      interval_hours = ${interval},
      rarity = ${rarity},
      spawn = CASE 
        WHEN killed IS NOT NULL AND killed <> '' AND killed <> '--:--:--' AND killed NOT LIKE '%NaN%'
        THEN TO_CHAR((TO_TIMESTAMP(killed, 'DD Mon YYYY HH24:MI:SS') + (${interval} * interval '1 minute')), 'DD Mon YYYY HH24:MI:SS')
        ELSE spawn 
      END
    WHERE id = ${id}
    RETURNING *
  `;
}

// 4. DELETE BOSS
export async function deleteBoss(id) {
  return await sql`DELETE FROM bosses WHERE id = ${id} RETURNING id`;
}

// 5. RESET INVASION
export async function resetInvasionTimes() {
  return await sql`
    UPDATE bosses 
    SET killed = NULL, spawn = NULL 
    WHERE rarity ILIKE 'Invasion' OR rarity ILIKE 'Invasi'
  `;
}

// 6. GLOBAL SETTING
export async function updateGlobalSetting(key, value) {
  const stringValue = String(value);
  return await sql`
    INSERT INTO settings (key, value)
    VALUES (${key}, ${stringValue})
    ON CONFLICT (key) 
    DO UPDATE SET value = EXCLUDED.value
  `;
}

// 7. GET SETTING
export async function getGlobalSetting(key) {
  const result = await sql`SELECT value FROM settings WHERE key = ${key}`;
  if (result.length === 0) return null;
  const rawValue = result[0].value;
  if (rawValue === 'true') return true;
  if (rawValue === 'false') return false;
  return rawValue;
}

// 8. ALL SALARIES
export async function getAllSalaries() {
  return await sql`SELECT * FROM salaries ORDER BY id ASC`;
}

// 9. SYNC SALARIES
export async function syncSalariesFromSheet(dataArray) {
  await sql`TRUNCATE TABLE salaries`;
  for (const item of dataArray) {
    await sql`
      INSERT INTO salaries (member_name, last_week, current_salary, debt, receivables, total_amount)
      VALUES (${item.member_name}, ${item.last_week}, ${item.current_salary}, ${item.debt}, ${item.receivables}, ${item.total_amount})
    `;
  }
  return { success: true };
}