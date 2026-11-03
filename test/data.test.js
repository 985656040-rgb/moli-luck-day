import test from "node:test";
import assert from "node:assert/strict";
import {
  MOODS,
  TAROTS,
  COLORS,
  OUTFITS,
  FOODS,
  CHARMS,
  TIPS,
  AFFIRMATIONS,
  getMood,
  getTarot,
  generateReading,
  getSavedReading,
  saveReading,
  isValidReading,
  normalizeReading,
  localDate,
  STORAGE_KEY,
} from "../src/data.js";

function memoryStorage() {
  const data = new Map();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
  };
}

function legacyReading(overrides = {}) {
  const { number, affirmation, ...reading } = generateReading("happy", "sun");
  return { ...reading, version: 1, ...overrides };
}

test("five current moods and six current tarot outcomes produce complete v2 readings", () => {
  assert.deepEqual(
    MOODS.map((mood) => mood.id),
    ["happy", "calm", "anxious", "tired", "unsure"],
  );
  assert.deepEqual(
    TAROTS.map((tarot) => tarot.id),
    ["sun", "star", "moon", "empress", "fool", "world"],
  );
  for (const mood of MOODS) {
    assert.ok(mood.message && mood.comfort && mood.state);
    for (const tarot of TAROTS) {
      const result = generateReading(mood.id, tarot.id);
      assert.ok(isValidReading(result));
      assert.equal(result.version, 2);
      assert.equal(result.mood, mood.id);
      assert.equal(result.tarot, tarot.id);
      assert.equal(result.date, localDate());
      assert.ok(
        COLORS.some(
          (color) =>
            color.name === result.color.name && color.hex === result.color.hex,
        ),
      );
      assert.ok(OUTFITS.includes(result.outfit));
      assert.ok(FOODS.includes(result.food));
      assert.ok(CHARMS.includes(result.charm));
      assert.ok(TIPS.includes(result.tip));
      assert.ok(result.energy >= 3 && result.energy <= 5);
      assert.ok(
        Number.isInteger(result.number) &&
          result.number >= 1 &&
          result.number <= 99,
      );
      assert.ok(AFFIRMATIONS.includes(result.affirmation));
      assert.ok(
        tarot.interpretation && tarot.encouragement && tarot.suggestion,
      );
    }
  }
  assert.ok(TIPS.length >= 10);
});

test("new draws cannot select retired mood or tarot entries", () => {
  assert.throws(() => generateReading("lost"), RangeError);
  assert.throws(() => generateReading("happy", "lovers"), RangeError);
  for (let i = 0; i < 30; i++) {
    const reading = generateReading(MOODS[i % MOODS.length].id);
    assert.ok(TAROTS.some((tarot) => tarot.id === reading.tarot));
  }
  assert.equal(getMood("lost").label, "Lost");
  assert.equal(getTarot("lovers").name, "The Lovers");
  assert.equal(getMood("missing"), undefined);
  assert.equal(getTarot("missing"), undefined);
});

test("v2 reading round-trips unchanged for the same local day", () => {
  const storage = memoryStorage();
  const reading = generateReading("anxious", "moon");
  assert.equal(saveReading(reading, storage), true);
  assert.deepEqual(getSavedReading(storage), reading);
  assert.deepEqual(getSavedReading(storage), reading);
  assert.deepEqual(normalizeReading(reading), reading);
});

test("every original v1 mood/card combination upgrades without rerolling existing values", () => {
  for (const mood of ["happy", "anxious", "tired", "lost"]) {
    for (const tarot of ["sun", "star", "moon", "lovers", "fool", "world"]) {
      const storage = memoryStorage();
      const old = legacyReading({ mood, tarot });
      const snapshot = structuredClone(old);
      storage.setItem(STORAGE_KEY, JSON.stringify(old));
      const restored = getSavedReading(storage);
      assert.equal(restored.version, 2);
      assert.ok(isValidReading(restored));
      for (const [key, value] of Object.entries(old))
        if (key !== "version") assert.deepEqual(restored[key], value);
      assert.deepEqual(
        old,
        snapshot,
        "Migration must not mutate the source object.",
      );
      assert.deepEqual(getSavedReading(storage), restored);
      assert.deepEqual(JSON.parse(storage.getItem(STORAGE_KEY)), restored);
    }
  }
});

test("lost/lovers legacy migration is deterministic even when storage is read-only", () => {
  const old = legacyReading({ mood: "lost", tarot: "lovers" });
  const storage = {
    getItem: () => JSON.stringify(old),
    setItem() {
      throw new Error("read only");
    },
  };
  const restored = getSavedReading(storage);
  assert.equal(restored.mood, "lost");
  assert.equal(restored.tarot, "lovers");
  assert.deepEqual(getSavedReading(storage), restored);
  assert.deepEqual(normalizeReading(old), restored);
  assert.ok(getMood(restored.mood));
  assert.ok(getTarot(restored.tarot));
});

test("saving a valid v1 reading safely persists the deterministic v2 upgrade", () => {
  const storage = memoryStorage();
  const old = legacyReading({ mood: "lost", tarot: "lovers" });
  assert.equal(saveReading(old, storage), true);
  assert.deepEqual(getSavedReading(storage), normalizeReading(old));
  assert.equal(
    STORAGE_KEY,
    "moli-lucky-day:reading:v1",
    "The original key must remain discoverable.",
  );
});

test("expired, incomplete and tampered readings are never restored or silently rerolled", () => {
  const storage = memoryStorage();
  const reading = generateReading("happy", "sun");
  const invalids = [
    null,
    {},
    [],
    { ...reading, date: "2000-01-01" },
    { ...reading, date: "2026-02-30" },
    { ...reading, version: 3 },
    { ...reading, tarot: "unknown" },
    { ...reading, mood: "unknown" },
    { ...reading, energy: 9 },
    { ...reading, number: 0 },
    { ...reading, number: 100 },
    { ...reading, number: 7.5 },
    { ...reading, affirmation: "Unrecognized stored content." },
    { ...reading, affirmation: undefined },
    { ...reading, color: { name: "Sage Green", hex: "#000000" } },
    { ...reading, outfit: "unknown" },
    { ...reading, food: "unknown" },
    { ...reading, charm: "unknown" },
    { ...reading, tip: "unknown" },
    legacyReading({ mood: "calm" }),
    legacyReading({ tarot: "empress" }),
  ];
  for (const invalid of invalids) {
    const original = JSON.stringify(invalid);
    storage.setItem(STORAGE_KEY, original);
    assert.equal(getSavedReading(storage), null);
    assert.equal(
      storage.getItem(STORAGE_KEY),
      original,
      "Invalid or expired storage must not be overwritten.",
    );
  }
  storage.setItem(STORAGE_KEY, "{broken");
  assert.equal(getSavedReading(storage), null);
  assert.equal(storage.getItem(STORAGE_KEY), "{broken");
});

test("blocked browser storage does not break playable reading generation", () => {
  const blocked = {
    getItem() {
      throw new Error("denied");
    },
    setItem() {
      throw new Error("denied");
    },
  };
  const reading = generateReading("tired");
  assert.equal(getSavedReading(blocked), null);
  assert.equal(saveReading(reading, blocked), false);
  assert.ok(isValidReading(reading));
});

test("invalid mood, tarot and incomplete saved choices are rejected", () => {
  assert.throws(() => generateReading("invalid"), RangeError);
  assert.throws(() => generateReading("happy", "invalid"), RangeError);
  assert.equal(saveReading({}), false);
  assert.equal(normalizeReading({}), null);
});

test("localDate uses the device-local calendar at midnight boundaries", () => {
  assert.equal(localDate(new Date(2026, 0, 2, 0, 5)), "2026-01-02");
  assert.equal(localDate(new Date(2026, 0, 2, 23, 59)), "2026-01-02");
  assert.equal(
    localDate({
      getFullYear: () => 2026,
      getMonth: () => 0,
      getDate: () => 2,
      toISOString() {
        throw new Error("UTC conversion is not the device date.");
      },
    }),
    "2026-01-02",
  );
});
