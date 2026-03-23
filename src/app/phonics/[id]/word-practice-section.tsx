"use client";

import { useState, useCallback, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, CircleX } from "lucide-react";
import WordModal, { type WordEntry, type WordStatus } from "./word-modal";
import { updateSkillStatus } from "@/lib/actions";
import ConfettiCanvas from "./confetti-canvas";

// ─── Interactive word chip ────────────────────────────────────────────────────

function InteractiveWordChip({
  word,
  highlight,
  status,
  onClick,
}: {
  word: string;
  highlight?: string;
  status?: WordStatus | null;
  onClick: () => void;
}) {
  const highlighted = (() => {
    if (!highlight) return <>{word}</>;
    const regex = new RegExp(`(${highlight})`, "i");
    const parts = word.split(regex);
    return (
      <>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <span key={i} className="text-indigo-600 font-bold underline decoration-indigo-300">
              {part}
            </span>
          ) : (
            <span key={i}>{part}</span>
          ),
        )}
      </>
    );
  })();

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative px-4 py-2 text-base sm:px-3 sm:py-1.5 sm:text-sm
        bg-white border rounded-lg font-mono text-gray-800
        active:scale-95 transition-all duration-150 cursor-pointer
        hover:-translate-y-0.5 hover:shadow-md hover:shadow-indigo-100
        hover:bg-indigo-50 hover:border-indigo-400 hover:font-semibold
        ${status === "complete"
          ? "border-green-400 bg-green-50"
          : status === "incomplete"
            ? "border-red-300 bg-red-50"
            : "border-indigo-200"
        }
      `}
    >
      {highlighted}
      {status && (
        <span className={`absolute -top-1.5 -right-1.5 rounded-full p-0.5 ${
          status === "complete" ? "bg-green-500 text-white" : "bg-red-400 text-white"
        }`}>
          {status === "complete" ? <Check className="size-3" /> : <CircleX className="size-3" />}
        </span>
      )}
    </button>
  );
}

// ─── Dictation word card ──────────────────────────────────────────────────────

function InteractiveDictationCard({
  word,
  index,
  status,
  onClick,
}: {
  word: string;
  index: number;
  status?: WordStatus | null;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative bg-white rounded-xl border-2 border-dashed p-3 text-center
        active:scale-95 transition-all duration-150 cursor-pointer
        hover:-translate-y-0.5 hover:shadow-md hover:shadow-indigo-100
        hover:bg-indigo-50 hover:border-indigo-400 hover:font-semibold
        ${status === "complete"
          ? "border-green-400"
          : status === "incomplete"
            ? "border-red-300"
            : "border-indigo-300"
        }
      `}
    >
      <div className="text-xs text-indigo-400 font-medium mb-1">Word {index + 1}</div>
      <div className="font-mono text-sm font-semibold text-gray-800">{word}</div>
      <div className="mt-2 border-b-2 border-indigo-200 mx-2" />
      {status && (
        <span className={`absolute -top-1.5 -right-1.5 rounded-full p-0.5 ${
          status === "complete" ? "bg-green-500 text-white" : "bg-red-400 text-white"
        }`}>
          {status === "complete" ? <Check className="size-3" /> : <CircleX className="size-3" />}
        </span>
      )}
    </button>
  );
}

// ─── Victory sound ────────────────────────────────────────────────────────────

function playVictorySound() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    // Ascending C-major arpeggio: C5 E5 G5 C6
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = "sine";
      const t = ctx.currentTime + i * 0.15;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.35, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.65);
      osc.start(t);
      osc.stop(t + 0.65);
    });
  } catch (_) {
    // Audio not available — silently ignore
  }
}

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = {
  examples: string[];
  wordList: string[];
  dictationWords: string[];
  highlight?: string;
  heroBg: string;
  heroText: string;
  skillId: number;
  childId: string;
  skillStatus: string;
  warmup?: string | null;
  introduction?: string | null;
};

function sKey(section: string, word: string) {
  return `${section}:${word}`;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function WordPracticeSection({
  examples,
  wordList,
  dictationWords,
  highlight,
  heroBg,
  heroText,
  skillId,
  childId,
  skillStatus,
  warmup,
  introduction,
}: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [modalOpen, setModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completionStatus, setCompletionStatus] = useState<Map<string, WordStatus>>(new Map());
  const [showConfetti, setShowConfetti] = useState(false);
  const [localStatus, setLocalStatus] = useState(skillStatus);

  // Build single flat word list deduplicated across sections
  const allWords = useMemo<WordEntry[]>(() => {
    const seen = new Set<string>();
    const words: WordEntry[] = [];
    const sections: Array<[string[], WordEntry["section"]]> = [
      [examples, "examples"],
      [wordList, "wordList"],
      [dictationWords, "dictation"],
    ];
    for (const [arr, section] of sections) {
      arr.forEach((w, i) => {
        if (!seen.has(w.toLowerCase())) {
          seen.add(w.toLowerCase());
          words.push({ word: w, section, sectionIndex: i });
        }
      });
    }
    return words;
  }, [examples, wordList, dictationWords]);

  // Lookup: "section:word" → index in allWords
  const wordIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    allWords.forEach((entry, idx) => map.set(`${entry.section}:${entry.word}`, idx));
    return map;
  }, [allWords]);

  const exampleEntries = useMemo(() => allWords.filter(e => e.section === "examples"), [allWords]);
  const wordListEntries = useMemo(() => allWords.filter(e => e.section === "wordList"), [allWords]);
  const dictationEntries = useMemo(() => allWords.filter(e => e.section === "dictation"), [allWords]);

  const openModal = useCallback((index: number) => {
    setCurrentIndex(index);
    setModalOpen(true);
    // Mark as in_progress when first interaction if not already tracked
    if (localStatus === "not_started") {
      setLocalStatus("in_progress");
      startTransition(() => {
        updateSkillStatus(skillId, "in_progress", childId);
      });
    }
  }, [localStatus, skillId, startTransition]);

  const handleStatusChange = useCallback((key: string, status: WordStatus | null) => {
    setCompletionStatus((prev) => {
      const next = new Map(prev);
      if (status === null) next.delete(key);
      else next.set(key, status);
      return next;
    });
  }, []);

  const handleFinish = useCallback(() => {
    setModalOpen(false);
    setShowConfetti(true);
    playVictorySound();
    startTransition(() => {
      updateSkillStatus(skillId, "mastered", childId);
    });
    setTimeout(() => {
      router.push("/phonics");
    }, 2800);
  }, [skillId, router, startTransition]);

  const hasLessonContent = warmup || introduction || wordListEntries.length > 0 || dictationEntries.length > 0;

  return (
    <>
      {showConfetti && <ConfettiCanvas />}

      {/* Example words at top */}
      {exampleEntries.length > 0 && (
        <>
          <p className="text-xs text-indigo-400 italic mb-1">Select a word to start</p>
          <div className="flex flex-wrap gap-2">
          {exampleEntries.map((entry) => (
            <InteractiveWordChip
              key={entry.word}
              word={entry.word}
              highlight={highlight}
              status={completionStatus.get(sKey("examples", entry.word))}
              onClick={() => openModal(wordIndexMap.get(`examples:${entry.word}`) ?? 0)}
            />
          ))}
        </div>
        </>
      )}

      {/* Lesson plan card */}
      {hasLessonContent && (
        <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-5 space-y-5">
          <h2 className="font-semibold text-indigo-900 text-base">📋 Today&apos;s Lesson Plan</h2>

          {warmup && (
            <section>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg" aria-hidden="true">🎤</span>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
                  Minutes 1–3 · Warm-up
                </h3>
              </div>
              <p className="text-sm text-gray-800 leading-relaxed pl-7">{warmup}</p>
            </section>
          )}

          {introduction && (
            <section>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg" aria-hidden="true">💡</span>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
                  Minutes 4–8 · Introduction
                </h3>
              </div>
              <p className="text-sm text-gray-800 leading-relaxed pl-7">{introduction}</p>
            </section>
          )}

          {wordListEntries.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg" aria-hidden="true">🗂️</span>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
                  Minutes 9–12 · Practice Word List ({wordListEntries.length} words)
                </h3>
              </div>
              <p className="text-xs text-indigo-400 italic mb-1 pl-7">Select a word to start</p>
              <div className="flex flex-wrap gap-2 pl-7">
                {wordListEntries.map((entry) => (
                  <InteractiveWordChip
                    key={entry.word}
                    word={entry.word}
                    highlight={highlight}
                    status={completionStatus.get(sKey("wordList", entry.word))}
                    onClick={() => openModal(wordIndexMap.get(`wordList:${entry.word}`) ?? 0)}
                  />
                ))}
              </div>
            </section>
          )}

          {dictationEntries.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg" aria-hidden="true">✏️</span>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
                  Minutes 13–15 · Dictation
                </h3>
              </div>
              <p className="text-xs text-indigo-600 mb-3 pl-7">
                Say each word clearly — she writes it without seeing it, then check together.
              </p>
              <p className="text-xs text-indigo-400 italic mb-1 pl-7">Select a word to start</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pl-7">
                {dictationEntries.map((entry, i) => (
                  <InteractiveDictationCard
                    key={entry.word}
                    word={entry.word}
                    index={i}
                    status={completionStatus.get(sKey("dictation", entry.word))}
                    onClick={() => openModal(wordIndexMap.get(`dictation:${entry.word}`) ?? 0)}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Shared modal for all words */}
      {modalOpen && (
        <WordModal
          words={allWords}
          currentIndex={currentIndex}
          onIndexChange={setCurrentIndex}
          onClose={() => setModalOpen(false)}
          highlight={highlight}
          heroBg={heroBg}
          heroText={heroText}
          completionStatus={completionStatus}
          onStatusChange={handleStatusChange}
          onFinish={handleFinish}
        />
      )}
    </>
  );
}
