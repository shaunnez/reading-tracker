export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { getSkillById, getResources } from "@/lib/actions";
import { getActiveChildId } from "@/lib/child-cookie";
import { Badge } from "@/components/ui/badge";
import WordPracticeSection from "./word-practice-section";
import NoChildBanner from "@/components/no-child-banner";

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
  // Stage 1 — m s f a p t c i
  1:  { letters: "m",              sound: "/m/",      emoji: "🦟", keyword: "mat",     heroBg: "bg-amber-50",   heroText: "text-amber-700",   highlight: "m" },
  2:  { letters: "s",              sound: "/s/",      emoji: "🐍", keyword: "sun",     heroBg: "bg-amber-50",   heroText: "text-amber-700",   highlight: "s" },
  3:  { letters: "f",              sound: "/f/",      emoji: "🐸", keyword: "fan",     heroBg: "bg-amber-50",   heroText: "text-amber-700",   highlight: "f" },
  4:  { letters: "a",              sound: "/a/",      emoji: "🍎", keyword: "ant",     heroBg: "bg-amber-50",   heroText: "text-amber-700",   highlight: "a" },
  5:  { letters: "p",              sound: "/p/",      emoji: "🐧", keyword: "pot",     heroBg: "bg-amber-50",   heroText: "text-amber-700",   highlight: "p" },
  6:  { letters: "t",              sound: "/t/",      emoji: "🐢", keyword: "tap",     heroBg: "bg-amber-50",   heroText: "text-amber-700",   highlight: "t" },
  7:  { letters: "c",              sound: "/k/",      emoji: "🐱", keyword: "cat",     heroBg: "bg-amber-50",   heroText: "text-amber-700",   highlight: "c" },
  8:  { letters: "i",              sound: "/i/",      emoji: "🦔", keyword: "it",      heroBg: "bg-amber-50",   heroText: "text-amber-700",   highlight: "i" },
  // Stage 2 — b h n o d g l v
  9:  { letters: "b",              sound: "/b/",      emoji: "🐝", keyword: "bat",     heroBg: "bg-sky-50",     heroText: "text-sky-700",     highlight: "b" },
  10: { letters: "h",              sound: "/h/",      emoji: "🏠", keyword: "hat",     heroBg: "bg-sky-50",     heroText: "text-sky-700",     highlight: "h" },
  11: { letters: "n",              sound: "/n/",      emoji: "🪺", keyword: "net",     heroBg: "bg-sky-50",     heroText: "text-sky-700",     highlight: "n" },
  12: { letters: "o",              sound: "/o/",      emoji: "🐙", keyword: "on",      heroBg: "bg-sky-50",     heroText: "text-sky-700",     highlight: "o" },
  13: { letters: "d",              sound: "/d/",      emoji: "🐶", keyword: "dog",     heroBg: "bg-sky-50",     heroText: "text-sky-700",     highlight: "d" },
  14: { letters: "g",              sound: "/g/",      emoji: "🐊", keyword: "got",     heroBg: "bg-sky-50",     heroText: "text-sky-700",     highlight: "g" },
  15: { letters: "l",              sound: "/l/",      emoji: "🦁", keyword: "lip",     heroBg: "bg-sky-50",     heroText: "text-sky-700",     highlight: "l" },
  16: { letters: "v",              sound: "/v/",      emoji: "🎻", keyword: "van",     heroBg: "bg-sky-50",     heroText: "text-sky-700",     highlight: "v" },
  // Stage 3 — y r e qu z
  17: { letters: "y",              sound: "/y/",      emoji: "🪀", keyword: "yes",     heroBg: "bg-emerald-50", heroText: "text-emerald-700", highlight: "^y" },
  18: { letters: "r",              sound: "/r/",      emoji: "🌈", keyword: "run",     heroBg: "bg-emerald-50", heroText: "text-emerald-700", highlight: "r" },
  19: { letters: "e",              sound: "/e/",      emoji: "🥚", keyword: "egg",     heroBg: "bg-emerald-50", heroText: "text-emerald-700", highlight: "e" },
  20: { letters: "qu",             sound: "/kw/",     emoji: "👑", keyword: "quit",    heroBg: "bg-emerald-50", heroText: "text-emerald-700", highlight: "qu" },
  21: { letters: "z",              sound: "/z/",      emoji: "⚡", keyword: "zip",     heroBg: "bg-emerald-50", heroText: "text-emerald-700", highlight: "z" },
  // Stage 4 — j u k x w
  22: { letters: "j",              sound: "/j/",      emoji: "🃏", keyword: "jet",     heroBg: "bg-violet-50",  heroText: "text-violet-700",  highlight: "j" },
  23: { letters: "u",              sound: "/u/",      emoji: "☂️",  keyword: "up",      heroBg: "bg-violet-50",  heroText: "text-violet-700",  highlight: "u" },
  24: { letters: "k",              sound: "/k/",      emoji: "🔑", keyword: "kit",     heroBg: "bg-violet-50",  heroText: "text-violet-700",  highlight: "k" },
  25: { letters: "x",              sound: "/ks/",     emoji: "🦊", keyword: "fox",     heroBg: "bg-violet-50",  heroText: "text-violet-700",  highlight: "x" },
  26: { letters: "w",              sound: "/w/",      emoji: "🌊", keyword: "wet",     heroBg: "bg-violet-50",  heroText: "text-violet-700",  highlight: "w" },
  // Stage 4+ — doubles & plurals
  27: { letters: "ll · ss · ff · zz", sound: "doubles", emoji: "🔁", keyword: "bell", heroBg: "bg-rose-50",    heroText: "text-rose-700",    highlight: "ll|ss|ff|zz" },
  // Stage 5 — consonant blends & ck
  28: { letters: "CVCC",           sound: "end blends",  emoji: "🔗", keyword: "band",   heroBg: "bg-orange-50",  heroText: "text-orange-700" },
  29: { letters: "bl · cl · fl",   sound: "l-blends",    emoji: "🧱", keyword: "flag",   heroBg: "bg-orange-50",  heroText: "text-orange-700" },
  30: { letters: "br · cr · tr",   sound: "r-blends",    emoji: "🦀", keyword: "crab",   heroBg: "bg-orange-50",  heroText: "text-orange-700" },
  31: { letters: "ck",             sound: "/k/",          emoji: "🔒", keyword: "back",   heroBg: "bg-orange-50",  heroText: "text-orange-700", highlight: "ck" },
  32: { letters: "-ed",            sound: "past tense",   emoji: "⏮️", keyword: "jumped", heroBg: "bg-orange-50",  heroText: "text-orange-700", highlight: "ed$" },
  33: { letters: "st · sp · sw",   sound: "s-blends",     emoji: "⭐", keyword: "stop",   heroBg: "bg-orange-50",  heroText: "text-orange-700" },
  // Stage 6 — digraphs
  34: { letters: "sh",             sound: "/sh/",     emoji: "🤫", keyword: "ship",    heroBg: "bg-teal-50",    heroText: "text-teal-700",    highlight: "sh" },
  35: { letters: "ch",             sound: "/ch/",     emoji: "🪑", keyword: "chip",    heroBg: "bg-teal-50",    heroText: "text-teal-700",    highlight: "ch" },
  36: { letters: "tch",            sound: "/ch/",     emoji: "⌚", keyword: "catch",   heroBg: "bg-teal-50",    heroText: "text-teal-700",    highlight: "tch" },
  37: { letters: "th",             sound: "/th/",     emoji: "🦷", keyword: "this",    heroBg: "bg-teal-50",    heroText: "text-teal-700",    highlight: "th" },
  38: { letters: "ng",             sound: "/ng/",     emoji: "🔔", keyword: "ring",    heroBg: "bg-teal-50",    heroText: "text-teal-700",    highlight: "ng" },
  39: { letters: "ph",             sound: "/f/",      emoji: "📱", keyword: "phone",   heroBg: "bg-teal-50",    heroText: "text-teal-700",    highlight: "ph" },
  40: { letters: "wh",             sound: "/w/",      emoji: "🌬️", keyword: "when",    heroBg: "bg-teal-50",    heroText: "text-teal-700",    highlight: "wh" },
  // Stage 7.1 — long vowel teams
  41: { letters: "ai · ay",        sound: "/ā/",      emoji: "🌧️", keyword: "rain",    heroBg: "bg-purple-50",  heroText: "text-purple-700",  highlight: "ai|ay" },
  42: { letters: "ee · ea",        sound: "/ē/",      emoji: "🌿", keyword: "feet",    heroBg: "bg-purple-50",  heroText: "text-purple-700",  highlight: "ee|ea" },
  43: { letters: "--y · eigh · ey", sound: "/ē/ /ā/", emoji: "🗝️", keyword: "funny",   heroBg: "bg-purple-50",  heroText: "text-purple-700",  highlight: "y$|eigh|ey" },
  44: { letters: "igh · -y",       sound: "/ī/",      emoji: "🌙", keyword: "night",   heroBg: "bg-purple-50",  heroText: "text-purple-700",  highlight: "igh" },
  45: { letters: "ie",             sound: "/ī/",      emoji: "🥧", keyword: "pie",     heroBg: "bg-purple-50",  heroText: "text-purple-700",  highlight: "ie" },
  46: { letters: "oa",             sound: "/ō/",      emoji: "⛵", keyword: "boat",    heroBg: "bg-purple-50",  heroText: "text-purple-700",  highlight: "oa" },
  47: { letters: "-ing",           sound: "present",  emoji: "🏃", keyword: "running", heroBg: "bg-purple-50",  heroText: "text-purple-700",  highlight: "ing$" },
  48: { letters: "un-",            sound: "prefix",   emoji: "🔓", keyword: "unlock",  heroBg: "bg-purple-50",  heroText: "text-purple-700",  highlight: "^un" },
  // Stage 7.2 — r-controlled vowels
  49: { letters: "ar · a · al",    sound: "/ar/",     emoji: "🚗", keyword: "car",     heroBg: "bg-indigo-50",  heroText: "text-indigo-700",  highlight: "ar" },
  50: { letters: "or · aw · ore",  sound: "/or/",     emoji: "🌽", keyword: "for",     heroBg: "bg-indigo-50",  heroText: "text-indigo-700",  highlight: "or|aw|ore" },
  51: { letters: "ir · ur · er",   sound: "/er/",     emoji: "🐦", keyword: "bird",    heroBg: "bg-indigo-50",  heroText: "text-indigo-700",  highlight: "ir|ur|er" },
  52: { letters: "air · are · ere", sound: "/air/",   emoji: "🎈", keyword: "fair",    heroBg: "bg-indigo-50",  heroText: "text-indigo-700",  highlight: "air|are|ere" },
  53: { letters: "-er",            sound: "compare",  emoji: "📏", keyword: "bigger",  heroBg: "bg-indigo-50",  heroText: "text-indigo-700",  highlight: "er$" },
  // Stage 7.3 — diphthongs & oo sounds
  54: { letters: "oo · ou · o",    sound: "/oo/ long", emoji: "🌙", keyword: "moon",   heroBg: "bg-fuchsia-50", heroText: "text-fuchsia-700",  highlight: "oo" },
  55: { letters: "ow · ou",        sound: "/ow/",     emoji: "🐄", keyword: "cow",     heroBg: "bg-fuchsia-50", heroText: "text-fuchsia-700",  highlight: "ow|ou" },
  56: { letters: "oi · oy",        sound: "/oi/",     emoji: "🪙", keyword: "coin",    heroBg: "bg-fuchsia-50", heroText: "text-fuchsia-700",  highlight: "oi|oy" },
  57: { letters: "oo · u · oul",   sound: "/oo/ short", emoji: "📚", keyword: "book", heroBg: "bg-fuchsia-50", heroText: "text-fuchsia-700",  highlight: "oo" },
  // Stage 7.4 — split digraphs & silent letters
  58: { letters: "a-e · a",        sound: "/ā/",      emoji: "🎂", keyword: "cake",    heroBg: "bg-cyan-50",    heroText: "text-cyan-700" },
  59: { letters: "i-e · soft c/g", sound: "/ī/ /s/ /j/", emoji: "🧊", keyword: "ice", heroBg: "bg-cyan-50",   heroText: "text-cyan-700",    highlight: "ce|ci|cy|ge|gi|gy" },
  60: { letters: "e-e · e",        sound: "/ē/",      emoji: "🌳", keyword: "these",   heroBg: "bg-cyan-50",    heroText: "text-cyan-700" },
  61: { letters: "o-e · ow · oe",  sound: "/ō/",      emoji: "🏠", keyword: "home",    heroBg: "bg-cyan-50",    heroText: "text-cyan-700",    highlight: "ow|oe" },
  62: { letters: "kn · gn · mb · wr", sound: "silent", emoji: "🔇", keyword: "knot",  heroBg: "bg-cyan-50",    heroText: "text-cyan-700",    highlight: "kn|gn|mb|wr" },
  63: { letters: "u-e · ue · ew · ui", sound: "/yoo/ /oo/", emoji: "🫐", keyword: "blue", heroBg: "bg-cyan-50", heroText: "text-cyan-700", highlight: "ue|ew|ui" },
};

// ─── Types ────────────────────────────────────────────────────────────────────
const STAGE_LABELS: Record<string, string> = {
  "1":   "Stage 1 — Foundation",
  "2":   "Stage 2 — Foundation",
  "3":   "Stage 3 — Foundation",
  "4":   "Stage 4 — Foundation",
  "4+":  "Stage 4+ — Doubles & Plurals",
  "5":   "Stage 5 — Consonant Blends",
  "6":   "Stage 6 — Digraphs",
  "7.1": "Stage 7 Unit 1 — Long Vowel Teams",
  "7.2": "Stage 7 Unit 2 — R-Controlled Vowels",
  "7.3": "Stage 7 Unit 3 — Diphthongs",
  "7.4": "Stage 7 Unit 4 — Split Digraphs",
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
  const childId = await getActiveChildId();
  if (!childId) return <NoChildBanner />;
  const { id } = await params;
  const skill = await getSkillById(parseInt(id, 10), childId);
  if (!skill) notFound();

  const matchingResources = await getResources(skill.stage);

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
        <p className="text-sm text-gray-500 mt-1">{STAGE_LABELS[skill.stage]}</p>
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
        childId={childId}
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
