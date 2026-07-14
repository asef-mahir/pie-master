import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getRawDigits, validateInput } from "@/lib/pi-engine";
import { Check, X, RotateCcw, Play } from "lucide-react";

export default function SpeedRecallGame() {
  const [state, setState] = useState<"idle" | "show" | "recall" | "result">("idle");
  const [digitCount, setDigitCount] = useState(5);
  const [startPos, setStartPos] = useState(0);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<{ correct: boolean; count: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const digits = getRawDigits(startPos, digitCount);

  const startRound = useCallback(() => {
    const pos = Math.floor(Math.random() * 50);
    setStartPos(pos);
    setInput("");
    setResult(null);
    setState("show");
    setTimeout(() => {
      setState("recall");
      setTimeout(() => inputRef.current?.focus(), 100);
    }, 2000 + digitCount * 300);
  }, [digitCount]);

  const check = useCallback(() => {
    const v = validateInput(input, startPos);
    setResult({ correct: v.correct && v.correctCount === digitCount, count: v.correctCount });
    setState("result");
  }, [input, startPos, digitCount]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Speed Recall</h2>
        <div className="flex gap-2">
          {[5, 8, 12].map((n) => (
            <button
              key={n}
              onClick={() => { setDigitCount(n); setState("idle"); }}
              className={`digit-font text-sm px-3 py-1 rounded-lg ${n === digitCount ? "bg-primary/20 text-primary" : "glass text-muted-foreground"}`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {state === "idle" && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-16">
            <p className="text-muted-foreground mb-6">Digits will flash briefly. Memorize them!</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startRound}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-accent font-semibold text-primary-foreground glow-primary inline-flex items-center gap-2"
            >
              <Play className="w-4 h-4" /> Start
            </motion.button>
          </motion.div>
        )}

        {state === "show" && (
          <motion.div key="show" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} className="text-center py-12">
            <p className="text-sm text-muted-foreground mb-6">Memorize!</p>
            <p className="digit-font text-5xl tracking-[0.3em] text-primary text-glow">{digits}</p>
          </motion.div>
        )}

        {state === "recall" && (
          <motion.div key="recall" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="glass rounded-2xl p-6 mb-6 text-center">
              <p className="text-sm text-muted-foreground mb-4">Type what you saw:</p>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value.replace(/[^0-9]/g, ""))}
                onKeyDown={(e) => e.key === "Enter" && check()}
                className="bg-transparent text-center digit-font text-3xl tracking-[0.3em] text-primary outline-none w-full"
                placeholder="..."
                autoComplete="off"
                maxLength={digitCount}
                inputMode="numeric"
                autoCapitalize="off"
                autoCorrect="off"
              />
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={check} className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-accent font-semibold text-primary-foreground">
              Submit
            </motion.button>
          </motion.div>
        )}

        {state === "result" && result && (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
            <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${result.correct ? "bg-success/20" : "bg-destructive/20"}`}>
              {result.correct ? <Check className="w-8 h-8 text-success" /> : <X className="w-8 h-8 text-destructive" />}
            </div>
            <h3 className="text-xl font-bold mb-2">{result.correct ? "Perfect!" : `${result.count}/${digitCount} correct`}</h3>
            <p className="text-muted-foreground mb-2 digit-font">Answer: <span className="text-primary">{digits}</span></p>
            <p className="text-muted-foreground mb-6 digit-font text-sm">You typed: <span className={result.correct ? "text-success" : "text-destructive"}>{input || "(empty)"}</span></p>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={startRound} className="px-6 py-2 rounded-xl glass font-semibold inline-flex items-center gap-2">
              <RotateCcw className="w-4 h-4" /> Again
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
