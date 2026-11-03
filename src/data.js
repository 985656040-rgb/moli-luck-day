export const STORAGE_KEY = "moli-lucky-day:reading:v1";

export const MOODS = [
  {
    id: "happy",
    label: "Happy",
    state: "excited",
    message: "Let’s keep those good vibes going!",
    comfort:
      "Keep shining, little one. Your joy is a little light worth sharing with the world.",
  },
  {
    id: "anxious",
    label: "Anxious",
    state: "comforting",
    message: "One little step at a time. You’ve got this.",
    comfort:
      "Take a slow breath. You don’t have to do everything at once. One gentle step is enough.",
  },
  {
    id: "tired",
    label: "Tired",
    state: "sleepy",
    message: "You deserve a little rest today.",
    comfort:
      "Rest is part of growing, too. Let yourself slow down. You are enough, just as you are.",
  },
  {
    id: "lost",
    label: "Lost",
    state: "thinking",
    message: "It’s okay not to have everything figured out.",
    comfort:
      "It’s okay to take the scenic route. Give yourself time. Your next little step will find you.",
  },
];

export const TAROTS = [
  {
    id: "star",
    name: "The Star",
    theme: "Hope & Healing",
    message: "Even the tiniest light can brighten your world.",
    interpretation:
      "Let a little hope in today. Small moments of kindness can help you feel like yourself again.",
  },
  {
    id: "sun",
    name: "The Sun",
    theme: "Joy & Energy",
    message: "Good things grow when you give yourself room to shine.",
    interpretation:
      "Make room for something that brings you joy. Your warmth may be the brightest part of someone’s day.",
  },
  {
    id: "moon",
    name: "The Moon",
    theme: "Intuition & Balance",
    message: "Trust yourself. You know more than you think.",
    interpretation:
      "Pause and listen to your inner voice. You don’t need every answer to choose a gentle way forward.",
  },
  {
    id: "lovers",
    name: "The Lovers",
    theme: "Connection & Support",
    message: "Surround yourself with people who make you feel at home.",
    interpretation:
      "A little connection can go a long way. Reach out to someone who makes you feel seen and supported.",
  },
  {
    id: "world",
    name: "The World",
    theme: "Completion & Growth",
    message: "Look how far you’ve come. Be proud of yourself.",
    interpretation:
      "Notice the quiet progress you’ve made. Even the smallest milestones deserve a little celebration.",
  },
  {
    id: "fool",
    name: "The Fool",
    theme: "New Beginnings",
    message: "Every little adventure starts with one brave step.",
    interpretation:
      "Follow a little curiosity today. A new beginning doesn’t need to be big to be beautiful.",
  },
];

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
  return {
    version: 1,
    date: localDate(),
    mood,
    tarot: tarotId ?? pick(TAROTS).id,
    color: { ...pick(COLORS) },
    outfit: pick(OUTFITS),
    food: pick(FOODS),
    charm: pick(CHARMS),
    tip: pick(TIPS),
    energy: 3 + randomIndex(3),
  };
}

export function isValidReading(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return (
    value.version === 1 &&
    typeof value.date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value.date) &&
    MOODS.some((item) => item.id === value.mood) &&
    TAROTS.some((item) => item.id === value.tarot) &&
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
    value.energy <= 5
  );
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
    const reading = JSON.parse(storage?.getItem(STORAGE_KEY) ?? "null");
    return isValidReading(reading) && reading.date === localDate()
      ? reading
      : null;
  } catch {
    return null;
  }
}

export function saveReading(reading, storage = browserStorage()) {
  if (!isValidReading(reading)) return false;
  try {
    if (!storage) return false;
    storage.setItem(STORAGE_KEY, JSON.stringify(reading));
    return true;
  } catch {
    return false;
  }
}
