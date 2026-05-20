import { sql } from "@/lib/db";

export async function getAllBosses() {
  return await sql`SELECT * FROM bosses ORDER BY name ASC`;
}

// 2. UPDATE TIMER & ADD BOSS
export async function saveBoss(data) {
  const { name, killed, spawn, interval_hours, use_db_time, rarity, action, manual_spawn } = data; 
  const interval = parseFloat(interval_hours) || 1;
  const bossRarity = rarity || 'World';

  // 🔥 LOGIKA "NOT SPAWNED"
  if (action === 'not_spawned') {
    return await sql`
      UPDATE bosses 
      SET spawn = TO_CHAR(TO_TIMESTAMP(spawn, 'DD Mon YYYY HH24:MI:SS') + (${interval} * interval '1 hour'), 'DD Mon YYYY HH24:MI:SS')
      WHERE name = ${name} AND spawn <> '--:--:--'
      RETURNING *
    `;
  }

  // 🔥 LOGIKA "MANUAL SPAWN"
  if (manual_spawn) {
    return await sql`
      UPDATE bosses 
      SET 
        spawn = ${spawn},
        interval_hours = ${interval},
        rarity = ${bossRarity}
      WHERE name = ${name}
      RETURNING *
    `;
  }

  // 🔥 LOGIKA "JUST NOW" (Insert Baru atau Update Semua)
  if (use_db_time) {
    return await sql`
      INSERT INTO bosses (name, killed, spawn, interval_hours, rarity)
      VALUES (
        ${name}, 
        TO_CHAR(NOW() AT TIME ZONE 'Asia/Jakarta', 'DD Mon YYYY HH24:MI:SS'), 
        TO_CHAR((NOW() + (${interval} * interval '1 hour')), 'DD Mon YYYY HH24:MI:SS'), 
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

  // 🔥 LOGIKA DEFAULT (Update Killed saja atau Insert)
  // COALESCE digunakan agar data lama tidak tertimpa NULL jika data kiriman kosong
  return await sql`
    INSERT INTO bosses (name, killed, spawn, interval_hours, rarity)
    VALUES (
      ${name}, 
      ${killed}, 
      TO_CHAR((TO_TIMESTAMP(${killed}, 'DD Mon YYYY HH24:MI:SS') + (${interval} * interval '1 hour')), 'DD Mon YYYY HH24:MI:SS'), 
      ${interval},
      ${bossRarity}
    )
    ON CONFLICT (name) 
    DO UPDATE SET 
      killed = COALESCE(EXCLUDED.killed, bosses.killed),
      spawn = COALESCE(EXCLUDED.spawn, bosses.spawn),
      interval_hours = EXCLUDED.interval_hours,
      rarity = EXCLUDED.rarity
    RETURNING *
  `;
}

// 3. UPDATE DETAIL
export async function updateBossDetail(data) {
  const { id, name, interval_hours, rarity } = data;
  const interval = parseFloat(interval_hours) || 1;

  return await sql`
    UPDATE bosses 
    SET 
      name = ${name},
      interval_hours = ${interval},
      rarity = ${rarity},
      spawn = CASE 
        WHEN killed IS NOT NULL AND killed <> '' AND killed <> '--:--:--'
        THEN TO_CHAR((TO_TIMESTAMP(killed, 'DD Mon YYYY HH24:MI:SS') + (${interval} * interval '1 hour')), 'DD Mon YYYY HH24:MI:SS')
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
  return await sql`UPDATE bosses SET killed = NULL, spawn = NULL WHERE rarity ILIKE 'Invasion' OR rarity ILIKE 'Invasi'`;
}

// 6. GLOBAL SETTING
export async function updateGlobalSetting(key, value) {
  return await sql`INSERT INTO settings (key, value) VALUES (${key}, ${String(value)}) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`;
}

// 7. GET SETTING
export async function getGlobalSetting(key) {
  const result = await sql`SELECT value FROM settings WHERE key = ${key}`;
  if (result.length === 0) return null;
  const val = result[0].value;
  return val === 'true' ? true : val === 'false' ? false : val;
}

// 8. SALARY
export async function getAllSalaries() { return await sql`SELECT * FROM salaries ORDER BY id ASC`; }

// 9. SYNC SALARY
export async function syncSalariesFromSheet(dataArray) {
  await sql`TRUNCATE TABLE salaries`;
  for (const item of dataArray) {
    await sql`INSERT INTO salaries (member_name, last_week, current_salary, debt, receivables, total_amount) VALUES (${item.member_name}, ${item.last_week}, ${item.current_salary}, ${item.debt}, ${item.receivables}, ${item.total_amount})`;
  }
  return { success: true };
}