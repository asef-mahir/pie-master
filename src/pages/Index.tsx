import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, GraduationCap, Gamepad2, Trophy, BarChart3, ArrowRight } from "lucide-react";
import { getDigits } from "@/lib/pi-engine";

const features = [
  { icon: Eye, title: "Pi Explorer", desc: "Visualize and search thousands of digits", path: "/explorer", color: "from-cyan-500 to-blue-500" },
  { icon: GraduationCap, title: "Training", desc: "Adaptive memorization with progressive levels", path: "/training", color: "from-emerald-500 to-teal-500" },
  { icon: Gamepad2, title: "Games", desc: "Missing digit, speed recall & typing challenges", path: "/games", color: "from-purple-500 to-violet-500" },
  { icon: Trophy, title: "Benchmark", desc: "Official pi memorization test", path: "/benchmark", color: "from-amber-500 to-orange-500" },
  { icon: BarChart3, title: "Statistics", desc: "Track growth, accuracy and streaks", path: "/stats", color: "from-pink-500 to-rose-500" },
];

export default function Index() {
  const piDisplay = getDigits(0, 52);
  const [staggerEnabled, setStaggerEnabled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setStaggerEnabled(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-24 md:py-36 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03]">
          <p className="digit-font text-[8rem] md:text-[12rem] font-bold select-none">π</p>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-8">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
              <span className="text-sm text-muted-foreground">The ultimate pi memorization platform</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              Master the digits of{" "}
              <span className="gradient-text text-glow">π</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Train your memory, challenge yourself with games, and compete on global leaderboards. 
              How many digits can you remember?
            </p>

            <div className="flex flex-wrap gap-4 justify-center mb-16">
              <Link to="/training">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-accent font-semibold text-primary-foreground glow-primary flex items-center gap-2"
                >
                  Start Training <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
              <Link to="/explorer">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 rounded-xl glass font-semibold flex items-center gap-2"
                >
                  Explore Pi
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* Animated pi digits */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="glass rounded-2xl p-6 max-w-3xl mx-auto glow-primary"
          >
            <p className="digit-font text-xl md:text-2xl text-primary/80 leading-relaxed tracking-[0.2em] break-all">
              {piDisplay.split("").map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: staggerEnabled ? 0.5 + i * 0.03 : 0.5 }}
                  className={char === "." ? "text-accent" : "hover:text-primary hover:text-glow transition-all cursor-default"}
                >
                  {char}
                </motion.span>
              ))}
              <span className="text-muted-foreground animate-pulse-glow">...</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
              >
                <Link to={f.path}>
                  <div className="glass rounded-2xl p-6 h-full hover:border-primary/30 transition-all group cursor-pointer">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <f.icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                    <p className="text-muted-foreground text-sm">{f.desc}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
