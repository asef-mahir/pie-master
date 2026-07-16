import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, RotateCcw } from "lucide-react";
import { getRawDigits, validateInput, calculateScore } from "@/lib/pi-engine";
import { logSession, getBestScore } from "@/lib/history";

export default function TypingChallengeGame() {
  const [state, setState] = useState<"idle" | "playing" | "done">("idle");
  const [input, setInput] = useState("");
  const [correctCount, setCorrectCount] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => getBestScore("typing"));
  const inputRef = useRef<HTMLInputElement>(null);

  const expectedDigits = getRawDigits(0, 100);

  const start = useCallback(() => {
    setState("playing");
    setInput("");
    setCorrectCount(0);
    setStartTime(Date.now());
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleInput = useCallback((value: string) => {
    const clean = value.replace(/[^0-9]/g, "");
    const v = validateInput(clean);
    if (!v.correct) {
      const elapsed = Date.now() - startTime;
      const score = calculateScore(v.correctCount, elapsed);
      setCorrectCount(v.correctCount);
      setFinalScore(score);
      logSession({ game: "typing", score, correct: v.correctCount, total: v.correctCount + 1 });
      if (score > bestScore) setBestScore(score);
      setState("done");
      return;
    }
    setInput(clean);
    setCorrectCount(v.correctCount);
  }, [startTime, bestScore]);

  useEffect(() => {
    if (state === "playing") inputRef.current?.focus();
  }, [state]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Pi Typing Challenge</h2>
        {bestScore > 0 && (
          <div className="glass rounded-full px-4 py-1.5 text-sm">
            Best: <span className="text-primary font-mono font-bold">{bestScore}</span>
          </div>
        )}
      </div>

      {state === "idle" && (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-6">Type the digits of π as fast as you can. One mistake and it's over!</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={start}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-accent font-semibold text-primary-foreground glow-primary inline-flex items-center gap-2"
          >
            <Play className="w-4 h-4" /> Start
          </motion.button>
        </div>
      )}

      {state === "playing" && (
        <div>
          <div className="glass rounded-2xl p-6 mb-4">
            <p className="text-sm text-muted-foreground mb-4">Type the digits after 3.</p>
            <div className="digit-font text-xl leading-relaxed tracking-[0.15em] break-all mb-4">
              <span className="text-muted-foreground">3.</span>
              {expectedDigits.split("").map((d, i) => (
                <span key={i} className={i < input.length ? "text-success" : i === input.length ? "text-primary underline animate-pulse-glow" : "text-muted-foreground/20"}>
                  {i < input.length ? input[i] : i === input.length ? "▌" : "•"}
                </span>
              ))}
            </div>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => handleInput(e.target.value)}
              className="opacity-0 absolute pointer-events-auto w-0 h-0"
              autoComplete="off"
              inputMode="numeric"
              autoCapitalize="off"
              autoCorrect="off"
            />
            {/* Click area to refocus */}
            <button onClick={() => inputRef.current?.focus()} className="w-full text-center text-xs text-muted-foreground/50 py-2">
              Click here if input loses focus
            </button>
          </div>
          <div className="flex justify-center gap-8 text-center">
            <div>
              <p className="digit-font text-3xl text-primary font-bold">{correctCount}</p>
              <p className="text-xs text-muted-foreground">digits</p>
            </div>
          </div>
        </div>
      )}

      {state === "done" && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
          <div className="glass rounded-2xl p-8 mb-6">
            <p className="text-4xl font-bold digit-font text-primary mb-2">{correctCount}</p>
            <p className="text-muted-foreground mb-4">digits memorized</p>
            <p className="text-sm text-muted-foreground">Score: <span className="text-accent font-mono font-bold">{finalScore}</span></p>
          </div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={start} className="px-6 py-2 rounded-xl glass font-semibold inline-flex items-center gap-2">
            <RotateCcw className="w-4 h-4" /> Try Again
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
