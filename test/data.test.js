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
  generateReading,
  getSavedReading,
  saveReading,
  isValidReading,
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

test("all moods and six tarot outcomes produce complete valid readings", () => {
  for (const mood of MOODS) {
    for (const tarot of TAROTS) {
      const result = generateReading(mood.id, tarot.id);
      assert.ok(isValidReading(result));
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
    }
  }
  assert.ok(TIPS.length >= 10);
});

test("reading round-trips unchanged for the same local day", () => {
  const storage = memoryStorage();
  const reading = generateReading("anxious", "moon");
  assert.equal(saveReading(reading, storage), true);
  assert.deepEqual(getSavedReading(storage), reading);
  assert.deepEqual(getSavedReading(storage), reading);
});

test("expired, incomplete and tampered readings are never restored", () => {
  const storage = memoryStorage();
  const reading = generateReading("happy", "sun");
  for (const invalid of [
    null,
    {},
    { ...reading, date: "2000-01-01" },
    { ...reading, tarot: "unknown" },
    { ...reading, energy: 9 },
    { ...reading, color: { name: "Sage Green", hex: "#000000" } },
  ]) {
    storage.setItem(STORAGE_KEY, JSON.stringify(invalid));
    assert.equal(getSavedReading(storage), null);
  }
  storage.setItem(STORAGE_KEY, "{broken");
  assert.equal(getSavedReading(storage), null);
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

test("invalid mood and tarot choices are rejected", () => {
  assert.throws(() => generateReading("invalid"), RangeError);
  assert.throws(() => generateReading("happy", "invalid"), RangeError);
  assert.equal(saveReading({}), false);
});

test("localDate uses local calendar fields rather than UTC date conversion", () => {
  const date = new Date(2026, 0, 2, 0, 5);
  assert.equal(localDate(date), "2026-01-02");
});
