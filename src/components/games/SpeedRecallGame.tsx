import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getRawDigits, validateInput, TOTAL_AVAILABLE_DIGITS } from "@/lib/pi-engine";
import { logSession } from "@/lib/history";
import { Check, X, RotateCcw, Play } from "lucide-react";
import RangeControl from "./RangeControl";

const DEFAULT_RANGE = { from: 1, to: 100 };

export default function SpeedRecallGame() {
  const [state, setState] = useState<"idle" | "show" | "recall" | "result">("idle");
  const [digitCount, setDigitCount] = useState(5);
  const [range, setRange] = useState(DEFAULT_RANGE);
  const [startPos, setStartPos] = useState(0);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<{ correct: boolean; count: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const digits = getRawDigits(startPos, digitCount);

  const startRound = useCallback(() => {
    const fromIdx = range.from - 1;
    const toIdx = range.to - 1;
    const maxStartIdx = Math.max(fromIdx, toIdx - digitCount + 1);
    const pos = fromIdx + Math.floor(Math.random() * (maxStartIdx - fromIdx + 1));
    setStartPos(pos);
    setInput("");
    setResult(null);
    setState("show");
    setTimeout(() => {
      setState("recall");
      setTimeout(() => inputRef.current?.focus(), 100);
    }, 2000 + digitCount * 300);
  }, [digitCount, range]);

  const handleDigitCountChange = useCallback((n: number) => {
    setDigitCount(n);
    setState("idle");
    setRange((r) => {
      if (r.to - r.from + 1 >= n) return r;
      return { from: r.from, to: Math.min(TOTAL_AVAILABLE_DIGITS, r.from + n - 1) };
    });
  }, []);

  const applyRange = useCallback((from: number, to: number) => {
    setRange({ from, to });
    setState("idle");
  }, []);

  const check = useCallback(() => {
    const v = validateInput(input, startPos);
    setResult({ correct: v.correct && v.correctCount === digitCount, count: v.correctCount });
    logSession({ game: "speed", score: v.correctCount, correct: v.correctCount, total: digitCount });
    setState("result");
  }, [input, startPos, digitCount]);

  return (
    <div>
      <div className="flex items-start justify-between mb-6 gap-3 flex-wrap">
        <h2 className="text-2xl font-bold">Speed Recall</h2>
        <div className="flex flex-col items-end gap-1.5">
          <div className="flex gap-2">
            {[5, 8, 12].map((n) => (
              <button
                key={n}
                onClick={() => handleDigitCountChange(n)}
                className={`digit-font text-sm px-3 py-1 rounded-lg ${n === digitCount ? "bg-primary/20 text-primary" : "glass text-muted-foreground"}`}
              >
                {n}
              </button>
            ))}
          </div>
          <RangeControl from={range.from} to={range.to} minRange={digitCount} maxDigits={TOTAL_AVAILABLE_DIGITS} onApply={applyRange} />
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
