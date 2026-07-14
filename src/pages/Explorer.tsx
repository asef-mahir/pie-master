import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Settings2, Focus, ChevronLeft, ChevronRight, Brain } from "lucide-react";
import { getRawDigits, TOTAL_AVAILABLE_DIGITS } from "@/lib/pi-engine";
import { Input } from "@/components/ui/input";
import DigitGrid from "@/components/explorer/DigitGrid";
import MemorizationTrainer from "@/components/explorer/MemorizationTrainer";

type ChunkSize = 5 | 10;

export default function Explorer() {
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(1000);
  const [chunkSize, setChunkSize] = useState<ChunkSize>(5);
  const [focusMode, setFocusMode] = useState(false);
  const [focusRow, setFocusRow] = useState(0);
  const [showTrainer, setShowTrainer] = useState(false);

  const digits = getRawDigits(0, visibleCount);
  const chunksPerRow = chunkSize === 5 ? 4 : 2;
  const digitsPerRow = chunksPerRow * chunkSize;
  const totalRows = Math.ceil(digits.length / digitsPerRow);

  const searchMatchCount = useMemo(() => {
    if (!search || search.length < 1) return 0;
    let count = 0, idx = 0;
    while (true) {
      idx = digits.indexOf(search, idx);
      if (idx === -1) break;
      count++;
      idx++;
    }
    return count;
  }, [search, digits]);

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-2">Pi Explorer</h1>
        <p className="text-muted-foreground mb-8">
          Showing digits 1–{visibleCount.toLocaleString()} of {TOTAL_AVAILABLE_DIGITS.toLocaleString()}
        </p>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search for a pattern (e.g. 999999)"
              value={search}
              onChange={(e) => setSearch(e.target.value.replace(/[^0-9]/g, ""))}
              className="pl-10 glass border-border/50 font-mono"
              inputMode="numeric"
              autoCapitalize="off"
              autoCorrect="off"
            />
            {search && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                {searchMatchCount > 0 ? `${searchMatchCount} found` : "No match"}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Settings2 className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Chunk:</span>
            {([5, 10] as ChunkSize[]).map((n) => (
              <button
                key={n}
                onClick={() => setChunkSize(n)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  chunkSize === n
                    ? "bg-primary text-primary-foreground"
                    : "glass text-muted-foreground hover:text-foreground"
                }`}
              >
                {n}
              </button>
            ))}

            <div className="w-px h-6 bg-border mx-1" />

            <button
              onClick={() => { setFocusMode(!focusMode); setFocusRow(0); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-1.5 ${
                focusMode
                  ? "bg-primary text-primary-foreground"
                  : "glass text-muted-foreground hover:text-foreground"
              }`}
            >
              <Focus className="w-3.5 h-3.5" /> Focus
            </button>

            <button
              onClick={() => setShowTrainer(!showTrainer)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-1.5 ${
                showTrainer
                  ? "bg-primary text-primary-foreground"
                  : "glass text-muted-foreground hover:text-foreground"
              }`}
            >
              <Brain className="w-3.5 h-3.5" /> Train
            </button>
          </div>
        </div>

        {/* Memorization Trainer */}
        {showTrainer && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-6">
            <MemorizationTrainer chunkSize={chunkSize} />
          </motion.div>
        )}

        {/* Focus Mode Controls */}
        {focusMode && (
          <div className="flex items-center justify-between mb-4 glass rounded-xl px-4 py-2.5">
            <button
              onClick={() => setFocusRow(Math.max(0, focusRow - 1))}
              disabled={focusRow === 0}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-secondary disabled:opacity-30 transition-colors shrink-0"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-xs sm:text-sm text-muted-foreground font-mono whitespace-nowrap px-1">
              <span className="sm:hidden">Row {focusRow + 1}/{totalRows} · {focusRow * digitsPerRow + 1}–{Math.min((focusRow + 1) * digitsPerRow, visibleCount)}</span>
              <span className="hidden sm:inline">Row {focusRow + 1} of {totalRows} — Digits {focusRow * digitsPerRow + 1}–{Math.min((focusRow + 1) * digitsPerRow, visibleCount)}</span>
            </span>
            <button
              onClick={() => setFocusRow(Math.min(totalRows - 1, focusRow + 1))}
              disabled={focusRow >= totalRows - 1}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-secondary disabled:opacity-30 transition-colors shrink-0"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Digit Grid */}
        <div className="glass rounded-2xl p-4 sm:p-6 overflow-x-auto">
          <div className="flex items-center justify-between mb-4 text-sm text-muted-foreground">
            <span>3.</span>
            <span className="text-xs">Hover row to highlight · Click chunk to copy</span>
          </div>

          <DigitGrid
            visibleCount={visibleCount}
            chunkSize={chunkSize}
            search={search}
            focusMode={focusMode}
            focusRow={focusRow}
            onFocusRowChange={setFocusRow}
          />

          {!focusMode && visibleCount < TOTAL_AVAILABLE_DIGITS && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setVisibleCount((v) => Math.min(v + 1000, TOTAL_AVAILABLE_DIGITS))}
              className="mt-6 px-6 py-2 rounded-xl glass text-sm font-medium hover:border-primary/30 transition-colors w-full"
            >
              Load more digits ({Math.min(visibleCount + 1000, TOTAL_AVAILABLE_DIGITS).toLocaleString()} / {TOTAL_AVAILABLE_DIGITS.toLocaleString()})
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
