export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { getSkillById, getResources } from "@/lib/actions";
import { Badge } from "@/components/ui/badge";
import WordPracticeSection from "./word-practice-section";

// ─── Phoneme visual data ──────────────────────────────────────────────────────
// Each skill gets: letters shown large, sound notation, emoji anchor, keyword,
// hero background colour classes, and an optional highlight regex string for
// colouring the target pattern inside word-list chips.
const PHONEME_VISUAL: Record<number, {
  letters: string;
  sound: string;
  emoji: string;
  keyword: string;
  heroBg: string;
  heroText: string;
  highlight?: string; // regex alternation string, e.g. "sh" or "ai|ay"
}> = {
  // Phase 1 – CVC & sight words
  1:  { letters: "a",       sound: "/a/",   emoji: "🍎", keyword: "apple",    heroBg: "bg-red-50",     heroText: "text-red-600",    highlight: "a" },
  2:  { letters: "i",       sound: "/i/",   emoji: "🦔", keyword: "itch",     heroBg: "bg-yellow-50",  heroText: "text-yellow-600", highlight: "i" },
  3:  { letters: "o",       sound: "/o/",   emoji: "🐙", keyword: "octopus",  heroBg: "bg-orange-50",  heroText: "text-orange-600", highlight: "o" },
  4:  { letters: "u",       sound: "/u/",   emoji: "☂️",  keyword: "umbrella", heroBg: "bg-purple-50",  heroText: "text-purple-600", highlight: "u" },
  5:  { letters: "e",       sound: "/e/",   emoji: "🥚", keyword: "egg",      heroBg: "bg-green-50",   heroText: "text-green-700",  highlight: "e" },
  6:  { letters: "a i o u e", sound: "short vowels", emoji: "🎯", keyword: "review", heroBg: "bg-blue-50", heroText: "text-blue-700" },
  7:  { letters: "abc…",    sound: "sentences", emoji: "📖", keyword: "reading", heroBg: "bg-indigo-50", heroText: "text-indigo-700" },
  8:  { letters: "sight",   sound: "words", emoji: "👁️",  keyword: "the, a, is", heroBg: "bg-slate-50", heroText: "text-slate-700" },
  9:  { letters: "sight",   sound: "words", emoji: "🔤", keyword: "said, was", heroBg: "bg-slate-50",   heroText: "text-slate-700" },
  // Phase 2 – Digraphs & Blends
  10: { letters: "sh",      sound: "/sh/",  emoji: "🤫", keyword: "shush",    heroBg: "bg-violet-50",  heroText: "text-violet-700", highlight: "sh" },
  11: { letters: "ch",      sound: "/ch/",  emoji: "🧀", keyword: "cheese",   heroBg: "bg-amber-50",   heroText: "text-amber-700",  highlight: "ch" },
  12: { letters: "th",      sound: "/th/",  emoji: "🤔", keyword: "think",    heroBg: "bg-teal-50",    heroText: "text-teal-700",   highlight: "th" },
  13: { letters: "wh",      sound: "/w/",   emoji: "🐳", keyword: "whale",    heroBg: "bg-cyan-50",    heroText: "text-cyan-700",   highlight: "wh" },
  14: { letters: "ck",      sound: "/k/",   emoji: "🦆", keyword: "duck",     heroBg: "bg-sky-50",     heroText: "text-sky-700",    highlight: "ck" },
  15: { letters: "bl cl fl gl pl sl", sound: "L-blends", emoji: "🔵", keyword: "blue", heroBg: "bg-blue-50", heroText: "text-blue-700" },
  16: { letters: "br cr dr fr gr tr", sound: "R-blends", emoji: "🐸", keyword: "frog", heroBg: "bg-emerald-50", heroText: "text-emerald-700" },
  17: { letters: "st sp sn sm sc sk sw", sound: "S-blends", emoji: "⭐", keyword: "stop", heroBg: "bg-yellow-50", heroText: "text-yellow-700" },
  18: { letters: "-nd -nk -nt -mp -st", sound: "final blends", emoji: "🏖️", keyword: "sand", heroBg: "bg-orange-50", heroText: "text-orange-700" },
  19: { letters: "blends+",  sound: "complex blends", emoji: "🔗", keyword: "crisp", heroBg: "bg-rose-50", heroText: "text-rose-700" },
  20: { letters: "sight",   sound: "words", emoji: "📝", keyword: "have, come", heroBg: "bg-slate-50", heroText: "text-slate-700" },
  // Phase 3 – Long vowels & vowel teams
  21: { letters: "a_e",     sound: "/eɪ/",  emoji: "🎂", keyword: "cake",     heroBg: "bg-pink-50",    heroText: "text-pink-700" },
  22: { letters: "i_e",     sound: "/aɪ/",  emoji: "🪁", keyword: "kite",     heroBg: "bg-indigo-50",  heroText: "text-indigo-700" },
  23: { letters: "o_e",     sound: "/oʊ/",  emoji: "🏠", keyword: "home",     heroBg: "bg-emerald-50", heroText: "text-emerald-700" },
  24: { letters: "u_e",     sound: "/juː/", emoji: "🎲", keyword: "cube",     heroBg: "bg-purple-50",  heroText: "text-purple-700" },
  25: { letters: "ee",      sound: "/iː/",  emoji: "🦶", keyword: "feet",     heroBg: "bg-lime-50",    heroText: "text-lime-700",   highlight: "ee" },
  26: { letters: "ea",      sound: "/iː/",  emoji: "🌿", keyword: "leaf",     heroBg: "bg-green-50",   heroText: "text-green-700",  highlight: "ea" },
  27: { letters: "ai  ay",  sound: "/eɪ/",  emoji: "🌧️", keyword: "rain",     heroBg: "bg-blue-50",    heroText: "text-blue-700",   highlight: "ai|ay" },
  28: { letters: "oa  ow",  sound: "/oʊ/",  emoji: "⛵", keyword: "boat",     heroBg: "bg-sky-50",     heroText: "text-sky-700",    highlight: "oa|ow" },
  29: { letters: "oo",      sound: "/uː/",  emoji: "🌙", keyword: "moon",     heroBg: "bg-violet-50",  heroText: "text-violet-700", highlight: "oo" },
  30: { letters: "ar",      sound: "/ɑr/",  emoji: "🚗", keyword: "car",      heroBg: "bg-red-50",     heroText: "text-red-700",    highlight: "ar" },
  31: { letters: "or",      sound: "/ɔr/",  emoji: "🌽", keyword: "corn",     heroBg: "bg-amber-50",   heroText: "text-amber-700",  highlight: "or" },
  32: { letters: "er ir ur", sound: "/ɜr/", emoji: "🐦", keyword: "bird",     heroBg: "bg-teal-50",    heroText: "text-teal-700",   highlight: "er|ir|ur" },
  // Phase 4 – Advanced patterns
  33: { letters: "oi  oy",  sound: "/ɔɪ/",  emoji: "🛢️", keyword: "oil",      heroBg: "bg-yellow-50",  heroText: "text-yellow-700", highlight: "oi|oy" },
  34: { letters: "ou  ow",  sound: "/aʊ/",  emoji: "☁️", keyword: "cloud",    heroBg: "bg-slate-50",   heroText: "text-slate-700",  highlight: "ou|ow" },
  35: { letters: "oo",      sound: "/ʊ/",   emoji: "📚", keyword: "book",     heroBg: "bg-orange-50",  heroText: "text-orange-700", highlight: "oo" },
  36: { letters: "au  aw",  sound: "/ɔː/",  emoji: "🦀", keyword: "claw",     heroBg: "bg-amber-50",   heroText: "text-amber-700",  highlight: "au|aw" },
  37: { letters: "c  g",    sound: "/s/ /dʒ/", emoji: "🏙️", keyword: "city",  heroBg: "bg-gray-50",    heroText: "text-gray-700" },
  38: { letters: "VC·CV",   sound: "closed syllable", emoji: "🐇", keyword: "rabbit", heroBg: "bg-rose-50", heroText: "text-rose-700" },
  39: { letters: "V·CV",    sound: "open syllable", emoji: "🎵", keyword: "music", heroBg: "bg-indigo-50", heroText: "text-indigo-700" },
  40: { letters: "VCe",     sound: "in long words", emoji: "👗", keyword: "costume", heroBg: "bg-pink-50", heroText: "text-pink-700" },
  41: { letters: "vowel teams+", sound: "in syllables", emoji: "🎈", keyword: "explain", heroBg: "bg-sky-50", heroText: "text-sky-700" },
  42: { letters: "r-controlled+", sound: "in syllables", emoji: "👨‍🌾", keyword: "farmer", heroBg: "bg-green-50", heroText: "text-green-700" },
  43: { letters: "un-",     sound: "prefix",  emoji: "🔓", keyword: "unlock",  heroBg: "bg-blue-50",    heroText: "text-blue-700",   highlight: "^un" },
  44: { letters: "re-",     sound: "prefix",  emoji: "🔄", keyword: "redo",    heroBg: "bg-cyan-50",    heroText: "text-cyan-700",   highlight: "^re" },
  45: { letters: "-ing",    sound: "suffix",  emoji: "🏃", keyword: "running", heroBg: "bg-emerald-50", heroText: "text-emerald-700",highlight: "ing$" },
  46: { letters: "-ed",     sound: "suffix",  emoji: "⬆️", keyword: "jumped",  heroBg: "bg-violet-50",  heroText: "text-violet-700", highlight: "ed$" },
  47: { letters: "-ful -ly -tion", sound: "suffixes", emoji: "🌟", keyword: "helpful", heroBg: "bg-amber-50", heroText: "text-amber-700" },
  48: { letters: "pre·fix·suf·fix", sound: "big words", emoji: "🦋", keyword: "butterfly", heroBg: "bg-rose-50", heroText: "text-rose-700" },
};

// ─── Types ────────────────────────────────────────────────────────────────────
const PHASE_LABELS: Record<number, string> = {
  1: "Phase 1 — Foundation (Months 1–3)",
  2: "Phase 2 — Consolidation (Months 4–6)",
  3: "Phase 3 — Expansion (Months 7–9)",
  4: "Phase 4 — Independence (Months 10–12)",
};

const STATUS_STYLES: Record<string, string> = {
  not_started: "outline",
  in_progress: "default",
  mastered: "secondary",
} as const;

const STATUS_LABELS: Record<string, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  mastered: "Mastered ✓",
};

// ─── Page ─────────────────────────────────────────────────────────────────────
type Props = { params: Promise<{ id: string }> };

export default async function LessonPage({ params }: Props) {
  const { id } = await params;
  const skill = await getSkillById(parseInt(id, 10));
  if (!skill) notFound();

  const matchingResources = await getResources(skill.sequenceOrder, skill.sequenceOrder);

  const wordList = skill.wordList ? skill.wordList.split(",").map((w) => w.trim()) : [];
  const dictationWords = skill.dictationWords
    ? skill.dictationWords.split(",").map((w) => w.trim())
    : [];
  const examples = skill.examples ? skill.examples.split(",").map((w) => w.trim()) : [];

  const visual = PHONEME_VISUAL[skill.sequenceOrder];

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-8">
      {/* Back nav */}
      <Link href="/phonics" className="text-sm text-indigo-600 hover:underline">
        ← Back to Phonics Map
      </Link>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-gray-400 text-sm">Skill #{skill.sequenceOrder}</span>
          <Badge variant={STATUS_STYLES[skill.status] as "default" | "secondary" | "outline"}>
            {STATUS_LABELS[skill.status]}
          </Badge>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{skill.name}</h1>
        <p className="text-sm text-gray-500 mt-1">{PHASE_LABELS[skill.phase]}</p>
      </div>

      {/* ── Hero phoneme card ─────────────────────────────────── */}
      {visual && (
        <div className={`rounded-2xl border-2 ${visual.heroBg} p-6 flex items-center gap-6`}>
          {/* Emoji anchor */}
          <div className="text-6xl leading-none shrink-0 select-none" aria-hidden="true">
            {visual.emoji}
          </div>

          {/* Letter(s) + sound + keyword */}
          <div className="min-w-0">
            <div className={`font-black leading-none tracking-tight mb-1 ${visual.heroText}`}
              style={{ fontSize: "clamp(2.5rem, 10vw, 4rem)" }}>
              {visual.letters}
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="font-mono text-sm bg-white/80 rounded-full px-2.5 py-0.5 text-gray-700 border">
                {visual.sound}
              </span>
              <span className="text-sm text-gray-600 font-medium">
                as in <span className="font-bold">&ldquo;{visual.keyword}&rdquo;</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Unified interactive section: examples, lesson plan, word modal */}
      <WordPracticeSection
        examples={examples}
        wordList={wordList}
        dictationWords={dictationWords}
        highlight={visual?.highlight}
        heroBg={visual?.heroBg ?? "bg-gray-50"}
        heroText={visual?.heroText ?? "text-gray-700"}
        skillId={skill.id}
        skillStatus={skill.status}
        warmup={skill.warmup}
        introduction={skill.introduction}
      />

      {/* Tips for parents */}
      {skill.tipsForParents && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg" aria-hidden="true">💛</span>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-700">
              Parent Notes
            </h3>
          </div>
          <p className="text-sm text-amber-900 leading-relaxed pl-7">{skill.tipsForParents}</p>
        </div>
      )}

      {/* Related resources */}
      {matchingResources.length > 0 && (
        <div>
          <h2 className="font-semibold text-gray-900 mb-3">📎 Matching Books &amp; Resources</h2>
          <div className="space-y-2">
            {matchingResources.map((r) => (
              <a
                key={r.id}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg border border-gray-200 bg-white p-3 hover:border-indigo-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{r.name}</p>
                    {r.description && (
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{r.description}</p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Badge variant="outline" className="text-xs capitalize">
                      {r.type}
                    </Badge>
                    {r.isFree === 1 && (
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                        Free
                      </Badge>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 text-sm text-gray-600">
        <strong>After word practice:</strong> Read a decodable book that matches this skill level.
        Aim for 95%+ accuracy. End with: &quot;What was that about? What was your favourite part?&quot;
      </div>
    </div>
  );
}
