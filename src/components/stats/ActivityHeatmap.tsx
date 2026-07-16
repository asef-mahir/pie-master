import { useMemo, useState } from "react";
import { getHeatmapData, todayISO, type HeatmapDay } from "@/lib/history";

const WEEKS = 18;

// Buckets are derived from the user's own non-zero days (quartiles), so coloring
// scales to their actual practice volume instead of fixed absolute thresholds.
function computeBuckets(days: HeatmapDay[]): number[] {
  const values = days.map((d) => d.correct).filter((v) => v > 0).sort((a, b) => a - b);
  if (values.length === 0) return [1, 1, 1];
  const at = (p: number) => values[Math.min(values.length - 1, Math.max(0, Math.ceil(p * values.length) - 1))];
  return [at(0.25), at(0.5), at(0.75)];
}

function intensityClass(correct: number, buckets: number[]): string {
  if (correct === 0) return "bg-secondary/30";
  if (correct <= buckets[0]) return "bg-primary/25";
  if (correct <= buckets[1]) return "bg-primary/45";
  if (correct <= buckets[2]) return "bg-primary/70";
  return "bg-primary glow-primary";
}

function formatDateLabel(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

function dayTooltip(day: HeatmapDay): string {
  const accuracy = day.total > 0 ? Math.round((day.correct / day.total) * 100) : null;
  const parts = [
    `${day.correct} digit${day.correct === 1 ? "" : "s"} correct`,
    accuracy !== null ? `${accuracy}% accuracy` : null,
    `${day.count} session${day.count === 1 ? "" : "s"}`,
  ].filter(Boolean);
  return `${formatDateLabel(day.date)} · ${parts.join(" · ")}`;
}

export default function ActivityHeatmap() {
  const days = useMemo(() => getHeatmapData(WEEKS), []);
  const buckets = useMemo(() => computeBuckets(days), [days]);
  const [hovered, setHovered] = useState<HeatmapDay | null>(null);
  const today = useMemo(() => todayISO(), []);

  const weeksCols = useMemo(() => {
    const first = new Date(`${days[0].date}T00:00:00`);
    const pad = first.getDay();
    const padded: (HeatmapDay | null)[] = [...Array.from({ length: pad }, () => null), ...days];
    const cols: (HeatmapDay | null)[][] = [];
    for (let i = 0; i < padded.length; i += 7) cols.push(padded.slice(i, i + 7));
    return cols;
  }, [days]);

  const totalSessions = days.reduce((s, d) => s + d.count, 0);
  const totalCorrect = days.reduce((s, d) => s + d.correct, 0);
  const totalAttempts = days.reduce((s, d) => s + d.total, 0);
  const overallAccuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : null;

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
        <h3 className="font-semibold">Practice Activity</h3>
        <p className="text-xs text-muted-foreground font-mono h-4 text-right">
          {hovered
            ? dayTooltip(hovered)
            : `${totalCorrect} digits correct${overallAccuracy !== null ? ` · ${overallAccuracy}% accuracy` : ""} · ${totalSessions} session${totalSessions === 1 ? "" : "s"}`}
        </p>
      </div>
      <p className="text-[11px] text-muted-foreground/60 mb-4">Color reflects digits correctly recalled, not raw activity count</p>

      <div className="flex gap-1 overflow-x-auto pb-1" onMouseLeave={() => setHovered(null)}>
        {weeksCols.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1 shrink-0">
            {week.map((day, di) =>
              day ? (
                <div
                  key={di}
                  role="gridcell"
                  tabIndex={0}
                  aria-label={dayTooltip(day)}
                  onMouseEnter={() => setHovered(day)}
                  onFocus={() => setHovered(day)}
                  onTouchStart={() => setHovered(day)}
                  className={`w-3 h-3 rounded-sm transition-colors outline-none focus-visible:ring-1 focus-visible:ring-ring ${intensityClass(day.correct, buckets)} ${
                    day.date === today ? "ring-1 ring-primary/70" : ""
                  }`}
                />
              ) : (
                <div key={di} className="w-3 h-3" />
              )
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
        <span>Less</span>
        <span className="w-3 h-3 rounded-sm bg-secondary/30" />
        <span className="w-3 h-3 rounded-sm bg-primary/25" />
        <span className="w-3 h-3 rounded-sm bg-primary/45" />
        <span className="w-3 h-3 rounded-sm bg-primary/70" />
        <span className="w-3 h-3 rounded-sm bg-primary" />
        <span>More</span>
      </div>
    </div>
  );
}
