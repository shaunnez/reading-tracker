// Static emoji lookup for common phonics words.
// Falls back to null for unknown words (caller renders a styled letter circle).

const WORD_EMOJI: Record<string, string> = {
  // Animals
  cat: "🐱", bat: "🦇", rat: "🐀", dog: "🐶", pig: "🐷", hen: "🐔",
  fox: "🦊", cow: "🐄", owl: "🦉", bee: "🐝", bug: "🐛", ant: "🐜",
  ram: "🐏", yak: "🐃", emu: "🐦", cod: "🐟", elk: "🫎", cub: "🐻",
  pup: "🐶", kid: "🧒", calf: "🐄", lamb: "🐑", frog: "🐸", crab: "🦀",
  clam: "🐚", snail: "🐌", slug: "🐌", worm: "🪱", bird: "🐦", duck: "🦆",
  fish: "🐟", goat: "🐐", bear: "🐻", deer: "🦌", wolf: "🐺", lion: "🦁",
  seal: "🦭", moth: "🦋", hawk: "🦅", swan: "🦢", toad: "🐸", mole: "🐹",
  mice: "🐭", mouse: "🐭", whale: "🐳", shark: "🦈", sheep: "🐑",
  horse: "🐴", snake: "🐍", tiger: "🐯", zebra: "🦓", camel: "🐫",
  monkey: "🐒", rabbit: "🐰", turtle: "🐢", parrot: "🦜", chicken: "🐔",
  penguin: "🐧", dolphin: "🐬", octopus: "🐙", butterfly: "🦋",

  // Food & drink
  egg: "🥚", jam: "🫙", ham: "🍖", pie: "🥧", pea: "🫛", nut: "🥜",
  bun: "🍞", fig: "🫐", yam: "🍠", corn: "🌽", cake: "🎂", rice: "🍚",
  milk: "🥛", plum: "🫐", pear: "🍐", lime: "🍋", bean: "🫘", meat: "🥩",
  soup: "🍲", bread: "🍞", grape: "🍇", peach: "🍑", lemon: "🍋",
  apple: "🍎", candy: "🍬", pizza: "🍕", cheese: "🧀", cookie: "🍪",
  cherry: "🍒", banana: "🍌", orange: "🍊", mango: "🥭",

  // Nature & weather
  sun: "☀️", mud: "🟤", log: "🪵", leaf: "🍃", rain: "🌧️", tree: "🌳",
  moon: "🌙", star: "⭐", snow: "❄️", wind: "💨", hill: "⛰️", lake: "🏞️",
  rock: "🪨", sand: "🏖️", seed: "🌱", weed: "🌿", root: "🌱", bush: "🌳",
  pond: "🏞️", moss: "🌿", cloud: "☁️", storm: "⛈️", flood: "🌊",
  creek: "🏞️", river: "🏞️", ocean: "🌊", forest: "🌲", garden: "🌻",
  flower: "🌸", mountain: "🏔️", rainbow: "🌈",

  // Body
  lip: "👄", leg: "🦵", arm: "💪", toe: "🦶", ear: "👂", eye: "👁️",
  nose: "👃", hand: "✋", foot: "🦶", chin: "🫦", hair: "💇", neck: "🦒",
  knee: "🦵", teeth: "🦷", thumb: "👍", finger: "☝️", mouth: "👄",

  // Objects & household
  hat: "🎩", cup: "☕", pan: "🍳", pot: "🫕", bag: "👜", box: "📦",
  pen: "🖊️", pin: "📌", key: "🔑", mop: "🧹", map: "🗺️", fan: "🌀",
  bed: "🛏️", jug: "🫗", mug: "☕", rug: "🟫", tap: "🚰", cap: "🧢",
  jar: "🫙", can: "🥫", lid: "🫙", mat: "🟫", van: "🚐", bus: "🚌",
  car: "🚗", jet: "✈️", ship: "🚢", boat: "⛵", bell: "🔔", ball: "⚽",
  book: "📚", drum: "🥁", flag: "🏳️", gift: "🎁", lamp: "💡", lock: "🔒",
  ring: "💍", sock: "🧦", tent: "⛺", boot: "👢", coat: "🧥", door: "🚪",
  fork: "🍴", coin: "🪙", rope: "🪢", soap: "🧼", comb: "🪮",
  clock: "⏰", chair: "🪑", phone: "📱", spoon: "🥄", crown: "👑",
  knife: "🔪", shirt: "👕", shoes: "👟", house: "🏠", broom: "🧹",
  brush: "🖌️", candle: "🕯️", basket: "🧺", bottle: "🍼", pillow: "🛌",
  blanket: "🛏️", umbrella: "☂️",

  // People & actions
  man: "👨", mom: "👩", dad: "👨", boy: "👦", girl: "👧", baby: "👶",
  king: "🤴", queen: "👸", clown: "🤡",

  // Places
  farm: "🏡", park: "🏞️", shop: "🏪", zoo: "🦁", home: "🏠", town: "🏘️",
  city: "🏙️", school: "🏫", church: "⛪",

  // Misc
  gum: "🫧", web: "🕸️", gem: "💎", joy: "😊", run: "🏃", hop: "🐇",
  dig: "⛏️", hug: "🤗", nap: "😴", sit: "🪑", swim: "🏊", sing: "🎤",
  cry: "😢", clap: "👏", jump: "🦘", kick: "🦵", kiss: "💋", read: "📖",
  play: "🎮", fire: "🔥", game: "🎲", kite: "🪁", dice: "🎲", bone: "🦴",
  tune: "🎵", flute: "🎵", smile: "😊", frown: "☹️", night: "🌙",
  light: "💡", music: "🎵",
};

export function getWordEmoji(word: string): string | null {
  return WORD_EMOJI[word.toLowerCase()] ?? null;
}
