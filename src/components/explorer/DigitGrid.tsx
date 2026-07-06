import { useMemo, useCallback, useState } from "react";
import { Check } from "lucide-react";
import { getRawDigits } from "@/lib/pi-engine";
import { toast } from "sonner";

interface DigitGridProps {
  visibleCount: number;
  chunkSize: 5 | 10;
  search: string;
  focusMode: boolean;
  focusRow: number;
  onFocusRowChange: (row: number) => void;
}

export default function DigitGrid({
  visibleCount,
  chunkSize,
  search,
  focusMode,
  focusRow,
  onFocusRowChange,
}: DigitGridProps) {
  const [copiedChunk, setCopiedChunk] = useState<number | null>(null);
  const [hoveredChunk, setHoveredChunk] = useState<number | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  const digits = getRawDigits(0, visibleCount);
  const chunksPerRow = chunkSize === 5 ? 4 : 2;
  const digitsPerRow = chunksPerRow * chunkSize;

  const chunks = useMemo(() => {
    const result: string[] = [];
    for (let i = 0; i < digits.length; i += chunkSize) {
      result.push(digits.slice(i, i + chunkSize));
    }
    return result;
  }, [digits, chunkSize]);

  const rows = useMemo(() => {
    const result: string[][] = [];
    for (let i = 0; i < chunks.length; i += chunksPerRow) {
      result.push(chunks.slice(i, i + chunksPerRow));
    }
    return result;
  }, [chunks, chunksPerRow]);

  const searchPositions = useMemo(() => {
    if (!search || search.length < 1) return new Set<number>();
    const positions = new Set<number>();
    let idx = 0;
    while (true) {
      idx = digits.indexOf(search, idx);
      if (idx === -1) break;
      for (let i = idx; i < idx + search.length; i++) positions.add(i);
      idx++;
    }
    return positions;
  }, [search, digits]);

  const handleCopyChunk = useCallback((chunkIndex: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedChunk(chunkIndex);
    toast.success(`Copied: ${text}`);
    setTimeout(() => setCopiedChunk(null), 1500);
  }, []);

  const displayRows = focusMode ? [rows[focusRow]] : rows;
  const startRowIdx = focusMode ? focusRow : 0;

  return (
    <div className="space-y-1">
      {displayRows.map((row, i) => {
        if (!row) return null;
        const rowIdx = startRowIdx + i;
        const rowStartDigit = rowIdx * digitsPerRow;
        const isRowHovered = hoveredRow === rowIdx;

        return (
          <div
            key={rowIdx}
            className={`flex items-center gap-2 sm:gap-4 py-1.5 px-2 rounded-lg transition-colors duration-200 ${
              isRowHovered ? "bg-primary/5 shadow-[0_0_20px_hsl(var(--primary)/0.05)]" : ""
            }`}
            onMouseEnter={() => setHoveredRow(rowIdx)}
            onMouseLeave={() => setHoveredRow(null)}
          >
            <span className="text-xs text-muted-foreground font-mono w-12 sm:w-16 text-right shrink-0 select-none tabular-nums">
              {rowStartDigit + 1}
            </span>

            <div className="flex gap-3 sm:gap-5 flex-1">
              {row.map((chunk, chunkIdx) => {
                const globalChunkIdx = rowIdx * chunksPerRow + chunkIdx;
                const chunkStartDigit = globalChunkIdx * chunkSize;
                const isEvenChunk = globalChunkIdx % 2 === 0;
                const isHovered = hoveredChunk === globalChunkIdx;
                const isCopied = copiedChunk === globalChunkIdx;

                const hasSearchMatch = search
                  ? Array.from({ length: chunk.length }, (_, i) =>
                      searchPositions.has(chunkStartDigit + i)
                    ).some(Boolean)
                  : false;

                return (
                  <span
                    key={chunkIdx}
                    className={`
                      font-mono text-base sm:text-lg tracking-[0.2em] cursor-pointer
                      rounded px-1.5 py-0.5 transition-all duration-150 select-text relative
                      ${hasSearchMatch
                        ? "bg-primary/20 text-primary"
                        : isHovered
                          ? "bg-secondary text-foreground"
                          : isEvenChunk
                            ? "text-foreground/90"
                            : "text-foreground/65"
                      }
                    `}
                    onMouseEnter={() => setHoveredChunk(globalChunkIdx)}
                    onMouseLeave={() => setHoveredChunk(null)}
                    onClick={() => handleCopyChunk(globalChunkIdx, chunk)}
                    title={`Digits ${chunkStartDigit + 1}–${chunkStartDigit + chunk.length}`}
                  >
                    {chunk.split("").map((d, dIdx) => {
                      const globalDigitIdx = chunkStartDigit + dIdx;
                      const isSearchHit = searchPositions.has(globalDigitIdx);
                      const isTenthDigit = (globalDigitIdx + 1) % 10 === 0;

                      return (
                        <span
                          key={dIdx}
                          className={`
                            ${isSearchHit ? "text-primary font-bold" : ""}
                            ${isTenthDigit && !isSearchHit ? "text-primary/70" : ""}
                          `}
                        >
                          {d}
                        </span>
                      );
                    })}
                    {isCopied && (
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-primary flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> copied
                      </span>
                    )}
                  </span>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
