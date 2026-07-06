import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gamepad2, Zap, Keyboard } from "lucide-react";
import MissingDigitGame from "@/components/games/MissingDigitGame";
import SpeedRecallGame from "@/components/games/SpeedRecallGame";
import TypingChallengeGame from "@/components/games/TypingChallengeGame";

const games = [
  { id: "missing", title: "Missing Digit", desc: "Fill in the blank digit", icon: Gamepad2, color: "from-cyan-500 to-blue-500" },
  { id: "speed", title: "Speed Recall", desc: "Memorize digits shown briefly", icon: Zap, color: "from-purple-500 to-violet-500" },
  { id: "typing", title: "Pi Typing", desc: "Type digits until you make a mistake", icon: Keyboard, color: "from-amber-500 to-orange-500" },
];

export default function Games() {
  const [activeGame, setActiveGame] = useState<string | null>(null);

  if (activeGame) {
    const GameComponent = {
      missing: MissingDigitGame,
      speed: SpeedRecallGame,
      typing: TypingChallengeGame,
    }[activeGame]!;

    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <button onClick={() => setActiveGame(null)} className="text-muted-foreground hover:text-foreground text-sm mb-6 block">
          ← Back to games
        </button>
        <AnimatePresence mode="wait">
          <motion.div key={activeGame} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <GameComponent />
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-2">Games</h1>
        <p className="text-muted-foreground mb-10">Challenge your pi knowledge</p>

        <div className="grid sm:grid-cols-3 gap-6 max-w-4xl">
          {games.map((g, i) => (
            <motion.button
              key={g.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveGame(g.id)}
              className="glass rounded-2xl p-6 text-left hover:border-primary/30 transition-all group"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${g.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <g.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-1">{g.title}</h3>
              <p className="text-muted-foreground text-sm">{g.desc}</p>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
