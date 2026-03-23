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
  { word: "a",      emoji: "🍎" },
  { word: "and",    emoji: "🤝" },
  { word: "away",   emoji: "👋" },
  { word: "big",    emoji: "🐘" },
  { word: "blue",   emoji: "🫐" },
  { word: "can",    emoji: "🥫" },
  { word: "come",   emoji: "👉" },
  { word: "down",   emoji: "⬇️" },
  { word: "find",   emoji: "🔍" },
  { word: "for",    emoji: "🎁" },
  { word: "funny",  emoji: "😄" },
  { word: "go",     emoji: "🚦" },
  { word: "help",   emoji: "🆘" },
  { word: "here",   emoji: "📍" },
  { word: "I",      emoji: "👤" },
  { word: "in",     emoji: "📦" },
  { word: "is",     emoji: "❓" },
  { word: "it",     emoji: "💡" },
  { word: "jump",   emoji: "🐸" },
  { word: "little", emoji: "🐭" },
  { word: "look",   emoji: "👀" },
  { word: "make",   emoji: "🔨" },
  { word: "me",     emoji: "🙋" },
  { word: "my",     emoji: "🙌" },
  { word: "not",    emoji: "🚫" },
  { word: "one",    emoji: "1️⃣" },
  { word: "play",   emoji: "🎮" },
  { word: "red",    emoji: "🔴" },
  { word: "run",    emoji: "🏃" },
  { word: "said",   emoji: "💬" },
  { word: "see",    emoji: "👁️" },
  { word: "the",    emoji: "🌊" },
  { word: "three",  emoji: "3️⃣" },
  { word: "to",     emoji: "👉" },
  { word: "two",    emoji: "2️⃣" },
  { word: "up",     emoji: "⬆️" },
  { word: "we",     emoji: "👨‍👩‍👧" },
  { word: "where",  emoji: "🗺️" },
  { word: "yellow", emoji: "🌟" },
  { word: "you",    emoji: "👆" },
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
