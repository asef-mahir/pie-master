import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Check, X, ArrowRight } from "lucide-react";
import { generateMissingDigitQuestion } from "@/lib/pi-engine";

export default function MissingDigitGame() {
  const [question, setQuestion] = useState(() => generateMissingDigitQuestion(50));
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const handleSelect = useCallback((digit: string) => {
    if (selected !== null) return;
    setSelected(digit);
    setScore((s) => ({
      correct: s.correct + (digit === question.answer ? 1 : 0),
      total: s.total + 1,
    }));
  }, [selected, question]);

  const next = useCallback(() => {
    setQuestion(generateMissingDigitQuestion(50));
    setSelected(null);
  }, []);

  const isCorrect = selected === question.answer;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Missing Digit</h2>
        <div className="glass rounded-full px-4 py-1.5 text-sm">
          <span className="text-primary font-mono font-bold">{score.correct}</span>
          <span className="text-muted-foreground"> / {score.total}</span>
        </div>
      </div>

      <div className="glass rounded-2xl p-8 text-center mb-8">
        <p className="text-sm text-muted-foreground mb-6">Which digit is missing?</p>
        <p className="digit-font text-4xl md:text-5xl tracking-[0.3em] text-primary">
          {question.display.split("").map((char, i) =>
            char === "_" ? (
              <span key={i} className="inline-block w-10 border-b-2 border-accent mx-1 text-accent animate-pulse-glow">?</span>
            ) : (
              <span key={i} className={char === "." ? "text-accent" : ""}>{char}</span>
            )
          )}
        </p>
      </div>

      <div className="grid grid-cols-5 gap-3 max-w-md mx-auto mb-6">
        {[...Array(10)].map((_, i) => {
          const d = String(i);
          let btnClass = "glass hover:border-primary/50";
          if (selected !== null) {
            if (d === question.answer) btnClass = "bg-success/20 border-success/50 glow-success";
            else if (d === selected) btnClass = "bg-destructive/20 border-destructive/50";
          }
          return (
            <motion.button
              key={d}
              whileHover={selected === null ? { scale: 1.1 } : {}}
              whileTap={selected === null ? { scale: 0.9 } : {}}
              onClick={() => handleSelect(d)}
              className={`digit-font text-xl font-bold py-4 rounded-xl transition-all ${btnClass}`}
            >
              {d}
            </motion.button>
          );
        })}
      </div>

      {selected !== null && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            {isCorrect ? (
              <><Check className="w-5 h-5 text-success" /><span className="text-success font-semibold">Correct!</span></>
            ) : (
              <><X className="w-5 h-5 text-destructive" /><span className="text-destructive font-semibold">The answer was {question.answer}</span></>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={next}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-primary to-accent font-semibold text-primary-foreground inline-flex items-center gap-2"
          >
            Next <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
