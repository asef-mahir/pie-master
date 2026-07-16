export type GameKind = "benchmark" | "typing" | "missing" | "speed" | "training" | "explorer-trainer";

export interface SessionRecord {
  id: string;
  date: string; // local YYYY-MM-DD
  timestamp: number;
  game: GameKind;
  score: number;
  correct?: number;
  total?: number;
}

const HISTORY_KEY = "pi-history";
const MIGRATION_KEY = "pi-history-migrated";
const MAX_RECORDS = 3000;

export function todayISO(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function migrateLegacyScores(): SessionRecord[] {
  if (localStorage.getItem(MIGRATION_KEY)) return [];
  localStorage.setItem(MIGRATION_KEY, "1");

  const legacyBenchmark = Number(localStorage.getItem("pi-benchmark-best") || "0");
  const legacyTyping = Number(localStorage.getItem("pi-typing-best") || "0");
  const now = Date.now();
  const seeded: SessionRecord[] = [];
  if (legacyBenchmark > 0) {
    seeded.push({ id: "legacy-benchmark", date: todayISO(), timestamp: now, game: "benchmark", score: legacyBenchmark });
  }
  if (legacyTyping > 0) {
    seeded.push({ id: "legacy-typing", date: todayISO(), timestamp: now, game: "typing", score: legacyTyping });
  }
  return seeded;
}

export function getHistory(): SessionRecord[] {
  let history: SessionRecord[];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    history = Array.isArray(parsed) ? parsed : [];
  } catch {
    history = [];
  }

  if (history.length === 0) {
    const seeded = migrateLegacyScores();
    if (seeded.length > 0) {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(seeded));
      return seeded;
    }
  }

  return history;
}

export function logSession(record: Omit<SessionRecord, "id" | "date" | "timestamp">): void {
  const history = getHistory();
  const now = new Date();
  const entry: SessionRecord = {
    ...record,
    id: `${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
    date: todayISO(now),
    timestamp: now.getTime(),
  };
  const next = [...history, entry];
  const trimmed = next.length > MAX_RECORDS ? next.slice(next.length - MAX_RECORDS) : next;
  localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
}

export function getBestScore(game: GameKind): number {
  return getHistory().reduce((max, r) => (r.game === game ? Math.max(max, r.score) : max), 0);
}

export function getTotalSessions(game?: GameKind): number {
  const history = getHistory();
  return game ? history.filter((r) => r.game === game).length : history.length;
}

export function getStreak(): number {
  const dates = new Set(getHistory().map((r) => r.date));
  if (dates.size === 0) return 0;

  const cursor = new Date();
  if (!dates.has(todayISO(cursor))) cursor.setDate(cursor.getDate() - 1);

  let streak = 0;
  while (dates.has(todayISO(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function getOverallAccuracy(): number | null {
  const scored = getHistory().filter((r) => r.total !== undefined && r.total > 0);
  if (scored.length === 0) return null;
  const correct = scored.reduce((s, r) => s + (r.correct ?? 0), 0);
  const total = scored.reduce((s, r) => s + (r.total ?? 0), 0);
  return total > 0 ? Math.round((correct / total) * 100) : null;
}

export interface HeatmapDay {
  date: string;
  count: number;
  correct: number;
  total: number;
}

export function getHeatmapData(weeks = 18): HeatmapDay[] {
  const history = getHistory();
  const byDate = new Map<string, { count: number; correct: number; total: number }>();
  for (const r of history) {
    const cur = byDate.get(r.date) ?? { count: 0, correct: 0, total: 0 };
    cur.count++;
    cur.correct += r.correct ?? 0;
    cur.total += r.total ?? 0;
    byDate.set(r.date, cur);
  }

  const days: HeatmapDay[] = [];
  const today = new Date();
  const totalDays = weeks * 7;
  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = todayISO(d);
    const agg = byDate.get(key);
    days.push({ date: key, count: agg?.count ?? 0, correct: agg?.correct ?? 0, total: agg?.total ?? 0 });
  }
  return days;
}

export function getRecentSessions(limit = 8): SessionRecord[] {
  return getHistory().slice(-limit).reverse();
}
