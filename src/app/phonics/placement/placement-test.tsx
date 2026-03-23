"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { applyPlacementResult } from "@/lib/actions";

// ─── Types ────────────────────────────────────────────────────────────────────

type Skill = {
  id: number;
  name: string;
  sequenceOrder: number;
  phase: number;
  examples: string | null;
  wordList: string | null;
  category: string;
};

type CompletedRound = {
  skillSeq: number;
  skillName: string;
  phase: number;
  correct: number;
  total: number;
  passed: boolean;
};

const PHASE_LABELS: Record<number, string> = {
  1: "Phase 1 · Foundation",
  2: "Phase 2 · Consolidation",
  3: "Phase 3 · Expansion",
  4: "Phase 4 · Independence",
};

// ─── Word extraction ──────────────────────────────────────────────────────────

function getTestWords(skill: Skill): string[] {
  const splitClean = (s: string | null) =>
    (s ?? "")
      .split(",")
      .map((w) => w.trim())
      .filter((w) => w.length > 0 && !w.includes(" ") && !w.includes(".") && /^[a-zA-Z'-]+$/.test(w));

  const combined = [...splitClean(skill.examples), ...splitClean(skill.wordList)];
  const seen = new Set<string>();
  const words: string[] = [];
  for (const w of combined) {
    if (!seen.has(w.toLowerCase()) && words.length < 5) {
      seen.add(w.toLowerCase());
      words.push(w);
    }
  }

  // Fallback: pull individual tokens from raw text if we got nothing
  if (words.length === 0) {
    const raw = ((skill.examples ?? "") + " " + (skill.wordList ?? ""))
      .split(/[\s,."?!;:]+/)
      .map((w) => w.trim())
      .filter((w) => w.length >= 2 && /^[a-zA-Z]+$/.test(w));
    for (const w of raw) {
      if (!seen.has(w.toLowerCase()) && words.length < 5) {
        seen.add(w.toLowerCase());
        words.push(w);
      }
    }
  }

  return words;
}

function findClosestSkill(skills: Skill[], targetSeq: number): Skill {
  return skills.reduce((closest, s) =>
    Math.abs(s.sequenceOrder - targetSeq) < Math.abs(closest.sequenceOrder - targetSeq) ? s : closest,
  );
}

// ─── Intro screen ─────────────────────────────────────────────────────────────

function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="text-center space-y-6 py-6">
      <div className="text-7xl">🧭</div>
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Placement Test</h1>
        <p className="text-gray-500 leading-relaxed text-sm">
          A short adaptive quiz that finds the perfect starting point in the phonics
          curriculum. Takes about 5–10 minutes.
        </p>
      </div>

      <div className="bg-indigo-50 rounded-xl p-4 text-left space-y-2.5">
        <p className="text-sm font-semibold text-indigo-900">How it works</p>
        <ol className="space-y-1.5 text-sm text-indigo-800">
          <li className="flex gap-2"><span className="font-bold shrink-0">1.</span><span>Words appear on screen one at a time.</span></li>
          <li className="flex gap-2"><span className="font-bold shrink-0">2.</span><span>Ask your child to read each word aloud.</span></li>
          <li className="flex gap-2"><span className="font-bold shrink-0">3.</span><span>Tap <strong>Got it</strong> or <strong>Struggled</strong> for each word.</span></li>
          <li className="flex gap-2"><span className="font-bold shrink-0">4.</span><span>The test adapts and homes in on the right level.</span></li>
        </ol>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800 text-left">
        <strong>Tip:</strong> Don&apos;t coach — let them try independently. It&apos;s fine to guess!
      </div>

      <Button
        size="lg"
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-base"
        onClick={onStart}
      >
        Start Test <ChevronRight className="size-4 ml-1" />
      </Button>
    </div>
  );
}

// ─── Word card ────────────────────────────────────────────────────────────────

function WordCard({
  word,
  wordIndex,
  totalWords,
  skillName,
  phase,
  roundNum,
  onScore,
}: {
  word: string;
  wordIndex: number;
  totalWords: number;
  skillName: string;
  phase: number;
  roundNum: number;
  onScore: (correct: boolean) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-6 py-4">
      {/* Context header */}
      <div className="text-center w-full">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
          Round {roundNum} · {PHASE_LABELS[phase]}
        </p>
        <p className="text-sm text-gray-500 mt-0.5 truncate max-w-xs mx-auto">{skillName}</p>
      </div>

      {/* Word progress dots */}
      <div className="flex gap-2 items-center">
        {Array.from({ length: totalWords }, (_, i) => (
          <div
            key={i}
            className={`rounded-full transition-all ${
              i < wordIndex
                ? "w-2.5 h-2.5 bg-indigo-400"
                : i === wordIndex
                  ? "w-3 h-3 bg-indigo-600"
                  : "w-2 h-2 bg-gray-200"
            }`}
          />
        ))}
      </div>

      {/* The word itself */}
      <div className="w-full rounded-2xl bg-white border-2 border-indigo-100 shadow-sm flex items-center justify-center py-20 px-6">
        <span className="text-6xl sm:text-7xl font-mono font-bold text-gray-900 tracking-wider select-none">
          {word}
        </span>
      </div>

      {/* Score buttons */}
      <div className="flex gap-3 w-full">
        <Button
          variant="outline"
          size="lg"
          className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 active:bg-red-100 h-14 text-base"
          onClick={() => onScore(false)}
        >
          <X className="size-5 mr-1.5" />
          Struggled
        </Button>
        <Button
          size="lg"
          className="flex-1 bg-green-600 hover:bg-green-700 active:bg-green-800 h-14 text-base"
          onClick={() => onScore(true)}
        >
          <Check className="size-5 mr-1.5" />
          Got it!
        </Button>
      </div>

      <p className="text-xs text-gray-400">
        Word {wordIndex + 1} of {totalWords}
      </p>
    </div>
  );
}

// ─── Results screen ───────────────────────────────────────────────────────────

function ResultsScreen({
  recommendedSeq,
  recommendedSkill,
  rounds,
  onApply,
  isApplying,
  applied,
}: {
  recommendedSeq: number;
  recommendedSkill: Skill | undefined;
  rounds: CompletedRound[];
  onApply: () => void;
  isApplying: boolean;
  applied: boolean;
}) {
  const router = useRouter();
  const allMastered = recommendedSeq > 48;

  return (
    <div className="space-y-6 py-4">
      <div className="text-center">
        <div className="text-6xl mb-3">{allMastered ? "🏆" : "🎯"}</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Test Complete!</h2>
        {allMastered ? (
          <p className="text-gray-500 text-sm">
            Incredible — your child has mastered all 48 phonics skills!
          </p>
        ) : recommendedSeq <= 1 ? (
          <p className="text-gray-500 text-sm">
            We recommend starting right at the beginning of the curriculum.
          </p>
        ) : (
          <p className="text-gray-500 text-sm">
            Based on the test, here&apos;s the recommended starting point:
          </p>
        )}
      </div>

      {/* Recommendation card */}
      {!allMastered && recommendedSkill && (
        <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50 p-5">
          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wide mb-1">
            Recommended starting point
          </p>
          <p className="text-lg font-bold text-indigo-900">
            Skill #{recommendedSeq} · {recommendedSkill.name}
          </p>
          <p className="text-sm text-indigo-600 mt-0.5">
            {PHASE_LABELS[recommendedSkill.phase]}
          </p>
          {recommendedSeq > 1 && (
            <p className="mt-3 text-sm text-indigo-700 bg-indigo-100 rounded-lg px-3 py-2">
              Skills 1–{recommendedSeq - 1} will be marked as <strong>mastered</strong>.
            </p>
          )}
        </div>
      )}

      {/* Round summary */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
          What we tested
        </p>
        {rounds.map((r, i) => (
          <div
            key={i}
            className="flex items-center justify-between text-sm bg-white border border-gray-100 rounded-lg px-3 py-2.5"
          >
            <div className="min-w-0">
              <span className="text-gray-400 text-xs mr-1">#{r.skillSeq}</span>
              <span className="text-gray-700 truncate">{r.skillName}</span>
              <span className="text-gray-400 text-xs ml-2">· {PHASE_LABELS[r.phase]}</span>
            </div>
            <span
              className={`font-medium ml-3 shrink-0 ${r.passed ? "text-green-600" : "text-red-500"}`}
            >
              {r.correct}/{r.total} {r.passed ? "✓" : "✗"}
            </span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="space-y-2">
        {!allMastered && (
          <Button
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-base"
            size="lg"
            onClick={onApply}
            disabled={isApplying || applied}
          >
            {applied
              ? "Applied! Heading to phonics map…"
              : isApplying
                ? "Applying…"
                : "Apply & Go to Phonics Map"}
          </Button>
        )}
        <Button
          variant="outline"
          className="w-full"
          size="lg"
          onClick={() => router.push("/phonics")}
        >
          View Phonics Map
        </Button>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function PlacementTest({ skills, childId }: { skills: Skill[]; childId: string }) {
  const router = useRouter();

  // Binary search state: find first skill the child can't do
  // Invariant: recommended starting skill = lo when lo >= hi
  const [lo, setLo] = useState(1);
  const [hi, setHi] = useState(skills.length); // inclusive upper bound

  const [stage, setStage] = useState<"intro" | "testing" | "results">("intro");
  const [rounds, setRounds] = useState<CompletedRound[]>([]);
  const [wordIndex, setWordIndex] = useState(0);
  const [currentScores, setCurrentScores] = useState<boolean[]>([]);
  const [isPending, startTransition] = useTransition();
  const [applied, setApplied] = useState(false);

  // The skill being tested this round (midpoint of search range)
  const midSeq = Math.floor((lo + hi) / 2);
  const currentSkill = findClosestSkill(skills, midSeq);
  const currentWords = getTestWords(currentSkill);
  const currentWord = currentWords[wordIndex];

  // Final recommendation once binary search converges
  const recommendedSeq = lo;
  const recommendedSkill = skills.find((s) => s.sequenceOrder === recommendedSeq)
    ?? findClosestSkill(skills, recommendedSeq);

  const handleScore = (correct: boolean) => {
    const newScores = [...currentScores, correct];

    if (wordIndex < currentWords.length - 1) {
      setWordIndex(wordIndex + 1);
      setCurrentScores(newScores);
      return;
    }

    // Round complete — evaluate and update search bounds
    const correctCount = newScores.filter(Boolean).length;
    const passed = correctCount / newScores.length >= 0.7;

    const completedRound: CompletedRound = {
      skillSeq: currentSkill.sequenceOrder,
      skillName: currentSkill.name,
      phase: currentSkill.phase,
      correct: correctCount,
      total: newScores.length,
      passed,
    };

    let newLo = lo;
    let newHi = hi;

    if (passed) {
      newLo = currentSkill.sequenceOrder + 1; // mastered this level → search higher
    } else {
      newHi = currentSkill.sequenceOrder;     // can't do this → search lower or here
    }

    setRounds((prev) => [...prev, completedRound]);
    setLo(newLo);
    setHi(newHi);
    setWordIndex(0);
    setCurrentScores([]);

    if (newLo >= newHi) {
      setStage("results");
    }
  };

  const handleApply = () => {
    const seq = Math.max(1, Math.min(recommendedSeq, 48));
    startTransition(async () => {
      await applyPlacementResult(seq, childId);
      setApplied(true);
      setTimeout(() => router.push("/phonics"), 1500);
    });
  };

  if (stage === "intro") {
    return <IntroScreen onStart={() => setStage("testing")} />;
  }

  if (stage === "results") {
    return (
      <ResultsScreen
        recommendedSeq={recommendedSeq}
        recommendedSkill={recommendedSkill}
        rounds={rounds}
        onApply={handleApply}
        isApplying={isPending}
        applied={applied}
      />
    );
  }

  // Testing — guard against empty word list
  if (!currentWord) {
    // Skip this skill automatically (treat as passed — move search up)
    const newLo = currentSkill.sequenceOrder + 1;
    setLo(newLo);
    setWordIndex(0);
    setCurrentScores([]);
    if (newLo >= hi) setStage("results");
    return null;
  }

  return (
    <WordCard
      word={currentWord}
      wordIndex={wordIndex}
      totalWords={currentWords.length}
      skillName={currentSkill.name}
      phase={currentSkill.phase}
      roundNum={rounds.length + 1}
      onScore={handleScore}
    />
  );
}
