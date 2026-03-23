# Phonics UX Improvements — Design Spec

**Date:** 2026-03-23
**Status:** Approved

---

## Overview

Four distinct improvements to the reading-tracker app:

1. Hover states on interactive word chips
2. "Select a word to start" hint text on the phonics lesson page
3. Clear child data with a checklist confirmation dialog
4. Interactive child-facing assessments for WPM, Letter Sounds, and Sight Words

---

## 1. Word Chip Hover States

**Files affected:** `src/app/phonics/[id]/word-practice-section.tsx`

### Current state
`InteractiveWordChip` and `InteractiveDictationCard` have `active:scale-95 transition-transform cursor-pointer` but no hover feedback.

### Change
Add a combined lift + fill hover effect to both components:
- `hover:-translate-y-0.5` — slight upward lift
- `hover:shadow-md hover:shadow-indigo-100` — soft indigo drop shadow
- `hover:bg-indigo-50` — indigo tint fill
- `hover:border-indigo-400` — stronger border
- `hover:font-semibold` — slight weight boost
- Extend `transition-transform` → `transition-all duration-150` for smooth all-property animation

The hover styles apply unconditionally. Existing status colour classes (green/red backgrounds) have higher specificity via the conditional className logic and will override the hover background on already-marked chips.

---

## 2. "Select a Word to Start" Hint Text

**Files affected:** `src/app/phonics/[id]/word-practice-section.tsx`

### Placement
Two locations within `WordPracticeSection`:

1. **Above the example words block** — immediately before the `flex flex-wrap gap-2` div that renders `exampleEntries`
2. **Inside each minutes section** — below the `h3` heading and above the word chip container, for both "Minutes 9–12 · Practice Word List" and "Minutes 13–15 · Dictation"

### Style
```
text-xs text-indigo-400 italic mb-2
```
Text: `"Select a word to start"`

---

## 3. Clear Child Data

**Files affected:**
- `src/app/children/page.tsx`
- `src/lib/actions.ts`

### Server action
New action `clearChildData(childId, options)`:

```ts
options: {
  progress: boolean;    // childSkillProgress rows
  sessions: boolean;    // sessions rows
  assessments: boolean; // assessments rows
  books: boolean;       // books rows
}
```

Deletes matching rows for `childId` based on which options are `true`. Revalidates `/`, `revalidatePath("/phonics", "layout")` (covers all `/phonics/[id]` pages), `/assessments`, `/sessions`, `/books`.

### UI — confirmation dialog
In the "My Children" list, each child row gets a "Reset" button (small, destructive outline style: `variant="outline"`, red text/border).

Clicking opens a shadcn `Dialog` containing:

1. **Header** — warning icon + "Reset data for {name}" + "This cannot be undone"
2. **Checklist** (4 items, Phonics progress pre-checked, rest unchecked):
   - Phonics progress — "All skill statuses reset to not started"
   - Session history — "All logged reading sessions deleted"
   - Assessments — "All WPM, sounds, sight word results deleted"
   - Books — "All logged books deleted"
3. **Confirm input** — "Type `{name}` to confirm" — the hint shows the exact stored name string as-is (e.g. if stored as "Emma", hint shows "Emma"). Comparison is an exact string match against the stored name (case-sensitive, byte-for-byte).
4. **Actions** — Cancel + "Clear selected"

**"Clear selected" is disabled unless BOTH conditions are true:**
- At least one checkbox is checked
- The text input matches the stored child name exactly

---

## 4. Interactive Assessments

**Files affected:**
- `src/app/assessments/page.tsx`
- `src/app/assessments/assessment-form.tsx` — remove or repurpose
- New: `src/app/assessments/assessment-runner.tsx`
- `src/lib/actions.ts` — new `deleteAssessment` action

### Entry point change
Replace the "Log New Assessment" section (currently renders `AssessmentForm`) with 4 tappable type cards in a grid:

| Card | Action on click |
|------|-----------------|
| Words Per Minute | Opens WPM runner modal |
| Letter Sounds Known | Opens Sounds runner modal |
| Sight Words Known | Opens Sight Words runner modal |
| Words Decoded (CVC) | Expands an inline number entry form (same fields as current `AssessmentForm` scoped to `words_decoded` type) |

The Words Decoded card is new UI wrapping the existing number entry behaviour. The other three open the `AssessmentRunner` modal.

### `AssessmentRunner` component
A full-screen modal overlay (`fixed inset-0 z-50 bg-white`) with three modes: `wpm`, `sounds`, `sightwords`. Shared state machine: `idle → active → results`.

**Shared UI patterns:**
- Cancel button (top-right corner) during `active` state
  - If no progress yet (0 items completed / timer not started): cancels immediately, no confirm
  - If progress > 0 (at least one Next tap for WPM, or at least one ✓/✗ tap for Sounds/Sight Words): shows inline "Discard progress?" confirm before closing. **For WPM, the countdown timer pauses while this confirmation is shown.**
- Progress bar + counter (X of Y) during `active` state
- Results screen: score headline, scrollable pill grid (green ✓ / red ✗ per item — see per-mode details), Try Again + Save buttons (equal width, side by side)
- Try Again resets to `active` state with reshuffled list
- Save calls `createAssessment()` then closes the modal
- Responsive: full-screen on mobile; max-width centred card on desktop (e.g. `max-w-lg mx-auto`)

#### WPM mode
- Word list: built-in array of ~80 grade-1 decodable words, shuffled on each run (and re-shuffled on Try Again)
- Duration: 60-second countdown, resets to 60s on Try Again
- Active UI: large word (font-mono, ~text-5xl), countdown timer (red when ≤10s), progress bar, Next button (full width, primary), "Finish early" link/button below Next (small, secondary style)
  - "Finish early" transitions immediately to results with words-read count at that moment — no separate confirmation required (the final count is visible, so accidental taps are self-correcting via Try Again)
- Auto-finishes at 0:00
- **Results screen for WPM does NOT show a per-word pill grid.** It shows: large WPM number, "X words in 60 seconds", and the Grade 1 benchmark band (Early / Building / Good / On Grade based on existing thresholds). No per-word breakdown.
- Save value: words read count (integer), type = `wcpm`

#### Letter Sounds mode
- Item list: 26 letters a–z, shuffled per run
- Active UI: large letter (font-mono, ~text-7xl), ✗ / ✓ buttons (equal width, full row)
- Tapping either button records the result and advances to next letter automatically
- Results screen: score headline (X / 26), pill grid showing each letter with ✓ or ✗
- Save value: count of ✓ responses (integer), type = `sounds_known`

#### Sight Words mode
- Item list: Dolch pre-primer list (~40 words), shuffled per run
- Each word has an emoji anchor. The implementer should create a full mapping for all ~40 Dolch pre-primer words using contextually relevant emojis (e.g. `the → 🌊`, `a → 🍎`, `and → 🤝`, `to → 👉`, `in → 📦`, `is → ❓`, `you → 👤`, `it → 💡`, `of → 📄`, `up → ⬆️`). Cover all words in the list.
- Active UI: emoji (~text-5xl), word in serif font below (~text-5xl), ✗ / ✓ buttons
- Tapping either button records and advances automatically
- Results screen: score headline (X / total), pill grid showing each word with ✓ or ✗
- Save value: count of ✓ responses (integer), type = `sight_words`

### Delete assessment entries
In the assessment history section, each entry row gets a small trash icon button. Clicking reveals an inline confirmation row ("Delete this entry? Confirm / Cancel"). Confirmed: calls `deleteAssessment(id, childId)`.

```ts
export async function deleteAssessment(id: number, childId: string) {
  // childId guard ensures a caller cannot delete another family's data
  await getDb()
    .delete(assessments)
    .where(and(eq(assessments.id, id), eq(assessments.childId, childId)));
  revalidatePath("/assessments");
  revalidatePath("/");
}
```

---

## Data model

No schema changes required. All new data flows through existing `assessments` table using existing `createAssessment()` action. The `deleteAssessment` action uses the existing `id` primary key with a `childId` ownership guard.

---

## Out of scope

- Words Decoded assessment runner (stays as manual number entry)
- Editing existing assessment values
- Child profile rename
- Any changes to the phonics map or placement test
