import { motion } from "framer-motion";
import { BarChart3, Trophy, Flame, Target, ListChecks, Eye, GraduationCap, Gamepad2, Zap, Keyboard } from "lucide-react";
import { getBestScore, getStreak, getTotalSessions, getRecentSessions, type GameKind } from "@/lib/history";
import ActivityHeatmap from "@/components/stats/ActivityHeatmap";

const GAME_META: Record<GameKind, { label: string; icon: typeof Trophy; suffix: string }> = {
  benchmark: { label: "Benchmark", icon: Trophy, suffix: " digits" },
  typing: { label: "Pi Typing", icon: Keyboard, suffix: " pts" },
  missing: { label: "Missing Digit", icon: Gamepad2, suffix: "" },
  speed: { label: "Speed Recall", icon: Zap, suffix: " correct" },
  training: { label: "Training", icon: GraduationCap, suffix: " correct" },
  "explorer-trainer": { label: "Explorer Trainer", icon: Eye, suffix: " correct" },
};

function formatSessionDate(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) + " · " + d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export default function Stats() {
  const bestBenchmark = getBestScore("benchmark");
  const bestTyping = getBestScore("typing");
  const streak = getStreak();
  const totalSessions = getTotalSessions();

  const stats = [
    { label: "Best Benchmark", value: bestBenchmark, suffix: " digits", icon: Trophy, color: "from-amber-500 to-orange-500" },
    { label: "Typing High Score", value: bestTyping, suffix: " pts", icon: Target, color: "from-cyan-500 to-blue-500" },
    { label: "Current Streak", value: streak, suffix: streak === 1 ? " day" : " days", icon: Flame, color: "from-red-500 to-pink-500" },
    { label: "Total Sessions", value: totalSessions, suffix: "", icon: ListChecks, color: "from-emerald-500 to-teal-500" },
  ];

  const recentSessions = getRecentSessions(8).filter((r) => r.game !== "missing");

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
          <BarChart3 className="w-8 h-8 text-primary" /> Statistics
        </h1>
        <p className="text-muted-foreground mb-10">Your pi memorization journey</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mb-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-4 sm:p-6"
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center mb-4`}>
                <s.icon className="w-5 h-5 text-primary-foreground" />
              </div>
              <p className="digit-font text-2xl sm:text-3xl font-bold text-primary mb-1">{s.value}{s.suffix}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="max-w-4xl mb-8">
          <ActivityHeatmap />
        </div>

        {totalSessions === 0 ? (
          <div className="glass rounded-2xl p-8 max-w-4xl text-center">
            <p className="text-muted-foreground">Play games and take benchmarks to see your progress here.</p>
            <p className="text-sm text-muted-foreground mt-2">Every session you complete builds your streak and activity heatmap above.</p>
          </div>
        ) : (
          <div className="glass rounded-2xl p-6 max-w-4xl">
            <h3 className="font-semibold mb-4">Recent Activity</h3>
            {recentSessions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent games yet — try Speed Recall, Training, or Benchmark.</p>
            ) : (
              <div className="space-y-1">
                {recentSessions.map((r) => {
                  const meta = GAME_META[r.game];
                  return (
                    <div key={r.id} className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-secondary/40 transition-colors">
                      <div className="flex items-center gap-3">
                        <meta.icon className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="text-sm font-medium">{meta.label}</span>
                        <span className="text-xs text-muted-foreground hidden sm:inline">{formatSessionDate(r.timestamp)}</span>
                      </div>
                      <span className="digit-font text-sm text-primary font-bold">
                        {r.score}{meta.suffix}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
