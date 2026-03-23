"use client";

import { useState, useCallback } from "react";
import { Check, CircleX } from "lucide-react";
import WordModal, { type WordEntry, type WordStatus } from "./word-modal";

// ─── Interactive word chip (button version of WordChip) ──────────────────────

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
        active:scale-95 transition-transform cursor-pointer
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

// ─── Dictation word card (interactive version) ───────────────────────────────

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
        active:scale-95 transition-transform cursor-pointer
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

// ─── Main section component ──────────────────────────────────────────────────

type Props = {
  examples: string[];
  wordList: string[];
  dictationWords: string[];
  highlight?: string;
  heroBg: string;
  heroText: string;
};

function statusKey(section: string, word: string) {
  return `${section}:${word}`;
}

export default function WordPracticeSection({
  examples,
  wordList,
  dictationWords,
  highlight,
  heroBg,
  heroText,
}: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completionStatus, setCompletionStatus] = useState<Map<string, WordStatus>>(new Map());

  // Build flat word array
  const allWords: WordEntry[] = [
    ...examples.map((w, i) => ({ word: w, section: "examples" as const, sectionIndex: i })),
    ...wordList.map((w, i) => ({ word: w, section: "wordList" as const, sectionIndex: i })),
    ...dictationWords.map((w, i) => ({ word: w, section: "dictation" as const, sectionIndex: i })),
  ];

  const openModal = useCallback((index: number) => {
    setCurrentIndex(index);
    setModalOpen(true);
  }, []);

  const handleStatusChange = useCallback((key: string, status: WordStatus | null) => {
    setCompletionStatus((prev) => {
      const next = new Map(prev);
      if (status === null) next.delete(key);
      else next.set(key, status);
      return next;
    });
  }, []);

  // Track offset for each section in the flat array
  const examplesOffset = 0;
  const wordListOffset = examples.length;
  const dictationOffset = examples.length + wordList.length;

  return (
    <>
      {/* Example words */}
      {examples.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {examples.map((w, i) => (
            <InteractiveWordChip
              key={w}
              word={w}
              highlight={highlight}
              status={completionStatus.get(statusKey("examples", w))}
              onClick={() => openModal(examplesOffset + i)}
            />
          ))}
        </div>
      )}

      {/* Practice word list — inside the lesson plan card */}
      {wordList.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg" aria-hidden="true">🗂️</span>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
              Minutes 9–12 · Practice Word List ({wordList.length} words)
            </h3>
          </div>
          <div className="flex flex-wrap gap-2 pl-7">
            {wordList.map((w, i) => (
              <InteractiveWordChip
                key={w}
                word={w}
                highlight={highlight}
                status={completionStatus.get(statusKey("wordList", w))}
                onClick={() => openModal(wordListOffset + i)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Dictation words */}
      {dictationWords.length > 0 && (
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
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pl-7">
            {dictationWords.map((w, i) => (
              <InteractiveDictationCard
                key={w}
                word={w}
                index={i}
                status={completionStatus.get(statusKey("dictation", w))}
                onClick={() => openModal(dictationOffset + i)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Modal */}
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
        />
      )}
    </>
  );
}
