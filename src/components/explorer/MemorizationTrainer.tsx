import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getRawDigits } from "@/lib/pi-engine";
import { Play, Check, X, RotateCcw } from "lucide-react";

interface MemorizationTrainerProps {
  chunkSize: 5 | 10;
}

export default function MemorizationTrainer({ chunkSize }: MemorizationTrainerProps) {
  const [state, setState] = useState<"idle" | "show" | "recall" | "result">("idle");
  const [startPos, setStartPos] = useState(0);
  const [chunksToShow, setChunksToShow] = useState(4); // 1 row = 4 chunks of 5
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const digitCount = chunksToShow * chunkSize;
  const digits = getRawDigits(startPos, digitCount);
  const showDuration = 3000 + digitCount * 200;

  const chunksPerRow = chunkSize === 5 ? 4 : 2;

  const displayChunks = [];
  for (let i = 0; i < digits.length; i += chunkSize) {
    displayChunks.push(digits.slice(i, i + chunkSize));
  }

  const startRound = useCallback(() => {
    const maxStart = 200;
    const pos = Math.floor(Math.random() * maxStart);
    setStartPos(pos);
    setInput("");
    setState("show");
    setTimeout(() => {
      setState("recall");
      setTimeout(() => inputRef.current?.focus(), 100);
    }, showDuration);
  }, [showDuration]);

  const checkAnswer = useCallback(() => {
    setState("result");
  }, []);

  const cleanInput = input.replace(/[^0-9]/g, "");
  const isCorrect = cleanInput === digits;
  const correctCount = (() => {
    let c = 0;
    for (let i = 0; i < cleanInput.length; i++) {
      if (cleanInput[i] === digits[i]) c++;
      else break;
    }
    return c;
  })();

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Memorization Trainer</h3>
        <div className="flex gap-2 items-center">
          <span className="text-xs text-muted-foreground">Chunks:</span>
          {[2, 4, 8].map((n) => (
            <button
              key={n}
              onClick={() => { setChunksToShow(n); setState("idle"); }}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
                n === chunksToShow
                  ? "bg-primary text-primary-foreground"
                  : "glass text-muted-foreground hover:text-foreground"
              }`}
            >
              {n * chunkSize}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {state === "idle" && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-10">
            <p className="text-sm text-muted-foreground mb-4">
              {digitCount} digits will flash for {(showDuration / 1000).toFixed(1)}s. Memorize them!
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startRound}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent font-semibold text-primary-foreground inline-flex items-center gap-2"
            >
              <Play className="w-4 h-4" /> Start
            </motion.button>
          </motion.div>
        )}

        {state === "show" && (
          <motion.div key="show" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="py-6">
            <p className="text-xs text-muted-foreground mb-3 text-center">Memorize! (digits {startPos + 1}–{startPos + digitCount})</p>
            <div className="flex flex-wrap gap-3 sm:gap-5 justify-center">
              {displayChunks.map((chunk, i) => (
                <span key={i} className={`font-mono text-xl sm:text-2xl tracking-[0.2em] ${i % 2 === 0 ? "text-foreground/90" : "text-foreground/65"}`}>
                  {chunk}
                </span>
              ))}
            </div>
            <div className="mt-4 h-1 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: showDuration / 1000, ease: "linear" }}
              />
            </div>
          </motion.div>
        )}

        {state === "recall" && (
          <motion.div key="recall" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-6">
            <p className="text-xs text-muted-foreground mb-3 text-center">Type what you memorized:</p>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value.replace(/[^0-9]/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && checkAnswer()}
              className="bg-transparent text-center font-mono text-2xl tracking-[0.3em] text-primary outline-none w-full mb-4"
              placeholder="..."
              autoComplete="off"
              maxLength={digitCount}
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={checkAnswer}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent font-semibold text-primary-foreground"
            >
              Check
            </motion.button>
          </motion.div>
        )}

        {state === "result" && (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
            <div className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${isCorrect ? "bg-emerald-500/20" : "bg-destructive/20"}`}>
              {isCorrect ? <Check className="w-6 h-6 text-emerald-400" /> : <X className="w-6 h-6 text-destructive" />}
            </div>
            <h4 className="font-bold mb-1">{isCorrect ? "Perfect!" : `${correctCount}/${digitCount} correct`}</h4>
            <p className="text-muted-foreground text-sm font-mono mb-1">Expected: <span className="text-primary">{digits}</span></p>
            <p className="text-muted-foreground text-sm font-mono mb-4">You typed: <span className={isCorrect ? "text-emerald-400" : "text-destructive"}>{cleanInput || "(empty)"}</span></p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startRound}
              className="px-5 py-2 rounded-xl glass font-semibold inline-flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Again
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
