import { sql } from "@/lib/db";

// 1. AMBIL SEMUA DATA BOSS
export async function getAllBosses() {
  return await sql`SELECT * FROM bosses ORDER BY name ASC`;
}

// 2. UPDATE TIMER & ADD BOSS (Tombol Tengkorak)
export async function saveBoss(data) {
  const { name, killed, interval_hours, use_db_time, rarity } = data; 
  const interval = parseInt(interval_hours) || 1;
  const bossRarity = rarity || 'World';

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
      RETURNING *
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
    RETURNING *
  `;
}

// 3. UPDATE DETAIL (Nama, Interval, Rarity)
export async function updateBossDetail(data) {
  const { id, name, interval_hours, rarity } = data;
  const interval = parseInt(interval_hours) || 1;

  return await sql`
    UPDATE bosses 
    SET 
      name = ${name},
      interval_hours = ${interval},
      rarity = ${rarity},
      spawn = CASE 
        WHEN killed IS NOT NULL AND killed <> '' AND killed <> '--:--:--'
        THEN TO_CHAR((killed::timestamp + (${interval} || ' hours')::interval), 'DD Mon YYYY HH24:MI:SS')
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

// 🔥 --- FUNGSI GLOBAL SETTINGS (INVASION & ANNOUNCEMENT) --- 🔥

// 5. RESET WAKTU INVASION SECARA GLOBAL
export async function resetInvasionTimes() {
  return await sql`
    UPDATE bosses 
    SET killed = NULL, spawn = NULL 
    WHERE rarity ILIKE 'Invasion' OR rarity ILIKE 'Invasi'
  `;
}

// 6. SIMPAN STATUS / TEKS KE DATABASE
export async function updateGlobalSetting(key, value) {
  const stringValue = String(value);
  return await sql`
    INSERT INTO settings (key, value)
    VALUES (${key}, ${stringValue})
    ON CONFLICT (key) 
    DO UPDATE SET value = EXCLUDED.value
  `;
}

// 7. AMBIL STATUS / TEKS DARI DATABASE
export async function getGlobalSetting(key) {
  const result = await sql`SELECT value FROM settings WHERE key = ${key}`;
  if (result.length === 0) return null;
  const rawValue = result[0].value;
  if (rawValue === 'true') return true;
  if (rawValue === 'false') return false;
  return rawValue;
}

// 8. AMBIL SEMUA DATA SALARY DARI NEON
export async function getAllSalaries() {
  return await sql`SELECT * FROM salaries ORDER BY id ASC`;
}

// 9. RE-INSERT DATA SALARY (6 KOLOM: A-F)
export async function syncSalariesFromSheet(dataArray) {
  await sql`TRUNCATE TABLE salaries`;

  for (const item of dataArray) {
    await sql`
      INSERT INTO salaries (member_name, last_week, current_salary, debt, receivables, total_amount)
      VALUES (
        ${item.member_name}, 
        ${item.last_week}, 
        ${item.current_salary}, 
        ${item.debt}, 
        ${item.receivables}, 
        ${item.total_amount}
      )
    `;
  }
  return { success: true };
}