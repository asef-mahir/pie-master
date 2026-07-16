import { useMemo, useState } from "react";
import { getHeatmapData, todayISO, type HeatmapDay } from "@/lib/history";

const WEEKS = 18;

function intensityClass(count: number): string {
  if (count === 0) return "bg-secondary/30";
  if (count <= 2) return "bg-primary/25";
  if (count <= 5) return "bg-primary/45";
  if (count <= 10) return "bg-primary/70";
  return "bg-primary glow-primary";
}

function formatDateLabel(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

export default function ActivityHeatmap() {
  const days = useMemo(() => getHeatmapData(WEEKS), []);
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

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="font-semibold">Practice Activity</h3>
        <p className="text-xs text-muted-foreground font-mono h-4 text-right">
          {hovered
            ? `${formatDateLabel(hovered.date)} · ${hovered.count} session${hovered.count === 1 ? "" : "s"}${
                hovered.total > 0 ? ` · ${Math.round((hovered.correct / hovered.total) * 100)}% accuracy` : ""
              }`
            : `${totalSessions} session${totalSessions === 1 ? "" : "s"} in the last ${WEEKS} weeks`}
        </p>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1" onMouseLeave={() => setHovered(null)}>
        {weeksCols.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1 shrink-0">
            {week.map((day, di) =>
              day ? (
                <div
                  key={di}
                  role="gridcell"
                  tabIndex={0}
                  aria-label={`${formatDateLabel(day.date)}: ${day.count} sessions`}
                  onMouseEnter={() => setHovered(day)}
                  onFocus={() => setHovered(day)}
                  onTouchStart={() => setHovered(day)}
                  className={`w-3 h-3 rounded-sm transition-colors outline-none focus-visible:ring-1 focus-visible:ring-ring ${intensityClass(day.count)} ${
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
