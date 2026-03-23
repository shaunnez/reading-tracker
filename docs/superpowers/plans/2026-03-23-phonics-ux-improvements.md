# Phonics UX Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add word chip hover states, instructional hint text, a clear-child-data dialog, and three interactive child-facing assessment runners (WPM, Letter Sounds, Sight Words).

**Architecture:** Tasks 1–2 are pure UI tweaks to an existing client component. Tasks 3–4 add a new server action plus a confirmation dialog to the children page. Tasks 5–8 introduce a standalone `AssessmentRunner` modal component driven by a data file, wired into the existing assessments page. No schema changes are required.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5, Tailwind CSS 4, Drizzle ORM, shadcn/ui primitives (`Button`, `Input`, `Card`), Lucide React icons. No test framework is set up — verification uses `npx tsc --noEmit` and `npm run build`.

> **Important (per AGENTS.md):** Before writing any Next.js code, read the relevant guide in `node_modules/next/dist/docs/` (e.g. `01-app/` for App Router conventions). Heed any deprecation notices found there.

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `src/app/phonics/[id]/word-practice-section.tsx` | Modify | Hover styles + hint text |
| `src/lib/actions.ts` | Modify | Add `clearChildData` and `deleteAssessment` actions |
| `src/app/children/page.tsx` | Modify | Add Reset button + clear dialog |
| `src/app/assessments/assessment-data.ts` | Create | Word lists, letter list, sight word emoji map |
| `src/app/assessments/assessment-runner.tsx` | Create | Full-screen interactive assessment modal |
| `src/app/assessments/page.tsx` | Modify | Replace form with 4 type cards; add delete buttons to history |

---

## Task 1: Word Chip Hover States + Hint Text

**Files:**
- Modify: `src/app/phonics/[id]/word-practice-section.tsx`

### Context
`InteractiveWordChip` at line 43 and `InteractiveDictationCard` at line 84 currently have `transition-transform` only. The hint text needs to appear in 3 places: above example words (line 254), above the word list chips (line 304), and above the dictation cards (line 329).

- [ ] **Step 1: Update `InteractiveWordChip` hover classes**

In `InteractiveWordChip`, change the `className` on the `<button>` from:
```
active:scale-95 transition-transform cursor-pointer
```
to:
```
active:scale-95 transition-all duration-150 cursor-pointer
hover:-translate-y-0.5 hover:shadow-md hover:shadow-indigo-100
hover:bg-indigo-50 hover:border-indigo-400 hover:font-semibold
```

The existing conditional background classes (green/red for complete/incomplete) sit inside the template literal at higher specificity and will correctly override the hover background on marked chips.

- [ ] **Step 2: Update `InteractiveDictationCard` hover classes**

Same change to the `<button>` in `InteractiveDictationCard` (line 84). Change:
```
active:scale-95 transition-transform cursor-pointer
```
to:
```
active:scale-95 transition-all duration-150 cursor-pointer
hover:-translate-y-0.5 hover:shadow-md hover:shadow-indigo-100
hover:bg-indigo-50 hover:border-indigo-400 hover:font-semibold
```

- [ ] **Step 3: Add hint text above example words**

Find the block starting at line ~253:
```tsx
{exampleEntries.length > 0 && (
  <div className="flex flex-wrap gap-2">
```

Add the hint immediately before the `<div className="flex flex-wrap gap-2">`:
```tsx
{exampleEntries.length > 0 && (
  <>
    <p className="text-xs text-indigo-400 italic mb-1">Select a word to start</p>
    <div className="flex flex-wrap gap-2">
```

Close the fragment after the closing `</div>`. (The outer `&&` block already wraps everything.)

- [ ] **Step 4: Add hint text inside the Practice Word List section**

Find the section at line ~296 that renders `wordListEntries`. It looks like:
```tsx
<div className="flex flex-wrap gap-2 pl-7">
  {wordListEntries.map(...)}
</div>
```

Add hint text immediately before that `<div>`:
```tsx
<p className="text-xs text-indigo-400 italic mb-1 pl-7">Select a word to start</p>
<div className="flex flex-wrap gap-2 pl-7">
```

- [ ] **Step 5: Add hint text inside the Dictation section**

Find the dictation section at line ~327. It looks like:
```tsx
<div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pl-7">
  {dictationEntries.map(...)}
</div>
```

Add hint text immediately before that `<div>`:
```tsx
<p className="text-xs text-indigo-400 italic mb-1 pl-7">Select a word to start</p>
<div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pl-7">
```

- [ ] **Step 6: Type-check**

```bash
cd /Users/shaunnesbitt/reading-tracker && npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/app/phonics/[id]/word-practice-section.tsx
git commit -m "feat: add hover states and hint text to phonics word chips"
```

---

## Task 2: `clearChildData` Server Action

**Files:**
- Modify: `src/lib/actions.ts`

### Context
`actions.ts` already imports `children`, `childSkillProgress`, `sessions`, `books`, `assessments` from the schema and uses `eq`, `and` from drizzle-orm. No new imports needed.

- [ ] **Step 1: Add the action**

Append to `src/lib/actions.ts` after the existing `setActiveChild` function:

```ts
export async function clearChildData(
  childId: string,
  options: {
    progress: boolean;
    sessions: boolean;
    assessments: boolean;
    books: boolean;
  }
) {
  const db = getDb();
  if (options.progress) {
    await db.delete(childSkillProgress).where(eq(childSkillProgress.childId, childId));
  }
  if (options.sessions) {
    await db.delete(sessions).where(eq(sessions.childId, childId));
  }
  if (options.assessments) {
    await db.delete(assessments).where(eq(assessments.childId, childId));
  }
  if (options.books) {
    await db.delete(books).where(eq(books.childId, childId));
  }
  revalidatePath("/", "layout");
  revalidatePath("/phonics", "layout");
  revalidatePath("/assessments");
  revalidatePath("/sessions");
  revalidatePath("/books");
}
```

- [ ] **Step 2: Add `deleteAssessment` action**

Append immediately after `clearChildData`:

```ts
export async function deleteAssessment(id: number, childId: string) {
  await getDb()
    .delete(assessments)
    .where(and(eq(assessments.id, id), eq(assessments.childId, childId)));
  revalidatePath("/assessments");
  revalidatePath("/");
}
```

- [ ] **Step 3: Type-check**

```bash
cd /Users/shaunnesbitt/reading-tracker && npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/actions.ts
git commit -m "feat: add clearChildData and deleteAssessment server actions"
```

---

## Task 3: Clear Child Dialog UI

**Files:**
- Modify: `src/app/children/page.tsx`

### Context
`children/page.tsx` is a client component. It uses `useState`, shadcn `Button`/`Input`/`Card` components, and calls server actions. There is no shadcn Dialog component installed — the confirmation dialog will be implemented as a custom fixed-overlay modal (no new dependencies needed).

- [ ] **Step 1: Add imports and state**

At the top of `children/page.tsx`, add to the existing imports:
```tsx
import { clearChildData } from "@/lib/actions";
import { Trash2 } from "lucide-react";
```

Inside `ChildrenPage`, add new state variables alongside the existing ones:
```tsx
const [clearTarget, setClearTarget] = useState<ChildEntry | null>(null);
const [clearOpts, setClearOpts] = useState({
  progress: true,
  sessions: false,
  assessments: false,
  books: false,
});
const [clearConfirmName, setClearConfirmName] = useState("");
const [clearLoading, setClearLoading] = useState(false);
```

- [ ] **Step 2: Add `handleClear` function**

Add after `handleCopy`:
```tsx
async function handleClear() {
  if (!clearTarget) return;
  if (clearConfirmName !== clearTarget.name) return;
  const anyChecked = Object.values(clearOpts).some(Boolean);
  if (!anyChecked) return;
  setClearLoading(true);
  try {
    await clearChildData(clearTarget.id, clearOpts);
    setClearTarget(null);
    setClearConfirmName("");
    setClearOpts({ progress: true, sessions: false, assessments: false, books: false });
    router.refresh();
  } finally {
    setClearLoading(false);
  }
}
```

- [ ] **Step 3: Add Reset button to each child row**

In the child row `<div className="flex gap-2 shrink-0">` (currently has Copy code + Switch), add a Reset button before them:
```tsx
<Button
  variant="outline"
  size="sm"
  className="text-red-600 border-red-200 hover:bg-red-50"
  onClick={() => {
    setClearTarget(child);
    setClearConfirmName("");
    setClearOpts({ progress: true, sessions: false, assessments: false, books: false });
  }}
>
  <Trash2 className="size-3 mr-1" /> Reset
</Button>
```

- [ ] **Step 4: Add the confirmation dialog**

Add at the bottom of the returned JSX, just before the closing `</div>` of the root element:

```tsx
{clearTarget && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border-2 border-red-200 overflow-hidden">
      {/* Header */}
      <div className="bg-red-50 px-5 py-4 border-b border-red-100 flex items-center gap-3">
        <span className="text-2xl">⚠️</span>
        <div>
          <p className="font-bold text-red-900">Reset data for {clearTarget.name}</p>
          <p className="text-xs text-red-600">This cannot be undone</p>
        </div>
      </div>

      {/* Checklist */}
      <div className="px-5 py-4 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">Select what to clear</p>

        {(
          [
            { key: "progress", label: "Phonics progress", desc: "All skill statuses reset to not started" },
            { key: "sessions", label: "Session history", desc: "All logged reading sessions deleted" },
            { key: "assessments", label: "Assessments", desc: "All WPM, sounds, sight word results deleted" },
            { key: "books", label: "Books", desc: "All logged books deleted" },
          ] as const
        ).map(({ key, label, desc }) => (
          <label
            key={key}
            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
              clearOpts[key] ? "border-red-300 bg-red-50/50" : "border-gray-200"
            }`}
          >
            <input
              type="checkbox"
              checked={clearOpts[key]}
              onChange={(e) => setClearOpts((prev) => ({ ...prev, [key]: e.target.checked }))}
              className="size-4 accent-red-500"
            />
            <div>
              <p className="text-sm font-semibold text-gray-900">{label}</p>
              <p className="text-xs text-gray-400">{desc}</p>
            </div>
          </label>
        ))}

        {/* Name confirmation */}
        <div className="pt-2">
          <p className="text-xs text-gray-500 mb-1.5">
            Type <span className="font-bold text-red-700">{clearTarget.name}</span> to confirm
          </p>
          <Input
            value={clearConfirmName}
            onChange={(e) => setClearConfirmName(e.target.value)}
            placeholder="Type child's name…"
            className="border-red-200 focus-visible:ring-red-400"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 pb-5 flex gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => {
            setClearTarget(null);
            setClearConfirmName("");
          }}
        >
          Cancel
        </Button>
        <Button
          className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          disabled={
            clearConfirmName !== clearTarget.name ||
            !Object.values(clearOpts).some(Boolean) ||
            clearLoading
          }
          onClick={handleClear}
        >
          {clearLoading ? "Clearing…" : "Clear selected"}
        </Button>
      </div>
    </div>
  </div>
)}
```

- [ ] **Step 5: Type-check**

```bash
cd /Users/shaunnesbitt/reading-tracker && npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/app/children/page.tsx
git commit -m "feat: add clear child data dialog with checklist confirmation"
```

---

## Task 4: Assessment Data File

**Files:**
- Create: `src/app/assessments/assessment-data.ts`

### Context
This file contains all static data for the three runners so the component stays clean. No imports from Next.js or React needed — pure TypeScript.

- [ ] **Step 1: Create the file**

Create `src/app/assessments/assessment-data.ts`:

```ts
// ─── WPM word list (~80 grade-1 decodable words) ──────────────────────────────
export const WPM_WORDS: string[] = [
  "cat", "dog", "run", "fun", "big", "red", "bed", "ten", "hen", "pen",
  "sit", "bit", "hit", "fit", "pit", "hop", "mop", "top", "log", "fog",
  "bun", "sun", "gun", "mud", "bud", "dug", "tug", "jug", "rug", "bug",
  "shop", "chip", "ship", "chin", "thin", "this", "that", "with", "rich", "much",
  "back", "duck", "kick", "lock", "neck", "rock", "sick", "sock", "tick", "tuck",
  "flag", "plan", "clap", "slip", "drip", "drop", "frog", "grip", "trip", "trap",
  "sand", "band", "hand", "lamp", "camp", "damp", "mint", "hint", "dent", "rent",
  "cake", "lake", "made", "name", "tape", "kite", "mine", "pine", "vine", "home",
];

// ─── Letter sounds list ────────────────────────────────────────────────────────
export const LETTER_SOUNDS: string[] = [
  "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m",
  "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
];

// ─── Dolch pre-primer sight words with emoji anchors ──────────────────────────
export const SIGHT_WORDS: { word: string; emoji: string }[] = [
  { word: "a",     emoji: "🍎" },
  { word: "and",   emoji: "🤝" },
  { word: "away",  emoji: "👋" },
  { word: "big",   emoji: "🐘" },
  { word: "blue",  emoji: "🫐" },
  { word: "can",   emoji: "🥫" },
  { word: "come",  emoji: "👉" },
  { word: "down",  emoji: "⬇️" },
  { word: "find",  emoji: "🔍" },
  { word: "for",   emoji: "🎁" },
  { word: "funny", emoji: "😄" },
  { word: "go",    emoji: "🚦" },
  { word: "help",  emoji: "🆘" },
  { word: "here",  emoji: "📍" },
  { word: "I",     emoji: "👤" },
  { word: "in",    emoji: "📦" },
  { word: "is",    emoji: "❓" },
  { word: "it",    emoji: "💡" },
  { word: "jump",  emoji: "🐸" },
  { word: "little",emoji: "🐭" },
  { word: "look",  emoji: "👀" },
  { word: "make",  emoji: "🔨" },
  { word: "me",    emoji: "🙋" },
  { word: "my",    emoji: "🙌" },
  { word: "not",   emoji: "🚫" },
  { word: "one",   emoji: "1️⃣" },
  { word: "play",  emoji: "🎮" },
  { word: "red",   emoji: "🔴" },
  { word: "run",   emoji: "🏃" },
  { word: "said",  emoji: "💬" },
  { word: "see",   emoji: "👁️" },
  { word: "the",   emoji: "🌊" },
  { word: "three", emoji: "3️⃣" },
  { word: "to",    emoji: "👉" },
  { word: "two",   emoji: "2️⃣" },
  { word: "up",    emoji: "⬆️" },
  { word: "we",    emoji: "👨‍👩‍👧" },
  { word: "where", emoji: "🗺️" },
  { word: "yellow",emoji: "🌟" },
  { word: "you",   emoji: "👆" },
];

// ─── Shuffle utility ──────────────────────────────────────────────────────────
export function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
```

- [ ] **Step 2: Type-check**

```bash
cd /Users/shaunnesbitt/reading-tracker && npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/assessments/assessment-data.ts
git commit -m "feat: add assessment data (WPM words, letters, sight words with emoji)"
```

---

## Task 5: AssessmentRunner Component

**Files:**
- Create: `src/app/assessments/assessment-runner.tsx`

### Context
This is a `"use client"` component. It renders a fixed full-screen overlay, manages a state machine (`idle | active | results | confirm-discard`), and calls `createAssessment()` on save. It imports data from `./assessment-data`. It accepts `childId` and `onClose` as props, plus a `mode` prop.

- [ ] **Step 1: Create the component skeleton and types**

Create `src/app/assessments/assessment-runner.tsx`:

```tsx
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
```

- [ ] **Step 2: Add state, shuffle logic, and WPM timer**

Inside the `AssessmentRunner` component body, add:

```tsx
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
```

- [ ] **Step 3: Add navigation and finish logic**

```tsx
  function advance(correct?: boolean) {
    // For sounds/sightwords, record result
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
    // Record words reached so far as results (each word tapped = correct)
    // results array for WPM only stores count via currentIdx
    setPhase("results");
  }

  function wpmScore(): number {
    // Words reached = currentIdx (each Next tap = one word read)
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
```

- [ ] **Step 4: Add the render method — idle screen**

```tsx
  // ─── Idle screen ────────────────────────────────────────────────────────────
  if (phase === "idle") {
    const meta = {
      wpm:       { emoji: "⏱️", title: "Words Per Minute", desc: "Read each word aloud. Tap Next to advance. 1 minute timer." },
      sounds:    { emoji: "🔤", title: "Letter Sounds",    desc: "Show each letter. Child says the sound. You mark ✓ or ✗." },
      sightwords:{ emoji: "👁️", title: "Sight Words",      desc: "Each word has a picture clue. Child reads it aloud. You mark ✓ or ✗." },
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
```

- [ ] **Step 5: Add the active screen**

```tsx
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
```

- [ ] **Step 6: Add the results screen**

```tsx
  // ─── Results screen ──────────────────────────────────────────────────────────
  const WPM_BENCHMARKS = [
    { label: "On Grade", min: 90 },
    { label: "Good", min: 60 },
    { label: "Building", min: 30 },
    { label: "Early", min: 0 },
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
```

- [ ] **Step 7: Type-check**

```bash
cd /Users/shaunnesbitt/reading-tracker && npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add src/app/assessments/assessment-runner.tsx
git commit -m "feat: add AssessmentRunner component (WPM, letter sounds, sight words)"
```

---

## Task 6: Update Assessments Page

**Files:**
- Modify: `src/app/assessments/page.tsx`

### Context
`assessments/page.tsx` is a server component (`force-dynamic`). It currently renders `<AssessmentForm childId={childId} />`. We need to:
1. Replace the "Log New Assessment" section with 4 type cards that trigger the runner (this requires a new small client wrapper component since the server component can't hold modal state)
2. Add delete buttons to history rows (also needs client interaction)

The cleanest approach: create a single `"use client"` wrapper `AssessmentPageClient` that holds all interactive state and receives assessments data as props from the server component.

- [ ] **Step 1: Create `AssessmentPageClient` component**

Create `src/app/assessments/assessment-page-client.tsx`:

```tsx
"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import AssessmentRunner, { type AssessmentMode } from "./assessment-runner";
import { createAssessment, deleteAssessment } from "@/lib/actions";
import { useRouter } from "next/navigation";

const TYPE_LABELS: Record<string, string> = {
  wcpm: "Words/Min (WPM)",
  sounds_known: "Letter Sounds Known",
  words_decoded: "Words Decoded",
  sight_words: "Sight Words Known",
};

const GRADE1_BENCHMARKS = [
  { label: "3 months", value: 30 },
  { label: "6 months", value: 70 },
  { label: "9 months", value: 85 },
  { label: "12 months", value: 90 },
];

type Assessment = {
  id: number;
  type: string;
  date: string;
  value: number;
  notes?: string | null;
};

interface Props {
  childId: string;
  grouped: Record<string, Assessment[]>;
}

const TYPE_CARDS: { mode: AssessmentMode | "manual"; label: string; emoji: string; desc: string }[] = [
  { mode: "wpm",        label: "Words Per Minute",      emoji: "⏱️", desc: "Timed 1-minute reading test" },
  { mode: "sounds",     label: "Letter Sounds Known",   emoji: "🔤", desc: "26 letters — child says the sound" },
  { mode: "sightwords", label: "Sight Words Known",     emoji: "👁️", desc: "Dolch pre-primer list with pictures" },
  { mode: "manual",     label: "Words Decoded (CVC)",   emoji: "📝", desc: "Enter score manually (out of 10)" },
];

export default function AssessmentPageClient({ childId, grouped }: Props) {
  const router = useRouter();
  const [runnerMode, setRunnerMode] = useState<AssessmentMode | null>(null);
  const [showManual, setShowManual] = useState(false);
  const [manualValue, setManualValue] = useState("");
  const [manualDate, setManualDate] = useState(new Date().toISOString().split("T")[0]);
  const [manualLoading, setManualLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [, startTransition] = useTransition();

  async function handleManualSave() {
    if (!manualValue) return;
    setManualLoading(true);
    try {
      await createAssessment({ childId, date: manualDate, type: "words_decoded", value: parseFloat(manualValue) });
      setManualValue("");
      setShowManual(false);
      router.refresh();
    } finally {
      setManualLoading(false);
    }
  }

  function handleDelete(id: number) {
    startTransition(async () => {
      await deleteAssessment(id, childId);
      setDeleteConfirm(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {/* Runner modal */}
      {runnerMode && (
        <AssessmentRunner
          mode={runnerMode}
          childId={childId}
          onClose={() => setRunnerMode(null)}
        />
      )}

      {/* Type cards */}
      <div>
        <h2 className="font-semibold text-gray-700 mb-3">Start an Assessment</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {TYPE_CARDS.map((card) => (
            <button
              key={card.mode}
              onClick={() => {
                if (card.mode === "manual") { setShowManual((v) => !v); }
                else { setRunnerMode(card.mode as AssessmentMode); }
              }}
              className="flex flex-col items-center text-center gap-2 p-4 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 active:scale-95 transition-all cursor-pointer"
            >
              <span className="text-3xl">{card.emoji}</span>
              <span className="text-xs font-semibold text-gray-800 leading-tight">{card.label}</span>
              <span className="text-xs text-gray-400 leading-tight">{card.desc}</span>
            </button>
          ))}
        </div>

        {/* Manual CVC entry */}
        {showManual && (
          <div className="mt-3 p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
            <p className="text-sm font-semibold text-gray-700">CVC Words Decoded (out of 10)</p>
            <div className="flex gap-3 items-end">
              <div className="space-y-1">
                <label className="text-xs text-gray-500">Date</label>
                <input type="date" value={manualDate} onChange={(e) => setManualDate(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-md text-sm bg-white" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-500">Score (0–10)</label>
                <input type="number" min="0" max="10" value={manualValue} onChange={(e) => setManualValue(e.target.value)}
                  placeholder="e.g. 8"
                  className="w-24 px-3 py-2 border border-gray-200 rounded-md text-sm bg-white" />
              </div>
              <Button onClick={handleManualSave} disabled={manualLoading || !manualValue} size="sm">
                {manualLoading ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Benchmarks */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Grade 1 WPM Targets</CardTitle></CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-1">
            {GRADE1_BENCHMARKS.map((b) => (
              <div key={b.label} className="flex justify-between text-sm">
                <span className="text-gray-500">{b.label}:</span>
                <span className="font-medium">{b.value}+ wpm</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* History */}
      {Object.entries(grouped).map(([type, entries]) => (
        <Card key={type}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{TYPE_LABELS[type] ?? type}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {[...entries].reverse().map((a) => (
                <div key={a.id} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0 gap-2">
                  <span className="text-sm text-gray-600">{a.date}</span>
                  <div className="flex items-center gap-2 ml-auto">
                    <span className="font-semibold text-gray-900">
                      {type === "wcpm" ? `${a.value} wpm` : a.value}
                    </span>
                    {type === "wcpm" && (
                      <Badge variant={a.value >= 30 ? "secondary" : "outline"} className="text-xs">
                        {a.value >= 90 ? "On Grade" : a.value >= 60 ? "Good" : a.value >= 30 ? "Building" : "Early"}
                      </Badge>
                    )}
                    {deleteConfirm === a.id ? (
                      <div className="flex gap-1 items-center">
                        <span className="text-xs text-gray-500">Delete?</span>
                        <button onClick={() => handleDelete(a.id)}
                          className="text-xs text-red-600 hover:underline font-medium">Confirm</button>
                        <button onClick={() => setDeleteConfirm(null)}
                          className="text-xs text-gray-400 hover:underline">Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteConfirm(a.id)}
                        className="text-gray-300 hover:text-red-400 transition-colors p-0.5">
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {Object.keys(grouped).length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-2">📊</p>
          <p>No assessments yet. Start one above.</p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Update `assessments/page.tsx` to use the new client component**

Replace the contents of `src/app/assessments/page.tsx` with:

```tsx
export const dynamic = "force-dynamic";
import { getAssessments } from "@/lib/actions";
import { getActiveChildId } from "@/lib/child-cookie";
import NoChildBanner from "@/components/no-child-banner";
import AssessmentPageClient from "./assessment-page-client";

export default async function AssessmentsPage() {
  const childId = await getActiveChildId();
  if (!childId) return <NoChildBanner />;
  const allAssessments = await getAssessments(childId);

  const grouped = allAssessments.reduce<Record<string, typeof allAssessments>>((acc, a) => {
    if (!acc[a.type]) acc[a.type] = [];
    acc[a.type].push(a);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Assessments</h1>
        <p className="text-gray-500 text-sm">Run assessments to track progress over time. Aim for monthly.</p>
      </div>
      <AssessmentPageClient childId={childId} grouped={grouped} />
    </div>
  );
}
```

- [ ] **Step 3: Type-check and build**

```bash
cd /Users/shaunnesbitt/reading-tracker && npx tsc --noEmit && npm run build
```
Expected: no type errors, build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/app/assessments/assessment-page-client.tsx src/app/assessments/page.tsx
git commit -m "feat: replace assessment form with interactive runner + delete history entries"
```

---

## Final Verification

- [ ] Run `npm run build` — must pass with no errors
- [ ] Start dev server (`npm run dev`) and manually verify:
  - [ ] Phonics lesson page: word chips lift + fill on hover, dictation cards do the same
  - [ ] Hint text "Select a word to start" appears above examples, above word list, above dictation
  - [ ] Children page: Reset button opens dialog; button disabled unless name typed + at least one box checked; clears correct data on confirm
  - [ ] Assessments page: 4 type cards shown; WPM runner starts, counts words, finishes at 0:00, saves; Cancel pauses timer and shows discard confirm; Try Again reshuffles; Letter Sounds and Sight Words ✓/✗ advance automatically; delete button inline confirm works
