import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Play, RotateCcw } from "lucide-react";
import { validateInput, calculateScore } from "@/lib/pi-engine";

export default function Benchmark() {
  const [state, setState] = useState<"idle" | "running" | "done">("idle");
  const [input, setInput] = useState("");
  const [correctCount, setCorrectCount] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [score, setScore] = useState(0);
  const [bestDigits, setBestDigits] = useState(() => Number(localStorage.getItem("pi-benchmark-best") || "0"));
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<number>();

  const start = useCallback(() => {
    setState("running");
    setInput("");
    setCorrectCount(0);
    setElapsed(0);
    const now = Date.now();
    setStartTime(now);
    timerRef.current = window.setInterval(() => setElapsed(Date.now() - now), 100);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleInput = useCallback((value: string) => {
    const clean = value.replace(/[^0-9]/g, "");
    const v = validateInput(clean);
    if (!v.correct) {
      finish(v.correctCount);
      return;
    }
    setInput(clean);
    setCorrectCount(v.correctCount);
  }, []);

  const finish = useCallback((digits: number) => {
    clearInterval(timerRef.current);
    const el = Date.now() - startTime;
    setElapsed(el);
    setCorrectCount(digits);
    const s = calculateScore(digits, el);
    setScore(s);
    if (digits > bestDigits) {
      setBestDigits(digits);
      localStorage.setItem("pi-benchmark-best", String(digits));
    }
    setState("done");
  }, [startTime, bestDigits]);

  const submitManual = useCallback(() => {
    const v = validateInput(input);
    finish(v.correctCount);
  }, [input, finish]);

  useEffect(() => () => clearInterval(timerRef.current), []);

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return `${m}:${String(s % 60).padStart(2, "0")}.${String(Math.floor((ms % 1000) / 100))}`;
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Trophy className="w-8 h-8 text-primary" /> Benchmark
            </h1>
            <p className="text-muted-foreground">Official pi memorization test</p>
          </div>
          {bestDigits > 0 && (
            <div className="glass rounded-xl px-4 py-2 text-center">
              <p className="text-xs text-muted-foreground">Personal Best</p>
              <p className="digit-font text-xl text-primary font-bold">{bestDigits}</p>
            </div>
          )}
        </div>

        {state === "idle" && (
          <div className="text-center py-20">
            <div className="glass rounded-2xl p-8 max-w-md mx-auto mb-8">
              <Trophy className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-3">Ready for the test?</h2>
              <p className="text-muted-foreground text-sm">Type as many digits of π as you can. The timer starts when you begin. One wrong digit ends the test.</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={start}
              className="px-10 py-4 rounded-xl bg-gradient-to-r from-primary to-accent font-semibold text-primary-foreground glow-primary text-lg inline-flex items-center gap-2"
            >
              <Play className="w-5 h-5" /> Start Benchmark
            </motion.button>
          </div>
        )}

        {state === "running" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="glass rounded-lg px-4 py-2">
                <span className="text-sm text-muted-foreground">Digits: </span>
                <span className="digit-font text-primary font-bold">{correctCount}</span>
              </div>
              <div className="glass rounded-lg px-4 py-2">
                <span className="digit-font text-primary font-bold">{formatTime(elapsed)}</span>
              </div>
            </div>
            <div className="glass rounded-2xl p-6 mb-4">
              <p className="text-sm text-muted-foreground mb-3">Type the digits of π after the decimal point:</p>
              <div className="flex items-start gap-2 digit-font text-xl">
                <span className="text-muted-foreground shrink-0">3.</span>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => handleInput(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-primary tracking-[0.15em] resize-none min-h-[120px] leading-relaxed"
                  placeholder="Start typing..."
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={submitManual}
              className="w-full py-3 rounded-xl glass font-semibold"
            >
              Finish Test
            </motion.button>
          </div>
        )}

        {state === "done" && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
            <div className="glass rounded-2xl p-8 mb-6 glow-primary">
              <Trophy className="w-12 h-12 text-primary mx-auto mb-4" />
              <p className="digit-font text-5xl text-primary font-bold mb-2">{correctCount}</p>
              <p className="text-muted-foreground mb-4">digits of π</p>
              <div className="flex justify-center gap-8">
                <div>
                  <p className="digit-font text-lg text-foreground">{formatTime(elapsed)}</p>
                  <p className="text-xs text-muted-foreground">Time</p>
                </div>
                <div>
                  <p className="digit-font text-lg text-accent">{score}</p>
                  <p className="text-xs text-muted-foreground">Score</p>
                </div>
              </div>
            </div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={start} className="px-6 py-3 rounded-xl glass font-semibold inline-flex items-center gap-2">
              <RotateCcw className="w-4 h-4" /> Try Again
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
