import { motion } from "framer-motion";
import { BarChart3, Trophy, Flame, Target } from "lucide-react";

export default function Stats() {
  const bestTyping = Number(localStorage.getItem("pi-typing-best") || "0");
  const bestBenchmark = Number(localStorage.getItem("pi-benchmark-best") || "0");

  const stats = [
    { label: "Best Benchmark", value: bestBenchmark, suffix: " digits", icon: Trophy, color: "from-amber-500 to-orange-500" },
    { label: "Typing High Score", value: bestTyping, suffix: " pts", icon: Target, color: "from-cyan-500 to-blue-500" },
    { label: "Training Streak", value: 0, suffix: " days", icon: Flame, color: "from-red-500 to-pink-500" },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
          <BarChart3 className="w-8 h-8 text-primary" /> Statistics
        </h1>
        <p className="text-muted-foreground mb-10">Your pi memorization journey</p>

        <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mb-12">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-6"
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center mb-4`}>
                <s.icon className="w-5 h-5 text-primary-foreground" />
              </div>
              <p className="digit-font text-3xl font-bold text-primary mb-1">{s.value}{s.suffix}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="glass rounded-2xl p-8 max-w-4xl text-center">
          <p className="text-muted-foreground">Play games and take benchmarks to see your progress here.</p>
          <p className="text-sm text-muted-foreground mt-2">Full statistics with charts and heatmaps coming soon with backend integration.</p>
        </div>
      </motion.div>
    </div>
  );
}
