"use client";

import { useEffect, useCallback, useState } from "react";
import { X, ChevronLeft, ChevronRight, Check, CircleX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getWordEmoji } from "@/lib/word-emoji";
import { useSwipe } from "./use-swipe";

export type WordStatus = "complete" | "incomplete";

export type WordEntry = {
  word: string;
  section: "examples" | "wordList" | "dictation";
  sectionIndex: number;
};

const SECTION_LABELS: Record<string, string> = {
  examples: "Example Words",
  wordList: "Practice Word List",
  dictation: "Dictation Words",
};

type Props = {
  words: WordEntry[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  highlight?: string;
  heroBg: string;
  heroText: string;
  completionStatus: Map<string, WordStatus>;
  onStatusChange: (key: string, status: WordStatus | null) => void;
  onFinish: () => void;
};

function statusKey(entry: WordEntry) {
  return `${entry.section}:${entry.word}`;
}

function HighlightedWord({ word, highlight, className }: { word: string; highlight?: string; className?: string }) {
  if (!highlight) {
    return <span className={className}>{word}</span>;
  }
  const regex = new RegExp(`(${highlight})`, "i");
  const parts = word.split(regex);
  return (
    <span className={className}>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <span key={i} className="text-indigo-500 underline decoration-indigo-300 decoration-4 underline-offset-4">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </span>
  );
}

export default function WordModal({
  words,
  currentIndex,
  onIndexChange,
  onClose,
  highlight,
  heroBg,
  heroText,
  completionStatus,
  onStatusChange,
  onFinish,
}: Props) {
  const entry = words[currentIndex];
  if (!entry) return null;

  const key = statusKey(entry);
  const status = completionStatus.get(key) ?? null;
  const emoji = getWordEmoji(entry.word);
  const total = words.length;
  const isLast = currentIndex === total - 1;

  // Tap-to-reveal state (resets when word changes)
  const [revealed, setRevealed] = useState(false);

  const goNext = useCallback(() => {
    if (currentIndex < total - 1) onIndexChange(currentIndex + 1);
  }, [currentIndex, total, onIndexChange]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) onIndexChange(currentIndex - 1);
  }, [currentIndex, onIndexChange]);

  // Reset reveal when navigating to a new word
  useEffect(() => {
    setRevealed(false);
  }, [currentIndex]);

  const handleComplete = useCallback(() => {
    if (status === "complete") {
      // Toggle off
      onStatusChange(key, null);
    } else {
      // Mark complete then auto-advance
      onStatusChange(key, "complete");
      if (!isLast) {
        goNext();
      } else {
        onFinish();
      }
    }
  }, [status, key, onStatusChange, isLast, goNext, onFinish]);

  const swipeHandlers = useSwipe(goNext, goPrev);

  // Keyboard navigation & body scroll lock
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
    }
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", handleKey);
    };
  }, [onClose, goNext, goPrev]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 pt-4 pb-2">
        <span className="text-sm text-gray-400 font-medium tabular-nums">
          {currentIndex + 1} / {total}
        </span>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
          <X className="size-5" />
        </Button>
      </header>

      {/* Main content — swipe target */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-6 select-none"
        {...swipeHandlers}
      >
        {/* Emoji / letter — tap to reveal */}
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="mb-6 focus:outline-none"
          aria-label={revealed ? undefined : "Tap to reveal picture"}
        >
          {revealed ? (
            <div
              className="animate-in zoom-in-50 fade-in duration-300"
              style={{ animationFillMode: "both" }}
            >
              {emoji ? (
                <span className="text-8xl leading-none" aria-hidden="true">
                  {emoji}
                </span>
              ) : (
                <div className={`w-28 h-28 rounded-full flex items-center justify-center ${heroBg}`}>
                  <span className={`text-5xl font-black ${heroText}`}>
                    {entry.word.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div
              className={`w-28 h-28 rounded-full flex items-center justify-center ${heroBg} border-4 border-dashed border-current/30 transition-all`}
            >
              <span className="text-4xl">👆</span>
            </div>
          )}
        </button>

        {/* Word */}
        <HighlightedWord
          word={entry.word}
          highlight={highlight}
          className="text-4xl sm:text-5xl font-mono font-bold tracking-wide text-gray-900"
        />

        {/* Section label */}
        <span className="text-sm text-gray-400 mt-3">
          {SECTION_LABELS[entry.section]}
        </span>

        {/* Status indicator */}
        {status && (
          <div className={`mt-4 flex items-center gap-1.5 text-sm font-medium ${
            status === "complete" ? "text-green-600" : "text-red-500"
          }`}>
            {status === "complete" ? <Check className="size-4" /> : <CircleX className="size-4" />}
            {status === "complete" ? "Complete" : "Incomplete"}
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <footer className="px-4 pb-6 pt-2 space-y-3">
        {/* Status buttons */}
        <div className="flex gap-2 justify-center">
          <Button
            variant={status === "incomplete" ? "destructive" : "outline"}
            size="lg"
            className="flex-1 max-w-36"
            onClick={() => onStatusChange(key, status === "incomplete" ? null : "incomplete")}
          >
            <CircleX className="size-4" />
            Incomplete
          </Button>
          <Button
            variant={status === "complete" ? "default" : "outline"}
            size="lg"
            className="flex-1 max-w-36"
            onClick={handleComplete}
          >
            <Check className="size-4" />
            Complete
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            size="lg"
            onClick={goPrev}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="size-5" />
            Prev
          </Button>

          {isLast ? (
            <Button
              variant="default"
              size="lg"
              className="text-base px-6 bg-green-600 hover:bg-green-700"
              onClick={onFinish}
            >
              Finish 🎉
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="lg"
              onClick={goNext}
              disabled={currentIndex === total - 1}
            >
              Next
              <ChevronRight className="size-5" />
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}
