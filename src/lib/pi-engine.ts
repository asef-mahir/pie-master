import { PI_DIGITS } from "./pi-digits";

export { PI_DIGITS };

export function getDigits(start: number = 0, count?: number): string {
  const digits = "3." + PI_DIGITS;
  if (count === undefined) return digits.slice(start);
  return digits.slice(start, start + count);
}

export function getRawDigits(start: number = 0, count?: number): string {
  if (count === undefined) return PI_DIGITS.slice(start);
  return PI_DIGITS.slice(start, start + count);
}

export function validateInput(input: string, startPosition: number = 0): {
  correct: boolean;
  correctCount: number;
  expected: string;
} {
  const clean = input.replace(/[^0-9]/g, "");
  let correctCount = 0;

  for (let i = 0; i < clean.length; i++) {
    if (clean[i] === PI_DIGITS[startPosition + i]) {
      correctCount++;
    } else {
      return {
        correct: false,
        correctCount,
        expected: PI_DIGITS[startPosition + i],
      };
    }
  }

  return { correct: true, correctCount, expected: PI_DIGITS[startPosition + clean.length] || "" };
}

export function generateMissingDigitQuestion(maxDigit: number = 20): {
  display: string;
  answer: string;
  position: number;
} {
  const pos = Math.floor(Math.random() * Math.min(maxDigit, PI_DIGITS.length));
  const start = Math.max(0, pos - 2);
  const end = Math.min(PI_DIGITS.length, pos + 3);
  const segment = PI_DIGITS.slice(start, end);
  const relPos = pos - start;
  const display =
    (start === 0 ? "3." : "...") +
    segment.slice(0, relPos) +
    "_" +
    segment.slice(relPos + 1) +
    (end < PI_DIGITS.length ? "..." : "");

  return { display, answer: PI_DIGITS[pos], position: pos };
}

export function calculateScore(digitsCorrect: number, timeMs: number): number {
  if (digitsCorrect === 0) return 0;
  const timeBonus = Math.max(0, 1 - timeMs / (digitsCorrect * 3000));
  return Math.round(digitsCorrect * 100 * (1 + timeBonus));
}

export function getDigitColor(digit: string): string {
  const colors: Record<string, string> = {
    "0": "text-red-400",
    "1": "text-cyan-400",
    "2": "text-emerald-400",
    "3": "text-yellow-400",
    "4": "text-purple-400",
    "5": "text-pink-400",
    "6": "text-orange-400",
    "7": "text-blue-400",
    "8": "text-teal-400",
    "9": "text-indigo-400",
  };
  return colors[digit] || "text-foreground";
}

export const TRAINING_LEVELS = [
  { digits: 10, label: "Beginner", color: "from-emerald-500 to-teal-500" },
  { digits: 20, label: "Novice", color: "from-cyan-500 to-blue-500" },
  { digits: 50, label: "Intermediate", color: "from-blue-500 to-indigo-500" },
  { digits: 100, label: "Advanced", color: "from-purple-500 to-violet-500" },
  { digits: 500, label: "Master", color: "from-amber-500 to-orange-500" },
  { digits: 1000, label: "Legend", color: "from-red-500 to-pink-500" },
];

export const TOTAL_AVAILABLE_DIGITS = PI_DIGITS.length;
