"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { X, Check, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createAssessment } from "@/lib/actions";
import { WPM_WORDS, LETTER_SOUNDS, SIGHT_WORDS, shuffle } from "./assessment-data";
import { useRouter } from "next/navigation";

export type AssessmentMode = "wpm" | "sounds" | "sightwords";
type Phase = "idle" | "active" | "results" | "confirm-discard";

type ItemResult = { item: string; correct: boolean };

interface Props {
  mode: AssessmentMode;
  childId: string;
  onClose: () => void;
}

export default function AssessmentRunner({ mode, childId, onClose }: Props) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [items, setItems] = useState<string[]>([]);
  const [sightItems, setSightItems] = useState<{ word: string; emoji: string }[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [results, setResults] = useState<ItemResult[]>([]);
  const [saving, setSaving] = useState(false);

  // WPM-only timer state
  const WPM_DURATION = 60;
  const [timeLeft, setTimeLeft] = useState(WPM_DURATION);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerPausedRef = useRef(false);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    timerRef.current = setInterval(() => {
      if (timerPausedRef.current) return;
      setTimeLeft((t) => {
        if (t <= 1) {
          stopTimer();
          setPhase("results");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }, [stopTimer]);

  useEffect(() => () => stopTimer(), [stopTimer]);

  function initRun() {
    if (mode === "wpm") {
      setItems(shuffle(WPM_WORDS));
    } else if (mode === "sounds") {
      setItems(shuffle(LETTER_SOUNDS));
    } else {
      setSightItems(shuffle(SIGHT_WORDS));
    }
    setCurrentIdx(0);
    setResults([]);
    setTimeLeft(WPM_DURATION);
    setPhase("active");
    if (mode === "wpm") startTimer();
  }

  function currentItem(): string {
    return mode === "sightwords" ? sightItems[currentIdx]?.word ?? "" : items[currentIdx] ?? "";
  }

  function currentEmoji(): string {
    return mode === "sightwords" ? sightItems[currentIdx]?.emoji ?? "" : "";
  }

  function totalItems(): number {
    return mode === "sightwords" ? sightItems.length : items.length;
  }

  function advance(correct?: boolean) {
    if (mode !== "wpm" && correct !== undefined) {
      setResults((r) => [...r, { item: currentItem(), correct }]);
    }
    const next = currentIdx + 1;
    if (mode !== "wpm" && next >= totalItems()) {
      setPhase("results");
      return;
    }
    setCurrentIdx(next);
  }

  function finishWpm() {
    stopTimer();
    setPhase("results");
  }

  function wpmScore(): number {
    return currentIdx;
  }

  function correctCount(): number {
    return results.filter((r) => r.correct).length;
  }

  function handleCancelRequest() {
    if (currentIdx === 0 && phase === "active") {
      stopTimer();
      onClose();
      return;
    }
    timerPausedRef.current = true;
    setPhase("confirm-discard");
  }

  function handleConfirmDiscard() {
    stopTimer();
    onClose();
  }

  function handleCancelDiscard() {
    timerPausedRef.current = false;
    setPhase("active");
    if (mode === "wpm" && timeLeft > 0) startTimer();
  }

  async function handleSave() {
    setSaving(true);
    const today = new Date().toISOString().split("T")[0];
    let type: string;
    let value: number;
    if (mode === "wpm") {
      type = "wcpm";
      value = wpmScore();
    } else if (mode === "sounds") {
      type = "sounds_known";
      value = correctCount();
    } else {
      type = "sight_words";
      value = correctCount();
    }
    try {
      await createAssessment({ childId, date: today, type, value });
      router.refresh();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  function handleTryAgain() {
    initRun();
  }

  // ─── Idle screen ────────────────────────────────────────────────────────────
  if (phase === "idle") {
    const meta = {
      wpm:        { emoji: "⏱️", title: "Words Per Minute",  desc: "Read each word aloud. Tap Next to advance. 1 minute timer." },
      sounds:     { emoji: "🔤", title: "Letter Sounds",     desc: "Show each letter. Child says the sound. You mark ✓ or ✗." },
      sightwords: { emoji: "👁️", title: "Sight Words",       desc: "Each word has a picture clue. Child reads it aloud. You mark ✓ or ✗." },
    }[mode];
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-8 text-center space-y-4">
          <div className="text-5xl">{meta.emoji}</div>
          <h2 className="text-xl font-bold text-gray-900">{meta.title}</h2>
          <p className="text-sm text-gray-500 leading-relaxed">{meta.desc}</p>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700" onClick={initRun}>Start Test</Button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Confirm discard overlay ─────────────────────────────────────────────────
  if (phase === "confirm-discard") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center space-y-4">
          <p className="font-semibold text-gray-900">Discard progress?</p>
          <p className="text-sm text-gray-500">Your results so far will be lost.</p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={handleCancelDiscard}>Keep going</Button>
            <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white" onClick={handleConfirmDiscard}>Discard</Button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Active screen ───────────────────────────────────────────────────────────
  if (phase === "active") {
    const progress = totalItems() > 0 ? (currentIdx / totalItems()) * 100 : 0;
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          {mode === "wpm" ? (
            <span className={`text-sm font-bold tabular-nums ${timeLeft <= 10 ? "text-red-500" : "text-gray-700"}`}>
              {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
            </span>
          ) : (
            <span className="text-sm text-gray-500">{currentIdx + 1} / {totalItems()}</span>
          )}
          <button
            onClick={handleCancelRequest}
            className="text-xs text-gray-400 border border-gray-200 rounded-md px-3 py-1.5 hover:bg-gray-50 flex items-center gap-1"
          >
            <X className="size-3" /> Cancel
          </button>
        </div>

        {/* Progress bar */}
        <div className="mx-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 rounded-full transition-all duration-200" style={{ width: `${progress}%` }} />
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
          {mode === "sightwords" && (
            <div className="text-6xl">{currentEmoji()}</div>
          )}
          <div className={`font-bold text-gray-900 text-center select-none ${
            mode === "sounds" ? "text-8xl font-mono" : "text-6xl font-mono"
          }`}>
            {currentItem()}
          </div>
          {mode === "wpm" && (
            <span className="text-xs text-gray-400">Word {currentIdx + 1}</span>
          )}
        </div>

        {/* Bottom actions */}
        <div className="px-6 pb-8 space-y-3 max-w-sm mx-auto w-full">
          {mode === "wpm" ? (
            <>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 py-6 text-base" onClick={() => advance()}>
                Next →
              </Button>
              <button onClick={finishWpm} className="w-full text-xs text-gray-400 hover:text-gray-600 text-center py-1">
                Finish early
              </button>
            </>
          ) : (
            <div className="flex gap-4">
              <button
                onClick={() => advance(false)}
                className="flex-1 py-4 bg-red-50 border-2 border-red-300 rounded-xl text-2xl font-bold text-red-500 hover:bg-red-100 active:scale-95 transition-all"
              >
                ✗
              </button>
              <button
                onClick={() => advance(true)}
                className="flex-1 py-4 bg-green-50 border-2 border-green-300 rounded-xl text-2xl font-bold text-green-500 hover:bg-green-100 active:scale-95 transition-all"
              >
                ✓
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Results screen ──────────────────────────────────────────────────────────
  const WPM_BENCHMARKS = [
    { label: "On Grade", min: 90 },
    { label: "Good",     min: 60 },
    { label: "Building", min: 30 },
    { label: "Early",    min: 0 },
  ];

  function wpmBand(wpm: number): string {
    return WPM_BENCHMARKS.find((b) => wpm >= b.min)?.label ?? "Early";
  }

  const score = mode === "wpm" ? wpmScore() : correctCount();
  const total = mode === "wpm" ? null : totalItems();

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      <div className="flex-1 overflow-y-auto px-6 pt-8 pb-4 max-w-lg mx-auto w-full">
        <div className="text-center space-y-1 mb-6">
          <div className="text-5xl mb-3">🎉</div>
          {mode === "wpm" ? (
            <>
              <p className="text-5xl font-black text-green-600">{score} <span className="text-2xl font-semibold">wpm</span></p>
              <p className="text-sm text-gray-500">{score} words in 60 seconds</p>
              <p className="text-sm font-semibold text-gray-700 mt-1">Grade 1: {wpmBand(score)}</p>
            </>
          ) : (
            <>
              <p className="text-5xl font-black text-green-600">{score}<span className="text-2xl font-semibold text-gray-400">/{total}</span></p>
              <p className="text-sm text-gray-500">
                {mode === "sounds" ? "Letter sounds known" : "Sight words known"}
              </p>
            </>
          )}
        </div>

        {/* Pill grid — sounds and sightwords only */}
        {mode !== "wpm" && results.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center">
            {results.map((r) => (
              <span
                key={r.item}
                className={`px-3 py-1.5 rounded-full border font-mono text-sm font-semibold flex items-center gap-1.5 ${
                  r.correct
                    ? "bg-white border-green-300 text-green-700"
                    : "bg-white border-red-300 text-red-600"
                }`}
              >
                {r.item}
                {r.correct ? <Check className="size-3" /> : <XCircle className="size-3" />}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-6 pb-8 pt-2 flex gap-3 max-w-lg mx-auto w-full">
        <Button variant="outline" className="flex-1" onClick={handleTryAgain}>↺ Try Again</Button>
        <Button
          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          disabled={saving}
          onClick={handleSave}
        >
          {saving ? "Saving…" : "Save Result"}
        </Button>
      </div>
    </div>
  );
}
