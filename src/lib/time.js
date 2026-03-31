export function getCountdown(spawnTime) {
  if (!spawnTime || spawnTime === "--:--:--") {
    return { label: "UNKNOWN", seconds: 0 };
  }

  const now = new Date();
  const parts = spawnTime.split(":");
  if (parts.length !== 3) return { label: "INVALID", seconds: 0 };

  const [h, m, s] = parts.map(Number);
  const spawn = new Date();
  spawn.setHours(h, m, s, 0);

  if (spawn < now) spawn.setDate(spawn.getDate() + 1);

  const diff = Math.floor((spawn - now) / 1000);
  if (diff <= 0) return { label: "SPAWNED", seconds: 0 };

  const hours = Math.floor(diff / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  const seconds = diff % 60;

  let label = "";
  if (hours > 0) label += `${hours}h `;
  if (minutes > 0 || hours > 0) label += `${minutes}m `;
  label += `${seconds}s`;

  return { label: label.trim(), seconds: diff };
}