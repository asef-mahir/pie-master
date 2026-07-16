import { useState, useEffect } from "react";

interface RangeControlProps {
  from: number;
  to: number;
  minRange: number;
  maxDigits: number;
  onApply: (from: number, to: number) => void;
}

export default function RangeControl({ from, to, minRange, maxDigits, onApply }: RangeControlProps) {
  const [fromInput, setFromInput] = useState(String(from));
  const [toInput, setToInput] = useState(String(to));

  useEffect(() => setFromInput(String(from)), [from]);
  useEffect(() => setToInput(String(to)), [to]);

  const commit = () => {
    let f = parseInt(fromInput, 10);
    let t = parseInt(toInput, 10);
    if (!Number.isFinite(f) || f < 1) f = 1;
    if (!Number.isFinite(t) || t < 1) t = minRange;
    f = Math.min(f, maxDigits);
    t = Math.min(t, maxDigits);
    if (f > t) [f, t] = [t, f];
    if (t - f + 1 < minRange) {
      t = Math.min(maxDigits, f + minRange - 1);
      if (t - f + 1 < minRange) f = Math.max(1, t - minRange + 1);
    }
    setFromInput(String(f));
    setToInput(String(t));
    onApply(f, t);
  };

  return (
    <div className="flex items-center gap-1 text-[11px] text-muted-foreground/70 shrink-0">
      <label className="flex items-center gap-1">
        <span className="hidden sm:inline">From</span>
        <input
          type="number"
          min={1}
          max={maxDigits}
          value={fromInput}
          onChange={(e) => setFromInput(e.target.value.replace(/[^0-9]/g, ""))}
          onBlur={commit}
          onKeyDown={(e) => e.key === "Enter" && (e.currentTarget as HTMLInputElement).blur()}
          className="w-11 sm:w-12 px-1 py-0.5 rounded-md bg-secondary/40 border border-border/40 text-center text-foreground/80 text-[11px] outline-none focus:border-primary/50 focus:text-foreground [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          aria-label="Range start digit"
        />
      </label>
      <span className="opacity-50">–</span>
      <label className="flex items-center gap-1">
        <span className="hidden sm:inline">To</span>
        <input
          type="number"
          min={1}
          max={maxDigits}
          value={toInput}
          onChange={(e) => setToInput(e.target.value.replace(/[^0-9]/g, ""))}
          onBlur={commit}
          onKeyDown={(e) => e.key === "Enter" && (e.currentTarget as HTMLInputElement).blur()}
          className="w-11 sm:w-12 px-1 py-0.5 rounded-md bg-secondary/40 border border-border/40 text-center text-foreground/80 text-[11px] outline-none focus:border-primary/50 focus:text-foreground [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          aria-label="Range end digit"
        />
      </label>
    </div>
  );
}
