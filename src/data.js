// Keep the original storage key so a previously saved reading survives an upgrade.
export const STORAGE_KEY = "moli-lucky-day:reading:v1";

export const MOODS = [
  {
    id: "happy",
    label: "Happy",
    state: "excited",
    message: "Your happiness deserves to be celebrated.",
    comfort:
      "Keep shining, little one. Your joy is a little light worth sharing with the world.",
  },
  {
    id: "calm",
    label: "Calm",
    state: "calm",
    message: "There is a little magic in simply being here.",
    comfort:
      "You don’t need to rush this moment. Let a little peace come with you into the rest of your day.",
  },
  {
    id: "anxious",
    label: "Anxious",
    state: "comforting",
    message: "It’s okay to take things one step at a time.",
    comfort:
      "Take a slow breath. You don’t have to do everything at once. One gentle step is enough.",
  },
  {
    id: "tired",
    label: "Tired",
    state: "sleepy",
    message: "Rest is part of growing, too.",
    comfort:
      "Let yourself slow down. A little rest is a kind beginning. You are enough, just as you are.",
  },
  {
    id: "unsure",
    label: "Unsure",
    state: "thinking",
    message: "You don’t have to have everything figured out today.",
    comfort:
      "It’s okay to take the scenic route. Give yourself time. Your next little step will find you.",
  },
];

const LEGACY_MOOD = {
  id: "lost",
  label: "Lost",
  state: "thinking",
  message: "It’s okay not to have everything figured out.",
  comfort:
    "It’s okay to take the scenic route. Give yourself time. Your next little step will find you.",
};

export const TAROTS = [
  {
    id: "sun",
    name: "The Sun",
    theme: "Joy & Energy",
    message: "Good things grow when you give yourself room to shine.",
    interpretation:
      "There is room for your joy today. Notice what makes you feel warm and alive.",
    encouragement: "Your light doesn’t need to look like anyone else’s.",
    suggestion: "Make a little time for something that makes you smile.",
  },
  {
    id: "star",
    name: "The Star",
    theme: "Hope & Healing",
    message: "Even the tiniest light can brighten your world.",
    interpretation:
      "Let a little hope in. Small moments of kindness can help you feel like yourself again.",
    encouragement: "You can begin again as gently as you need.",
    suggestion: "Write down one small thing you’re looking forward to.",
  },
  {
    id: "moon",
    name: "The Moon",
    theme: "Intuition & Balance",
    message: "Trust yourself. You know more than you think.",
    interpretation:
      "Pause and listen to your inner voice. You don’t need every answer to find your next step.",
    encouragement: "Uncertainty is allowed. You can still be kind to yourself.",
    suggestion: "Take a quiet moment to name what you need today.",
  },
  {
    id: "empress",
    name: "The Empress",
    theme: "Care & Creativity",
    message: "Good things can grow at their own pace.",
    interpretation:
      "Give yourself the care you so freely offer others. Small comforts can make space for new ideas.",
    encouragement: "You deserve to feel nourished, supported, and at home.",
    suggestion: "Nurture something small: a plant, an idea, or yourself.",
  },
  {
    id: "fool",
    name: "The Fool",
    theme: "New Beginnings",
    message: "Every little adventure starts with one brave step.",
    interpretation:
      "Follow a little curiosity. A new beginning doesn’t need to be big to be beautiful.",
    encouragement: "You are allowed to try, learn, and try again.",
    suggestion: "Try one small thing just because it interests you.",
  },
  {
    id: "world",
    name: "The World",
    theme: "Completion & Growth",
    message: "Look how far you’ve come. Be proud of yourself.",
    interpretation:
      "Notice the quiet progress you’ve made. Small milestones deserve a little celebration.",
    encouragement: "The effort you’ve made matters, even when it felt small.",
    suggestion: "Give yourself credit for one thing you’ve learned.",
  },
];

const LEGACY_TAROT = {
  id: "lovers",
  name: "The Lovers",
  theme: "Connection & Support",
  message: "Surround yourself with people who make you feel at home.",
  interpretation:
    "A little connection can go a long way. Reach out to someone who makes you feel seen and supported.",
  encouragement: "You deserve a little care and connection, too.",
  suggestion: "Send a kind message to someone who makes you feel at home.",
};

export const getMood = (id) =>
  MOODS.find((item) => item.id === id) ??
  (id === LEGACY_MOOD.id ? LEGACY_MOOD : undefined);
export const getTarot = (id) =>
  TAROTS.find((item) => item.id === id) ??
  (id === LEGACY_TAROT.id ? LEGACY_TAROT : undefined);

export const COLORS = [
  { name: "Sage Green", hex: "#8DAF65" },
  { name: "Baby Pink", hex: "#F6D9D8" },
  { name: "Sky Blue", hex: "#BCDCEB" },
  { name: "Lavender", hex: "#C9B8DF" },
  { name: "Butter Yellow", hex: "#F9E9A7" },
  { name: "Cream White", hex: "#FFF9EA" },
];
export const OUTFITS = [
  "Cozy Cardigan",
  "White Shirt",
  "Knit Sweater",
  "Denim Jacket",
  "Pastel Hoodie",
  "Soft Scarf",
];
export const FOODS = [
  "Strawberry Cake",
  "Matcha Latte",
  "Blueberry Yogurt",
  "Chocolate Cookie",
  "Peach Tea",
  "Fresh Strawberries",
];
export const CHARMS = [
  "Lucky Clover",
  "Silver Necklace",
  "Star Keychain",
  "Cute Hair Clip",
  "Green Bracelet",
  "Tiny Flower",
];
export const TIPS = [
  "Take a little break. You’ve earned it.",
  "Celebrate your little wins.",
  "Do something that makes you smile.",
  "Try something new today.",
  "Spend a little time in nature.",
  "Write down one thing you’re grateful for.",
  "Drink a glass of water and take a slow breath.",
  "Send a kind message to someone you love.",
  "Make a little room for something you enjoy.",
  "Be as kind to yourself as you are to a friend.",
  "Put on your favorite song and stretch a little.",
  "Let one small thing be beautifully imperfect.",
];

const AFFIRMATIONS_BY_TAROT = {
  sun: [
    "There is room in my day for a little joy.",
    "I am allowed to shine in my own way.",
    "Small happy moments are worth celebrating.",
  ],
  star: [
    "A little hope is enough for today.",
    "I can begin again with kindness.",
    "I am making space for gentler days.",
  ],
  moon: [
    "I can trust myself one step at a time.",
    "I do not need every answer to move gently forward.",
    "My feelings deserve patience and care.",
  ],
  empress: [
    "Good things can grow at their own pace.",
    "I deserve the care I give to others.",
    "I can make space for rest and creativity.",
  ],
  fool: [
    "I can be curious without having it all figured out.",
    "One small beginning is enough.",
    "I am allowed to learn as I go.",
  ],
  world: [
    "My small steps have brought me somewhere.",
    "I can be proud of how far I have come.",
    "My progress deserves to be noticed.",
  ],
  lovers: [
    "I deserve connection that feels like home.",
    "I am worthy of kindness and support.",
    "I can let a little love into my day.",
  ],
};
export const AFFIRMATIONS = Object.values(AFFIRMATIONS_BY_TAROT).flat();
const NUMBERS_BY_TAROT = {
  sun: [1, 9, 19],
  star: [7, 17, 27],
  moon: [2, 18, 28],
  empress: [3, 6, 33],
  fool: [5, 11, 21],
  world: [8, 22, 44],
};

export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function randomIndex(length) {
  // Rejection sampling avoids modulo bias while keeping every possible outcome reachable.
  if (globalThis.crypto?.getRandomValues) {
    const limit = Math.floor(0x100000000 / length) * length;
    const value = new Uint32Array(1);
    do {
      globalThis.crypto.getRandomValues(value);
    } while (value[0] >= limit);
    return value[0] % length;
  }
  return Math.floor(Math.random() * length);
}
const pick = (items) => items[randomIndex(items.length)];

export function generateReading(mood, tarotId) {
  if (!MOODS.some((item) => item.id === mood))
    throw new RangeError("Choose a valid mood first.");
  if (tarotId !== undefined && !TAROTS.some((item) => item.id === tarotId))
    throw new RangeError("Unknown tarot card.");
  const tarot = tarotId ?? pick(TAROTS).id;
  return {
    version: 2,
    date: localDate(),
    mood,
    tarot,
    color: { ...pick(COLORS) },
    outfit: pick(OUTFITS),
    food: pick(FOODS),
    charm: pick(CHARMS),
    tip: pick(TIPS),
    energy: 3 + randomIndex(3),
    number: pick(NUMBERS_BY_TAROT[tarot]),
    affirmation: pick(AFFIRMATIONS_BY_TAROT[tarot]),
  };
}

function isCalendarDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return false;
  const date = new Date(`${value}T12:00:00`);
  return !Number.isNaN(date.getTime()) && localDate(date) === value;
}

export function isValidReading(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const validBase =
    [1, 2].includes(value.version) &&
    isCalendarDate(value.date) &&
    Boolean(getMood(value.mood)) &&
    Boolean(getTarot(value.tarot)) &&
    COLORS.some(
      (item) =>
        item.name === value.color?.name && item.hex === value.color?.hex,
    ) &&
    OUTFITS.includes(value.outfit) &&
    FOODS.includes(value.food) &&
    CHARMS.includes(value.charm) &&
    TIPS.includes(value.tip) &&
    Number.isInteger(value.energy) &&
    value.energy >= 3 &&
    value.energy <= 5;
  if (!validBase) return false;
  if (value.version === 1) {
    return (
      ["happy", "anxious", "tired", "lost"].includes(value.mood) &&
      ["sun", "star", "moon", "lovers", "fool", "world"].includes(value.tarot)
    );
  }
  return (
    Number.isInteger(value.number) &&
    value.number >= 1 &&
    value.number <= 99 &&
    AFFIRMATIONS.includes(value.affirmation)
  );
}

// Migration adds only the new fields. The original card, mood and recommendations never reroll.
export function normalizeReading(reading) {
  if (!isValidReading(reading)) return null;
  if (reading.version === 2) return reading;
  const stable = [
    reading.date,
    reading.mood,
    reading.tarot,
    reading.color.name,
    reading.outfit,
    reading.food,
    reading.charm,
    reading.tip,
    reading.energy,
  ].join("|");
  let hash = 2166136261;
  for (let index = 0; index < stable.length; index++)
    hash = Math.imul(hash ^ stable.charCodeAt(index), 16777619) >>> 0;
  const affirmations = AFFIRMATIONS_BY_TAROT[reading.tarot];
  return {
    ...reading,
    version: 2,
    number: 1 + (hash % 99),
    affirmation: affirmations[hash % affirmations.length],
  };
}

function browserStorage() {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}

export function getSavedReading(storage = browserStorage()) {
  try {
    const original = JSON.parse(storage?.getItem(STORAGE_KEY) ?? "null");
    const reading = normalizeReading(original);
    if (!reading || reading.date !== localDate()) return null;
    if (original.version === 1) {
      // A read-only/quota-limited storage area must not hide a perfectly valid old reading.
      try {
        storage?.setItem(STORAGE_KEY, JSON.stringify(reading));
      } catch {
        /* Use the stable in-memory upgrade. */
      }
    }
    return reading;
  } catch {
    return null;
  }
}

export function saveReading(reading, storage = browserStorage()) {
  const normalized = normalizeReading(reading);
  if (!normalized) return false;
  try {
    if (!storage) return false;
    storage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return true;
  } catch {
    return false;
  }
}
