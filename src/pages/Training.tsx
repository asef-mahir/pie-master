import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, RotateCcw } from "lucide-react";
import { getRawDigits, validateInput, TRAINING_LEVELS } from "@/lib/pi-engine";
import { logSession } from "@/lib/history";

export default function Training() {
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [phase, setPhase] = useState<"study" | "recall" | "result">("study");
  const [input, setInput] = useState("");
  const [result, setResult] = useState<{ correct: boolean; count: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const level = selectedLevel !== null ? TRAINING_LEVELS[selectedLevel] : null;
  const targetDigits = level ? getRawDigits(0, level.digits) : "";

  const startRecall = useCallback(() => {
    setPhase("recall");
    setInput("");
    setResult(null);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const checkAnswer = useCallback(() => {
    const v = validateInput(input);
    setResult({ correct: v.correct && v.correctCount === targetDigits.length, count: v.correctCount });
    logSession({ game: "training", score: v.correctCount, correct: v.correctCount, total: targetDigits.length });
    setPhase("result");
  }, [input, targetDigits]);

  const reset = () => {
    setPhase("study");
    setInput("");
    setResult(null);
  };

  useEffect(() => {
    if (phase === "recall") inputRef.current?.focus();
  }, [phase]);

  if (selectedLevel === null) {
    return (
      <div className="container mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-2">Training Mode</h1>
          <p className="text-muted-foreground mb-10">Choose your challenge level</p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl">
            {TRAINING_LEVELS.map((lvl, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedLevel(i)}
                className="glass rounded-2xl p-6 text-left hover:border-primary/30 transition-all group"
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${lvl.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <span className="font-mono font-bold text-sm text-primary-foreground">{lvl.digits}</span>
                </div>
                <h3 className="font-semibold text-lg">{lvl.label}</h3>
                <p className="text-muted-foreground text-sm">{lvl.digits} digits of π</p>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">{level!.label} — {level!.digits} digits</h1>
            <p className="text-muted-foreground text-sm capitalize">{phase} phase</p>
          </div>
          <button onClick={() => { setSelectedLevel(null); reset(); }} className="text-muted-foreground hover:text-foreground text-sm">
            ← Back
          </button>
        </div>

        <AnimatePresence mode="wait">
          {phase === "study" && (
            <motion.div key="study" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="glass rounded-2xl p-6 mb-6">
                <p className="text-sm text-muted-foreground mb-4">Memorize these digits:</p>
                <p className="digit-font text-2xl leading-relaxed tracking-[0.2em] break-all text-primary">
                  3.{targetDigits}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={startRecall}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-accent font-semibold text-primary-foreground glow-primary"
              >
                I'm ready — Start Recall
              </motion.button>
            </motion.div>
          )}

          {phase === "recall" && (
            <motion.div key="recall" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="glass rounded-2xl p-6 mb-6">
                <p className="text-sm text-muted-foreground mb-4">Type the digits of π (after 3.):</p>
                <div className="flex items-center gap-2 digit-font text-2xl">
                  <span className="text-muted-foreground">3.</span>
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value.replace(/[^0-9]/g, ""))}
                    onKeyDown={(e) => e.key === "Enter" && checkAnswer()}
                    className="flex-1 bg-transparent outline-none text-primary tracking-[0.2em] placeholder:text-muted-foreground/30"
                    placeholder="Type digits..."
                    autoComplete="off"
                    inputMode="numeric"
                    autoCapitalize="off"
                    autoCorrect="off"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-3">{input.length} / {level!.digits} digits entered</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={checkAnswer}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-accent font-semibold text-primary-foreground glow-primary"
              >
                Check Answer
              </motion.button>
            </motion.div>
          )}

          {phase === "result" && result && (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <div className={`glass rounded-2xl p-8 text-center mb-6 ${result.correct ? "glow-success" : ""}`}>
                <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${result.correct ? "bg-success/20" : "bg-destructive/20"}`}>
                  {result.correct ? <Check className="w-8 h-8 text-success" /> : <X className="w-8 h-8 text-destructive" />}
                </div>
                <h2 className="text-2xl font-bold mb-2">{result.correct ? "Perfect!" : "Keep Practicing!"}</h2>
                <p className="text-muted-foreground">
                  You got <span className="text-primary font-mono font-bold">{result.count}</span> out of{" "}
                  <span className="font-mono font-bold">{level!.digits}</span> digits correct
                </p>
              </div>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={reset}
                  className="flex-1 py-3 rounded-xl glass font-semibold flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" /> Try Again
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
