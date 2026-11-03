import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";
import {
  generateReading,
  MOODS,
  TAROTS,
  STORAGE_KEY,
  getMood,
  getTarot,
} from "../src/data.js";

const url = process.env.TEST_URL || "http://127.0.0.1:4173/moli-luck-day/";
const output = fileURLToPath(new URL("../test-results", import.meta.url));
await mkdir(output, { recursive: true });
let server;
let browser;
const errors = [];
const failedAssets = [];
let checks = 0;
const names = {
  start: /Start My Lucky Day/i,
  discover: /Discover My Fortune/i,
  reveal: /Reveal My Lucky Guide/i,
  guide: /Your Little Lucky Guide/i,
  save: /Save My Lucky Card/i,
  share: /Share My Luck/i,
  again: /Play Again/i,
};

async function check(name, action) {
  await action();
  checks += 1;
  console.log(`PASS ${name}`);
}
async function noOverflow(page) {
  const { width, scroll } = await page.evaluate(() => ({
    width: innerWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  assert.ok(scroll <= width, `Horizontal overflow: ${scroll} > ${width}`);
}
async function capture(page, name) {
  await page.waitForTimeout(name === "01-welcome" ? 1400 : 650);
  await page.screenshot({
    path: `${output}/${name}-mobile.png`,
    fullPage: true,
  });
  for (const [width, height] of [
    [320, 568],
    [768, 1024],
    [1440, 1000],
  ]) {
    await page.setViewportSize({ width, height });
    await noOverflow(page);
  }
  await page.screenshot({
    path: `${output}/${name}-desktop.png`,
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
}
async function waitForServer() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (server && server.exitCode !== null)
      throw new Error(
        "Production preview exited before readiness. Check whether port 4173 is occupied.",
      );
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      /* Preview is still starting. */
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(
    `Production preview did not become ready at ${url}. Run npm run build first.`,
  );
}
async function revisit(page) {
  await page.reload();
  const button = page.getByRole("button", { name: /Revisit today.s reading/i });
  if (await button.count()) await button.click();
  await page.getByRole("heading", { name: names.guide }).waitFor();
}
async function stored(page) {
  return page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)),
    STORAGE_KEY,
  );
}
async function assertPng(download, filename, dimensions) {
  const path = `${output}/${filename}`;
  await download.saveAs(path);
  const bytes = await readFile(path);
  assert.equal(bytes.subarray(1, 4).toString(), "PNG");
  if (dimensions) {
    assert.equal(bytes.readUInt32BE(16), dimensions[0]);
    assert.equal(bytes.readUInt32BE(20), dimensions[1]);
  } else {
    assert.ok(bytes.readUInt32BE(16) >= 320);
    assert.ok(bytes.readUInt32BE(20) >= 320);
  }
  assert.ok(bytes.length > 20_000, "PNG should contain meaningful artwork.");
  return bytes;
}
async function openCamera(page) {
  await page.getByRole("button", { name: /Bring MOLI Home/i }).click();
  const dialog = page.getByRole("dialog", { name: /Bring MOLI Home/i });
  await dialog.waitFor();
  return dialog;
}

async function assertFallbackKeyboard(page, dialog) {
  const back = dialog.getByRole("button", { name: /^Back to my day$/i });
  await back.waitFor();
  await page.waitForFunction(
    () => document.activeElement?.textContent === "Back to my day",
  );
  assert.equal(
    await page.evaluate(() => document.body.style.overflow),
    "hidden",
  );
  for (const key of ["Tab", "Shift+Tab"]) {
    await page.keyboard.press(key);
    assert.equal(
      await back.evaluate((element) => element === document.activeElement),
      true,
    );
  }
}

try {
  if (!process.env.TEST_URL) {
    server = spawn(
      process.execPath,
      [
        fileURLToPath(
          new URL("../node_modules/vite/bin/vite.js", import.meta.url),
        ),
        "preview",
        "--host",
        "127.0.0.1",
        "--port",
        "4173",
        "--strictPort",
      ],
      { stdio: ["ignore", "pipe", "pipe"] },
    );
    server.stdout.on("data", () => {});
    server.stderr.on("data", (data) => process.stderr.write(data));
  }
  await waitForServer();
  const executablePath =
    process.env.CHROMIUM_PATH ||
    (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined);
  browser = await chromium.launch({
    executablePath,
    headless: true,
    args: ["--no-sandbox"],
  });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 1,
  });
  await context.addInitScript(() => {
    window.cameraRequests = 0;
    Object.defineProperty(navigator.mediaDevices, "getUserMedia", {
      configurable: true,
      value: async () => {
        window.cameraRequests += 1;
        throw new DOMException("Test: permission declined", "NotAllowedError");
      },
    });
  });
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("response", (response) => {
    if (response.status() >= 400)
      failedAssets.push(`${response.status()} ${response.url()}`);
  });

  await check(
    "GitHub Pages subpath loads complete local assets and welcome",
    async () => {
      await page.goto(url);
      await page.getByRole("button", { name: names.start }).waitFor();
      assert.equal(new URL(page.url()).pathname, "/moli-luck-day/");
      const assets = await page.evaluate(() =>
        [
          ...document.querySelectorAll('script[src],link[rel="stylesheet"]'),
        ].map((element) => element.src || element.href),
      );
      assert.ok(assets.length >= 2);
      assert.ok(
        assets.every((asset) =>
          new URL(asset).pathname.startsWith("/moli-luck-day/assets/"),
        ),
      );
      await noOverflow(page);
      await capture(page, "01-welcome");
      assert.equal(await page.evaluate(() => window.cameraRequests), 0);
    },
  );

  await check(
    "five moods react, show support, and require a choice",
    async () => {
      await page.getByRole("button", { name: names.start }).click();
      await page
        .getByRole("heading", { name: /How are you feeling today/i })
        .waitFor();
      assert.equal(
        await page.getByRole("button", { name: names.discover }).isDisabled(),
        true,
      );
      assert.equal(MOODS.length, 5);
      for (const mood of MOODS) {
        const option = page.getByRole("button", {
          name: new RegExp(mood.label, "i"),
        });
        await option.click();
        assert.equal(await option.getAttribute("aria-pressed"), "true");
        await page.getByText(mood.message, { exact: false }).waitFor();
      }
      await page.getByRole("button", { name: /Anxious/i }).click();
      await capture(page, "02-mood");
      await page.getByRole("button", { name: names.discover }).click();
    },
  );

  await check("tarot flips once and prevents another choice", async () => {
    await page
      .getByRole("heading", { name: /Pick a Card.*Find Your Magic/i })
      .waitFor();
    await page.getByRole("button", { name: /Choose magic card 2/i }).click();
    await page.getByRole("button", { name: names.reveal }).waitFor();
    for (const index of [1, 3])
      assert.equal(
        await page
          .getByRole("button", {
            name: new RegExp(`Choose magic card ${index}`, "i"),
          })
          .isDisabled(),
        true,
      );
    await capture(page, "03-tarot");
    await page.getByRole("button", { name: names.reveal }).click();
  });

  let reading;
  await check(
    "guide shows stable recommendations, lucky number, affirmation, and mood message",
    async () => {
      await page.getByRole("heading", { name: names.guide }).waitFor();
      reading = await stored(page);
      assert.equal(reading.mood, "anxious");
      assert.equal(reading.version, 2);
      assert.ok(
        Number.isInteger(reading.number) &&
          reading.number >= 1 &&
          reading.number <= 99,
      );
      for (const value of [
        reading.color.name,
        reading.outfit,
        reading.food,
        reading.charm,
        reading.tip,
        reading.affirmation,
      ])
        await page.getByText(value, { exact: false }).first().waitFor();
      await page
        .getByText(getMood(reading.mood).comfort, { exact: true })
        .waitFor();
      await page
        .getByText(getTarot(reading.tarot).message, { exact: false })
        .first()
        .waitFor();
      await page.getByText(String(reading.number), { exact: true }).waitFor();
      await capture(page, "04-guide");
      assert.equal(await page.evaluate(() => window.cameraRequests), 0);
    },
  );

  await check(
    "fortune download is a 1080 × 1920 PNG containing current number and affirmation",
    async () => {
      await page.evaluate(() => {
        window.exportTexts = [];
        const original = CanvasRenderingContext2D.prototype.fillText;
        CanvasRenderingContext2D.prototype.fillText = function (text, ...args) {
          window.exportTexts.push(String(text));
          return original.call(this, text, ...args);
        };
      });
      await page.getByRole("button", { name: names.save }).click();
      const dialog = page.getByRole("dialog");
      await dialog.getByRole("link", { name: /Download image/i }).waitFor();
      const drawnText = await page.evaluate(() => window.exportTexts.join(" "));
      assert.ok(drawnText.includes(String(reading.number)));
      assert.ok(drawnText.includes(reading.affirmation));
      assert.ok(/LUCKY NUMBER/i.test(drawnText));
      await dialog.getByRole("button", { name: /Close save preview/i }).focus();
      await page.keyboard.press("Shift+Tab");
      assert.equal(
        await dialog
          .getByRole("button", { name: names.share })
          .evaluate((element) => element === document.activeElement),
        true,
      );
      await page.keyboard.press("Tab");
      assert.equal(
        await dialog
          .getByRole("button", { name: /Close save preview/i })
          .evaluate((element) => element === document.activeElement),
        true,
      );
      const pending = page.waitForEvent("download");
      await dialog.getByRole("link", { name: /Download image/i }).click();
      await assertPng(await pending, "fortune.png", [1080, 1920]);
      assert.deepEqual(await stored(page), reading);
      await page.keyboard.press("Escape");
      assert.equal(await page.getByRole("dialog").count(), 0);
    },
  );

  await check(
    "result Share My Luck opens preview and passes the actual PNG to native sharing",
    async () => {
      await page.evaluate(() => {
        Object.defineProperty(navigator, "canShare", {
          configurable: true,
          value: ({ files }) => files?.[0]?.type === "image/png",
        });
        Object.defineProperty(navigator, "share", {
          configurable: true,
          value: async ({ files }) => {
            window.sharedFile = {
              name: files[0].name,
              type: files[0].type,
              size: files[0].size,
            };
          },
        });
      });
      await page.getByRole("button", { name: names.share }).click();
      const dialog = page.getByRole("dialog");
      await dialog.getByRole("link", { name: /Download image/i }).waitFor();
      await dialog.getByRole("button", { name: names.share }).click();
      const shared = await page.evaluate(() => window.sharedFile);
      assert.equal(shared.type, "image/png");
      assert.equal(shared.name, `moli-lucky-day-${reading.date}.png`);
      assert.ok(shared.size > 20_000);
      await dialog.getByRole("button", { name: /Close save preview/i }).click();
    },
  );

  await check(
    "same-day reading survives subpath reload unchanged",
    async () => {
      await revisit(page);
      assert.equal(new URL(page.url()).pathname, "/moli-luck-day/");
      assert.deepEqual(await stored(page), reading);
    },
  );

  await check(
    "sharing fallback copies the public game path and preserves download",
    async () => {
      await page.getByRole("button", { name: names.share }).click();
      const dialog = page.getByRole("dialog");
      await dialog.getByRole("link", { name: /Download image/i }).waitFor();
      await page.evaluate(() => {
        Object.defineProperty(navigator, "canShare", {
          configurable: true,
          value: undefined,
        });
        Object.defineProperty(navigator, "share", {
          configurable: true,
          value: undefined,
        });
        Object.defineProperty(navigator, "clipboard", {
          configurable: true,
          value: {
            writeText: async (text) => {
              window.copiedGameLink = text;
            },
          },
        });
      });
      await dialog.getByRole("button", { name: names.share }).click();
      assert.equal(
        await page.evaluate(() => window.copiedGameLink),
        page.url(),
      );
      await page.getByText(/Game link copied!/).waitFor();
      await dialog.getByRole("button", { name: /Close save preview/i }).click();
    },
  );

  await check(
    "Play Again resets selection and completes a fresh second reading",
    async () => {
      await page.getByRole("button", { name: names.again }).click();
      assert.equal(
        await page.getByRole("button", { name: names.discover }).isDisabled(),
        true,
      );
      await page.getByRole("button", { name: /Happy/i }).click();
      await page.getByRole("button", { name: names.discover }).click();
      await page.getByRole("button", { name: /Choose magic card 1/i }).click();
      await page.getByRole("button", { name: names.reveal }).click();
      await page.getByRole("heading", { name: names.guide }).waitFor();
      const fresh = await stored(page);
      assert.equal(fresh.mood, "happy");
      assert.notDeepEqual(fresh, reading);
      await page.getByText(getMood("happy").comfort, { exact: true }).waitFor();
    },
  );

  await check(
    "all six current tarot outcomes and five moods restore with correct artwork",
    async () => {
      assert.equal(TAROTS.length, 6);
      assert.ok(TAROTS.some((card) => card.id === "empress"));
      for (const [index, card] of TAROTS.entries()) {
        const result = generateReading(MOODS[index % MOODS.length].id, card.id);
        await page.evaluate(
          ({ key, result }) =>
            localStorage.setItem(key, JSON.stringify(result)),
          { key: STORAGE_KEY, result },
        );
        await revisit(page);
        await page.getByText(card.name, { exact: true }).first().waitFor();
        await page.getByText(card.message, { exact: false }).first().waitFor();
        await page
          .getByRole("img", {
            name: new RegExp(`${card.name} tarot illustration`, "i"),
          })
          .waitFor();
        await noOverflow(page);
      }
    },
  );

  await check(
    "legacy lost/lovers result migrates without losing the original reading",
    async () => {
      const legacy = {
        ...generateReading("unsure", "star"),
        version: 1,
        mood: "lost",
        tarot: "lovers",
      };
      delete legacy.number;
      delete legacy.affirmation;
      await page.evaluate(
        ({ key, result }) => localStorage.setItem(key, JSON.stringify(result)),
        { key: STORAGE_KEY, result: legacy },
      );
      await revisit(page);
      await page.getByText("The Lovers", { exact: true }).first().waitFor();
      const migrated = await stored(page);
      for (const key of [
        "date",
        "mood",
        "tarot",
        "color",
        "outfit",
        "food",
        "charm",
        "tip",
        "energy",
      ])
        assert.deepEqual(migrated[key], legacy[key]);
      assert.equal(migrated.version, 2);
      assert.ok(Number.isInteger(migrated.number));
      assert.ok(migrated.affirmation);
      await revisit(page);
      assert.deepEqual(await stored(page), migrated);
    },
  );

  await check(
    "camera asks only after voluntary start, handles denial, and captures a cozy fallback",
    async () => {
      assert.equal(await page.evaluate(() => window.cameraRequests), 0);
      const dialog = await openCamera(page);
      assert.equal(await page.evaluate(() => window.cameraRequests), 0);
      await dialog.getByRole("button", { name: /^Start Camera$/i }).click();
      await dialog.getByText(/Camera access was not allowed/i).waitFor();
      assert.equal(await page.evaluate(() => window.cameraRequests), 1);
      await dialog
        .getByRole("button", { name: /Use a cozy backdrop/i })
        .click();
      const mover = dialog.getByRole("button", { name: /Move MOLI/i });
      await mover.focus();
      await page.keyboard.press("ArrowRight");
      const size = dialog.getByRole("slider", { name: /MOLI size/i });
      const previousSize = await size.inputValue();
      await size.focus();
      await page.keyboard.press("ArrowRight");
      assert.notEqual(await size.inputValue(), previousSize);
      await dialog.getByRole("button", { name: /Capture My MOLI/i }).click();
      await dialog.getByRole("link", { name: /Download photo/i }).waitFor();
      const pending = page.waitForEvent("download");
      await dialog.getByRole("link", { name: /Download photo/i }).click();
      await assertPng(await pending, "moli-camera-fallback.png");
      await dialog
        .getByRole("button", { name: /Close camera experience/i })
        .click();
      await page.getByRole("heading", { name: names.guide }).waitFor();
    },
  );

  await check(
    "corrupt local storage recovers to a playable welcome",
    async () => {
      await page.evaluate(
        (key) => localStorage.setItem(key, "{broken"),
        STORAGE_KEY,
      );
      await page.reload();
      await page.getByRole("button", { name: names.start }).waitFor();
      await page.getByRole("button", { name: names.start }).click();
      await page.getByRole("button", { name: names.discover }).waitFor();
    },
  );

  await check(
    "slow optional camera chunk has an accessible loading dialog and never blocks the game",
    async () => {
      const isolated = await browser.newContext({
        viewport: { width: 390, height: 844 },
      });
      const loadingPage = await isolated.newPage();
      const chunkPattern = /\/assets\/CameraExperience-[^/]+\.js(?:\?.*)?$/;
      let release;
      const pending = new Promise((resolve) => {
        release = resolve;
      });
      await isolated.route(chunkPattern, async (route) => {
        await pending;
        await route.continue().catch(() => {});
      });
      try {
        await loadingPage.goto(url);
        const previousOverflow = await loadingPage.evaluate(
          () => document.body.style.overflow,
        );
        const moduleRequested = loadingPage.waitForRequest((request) =>
          chunkPattern.test(request.url()),
        );
        await loadingPage
          .getByRole("button", { name: /Bring MOLI Home/i })
          .click();
        await moduleRequested;
        const dialog = loadingPage.getByRole("dialog", {
          name: /^Opening Bring MOLI Home$/i,
        });
        await dialog.waitFor();
        await assertFallbackKeyboard(loadingPage, dialog);
        await loadingPage.screenshot({
          path: `${output}/06-camera-loading.png`,
          fullPage: true,
        });
        await loadingPage.keyboard.press("Escape");
        assert.equal(await loadingPage.getByRole("dialog").count(), 0);
        assert.equal(
          await loadingPage.evaluate(() => document.body.style.overflow),
          previousOverflow,
        );
        assert.equal(
          await loadingPage
            .getByRole("button", { name: /Bring MOLI Home/i })
            .evaluate((element) => element === document.activeElement),
          true,
        );
        await loadingPage.getByRole("button", { name: names.start }).click();
        await loadingPage
          .getByRole("heading", { name: /How are you feeling today/i })
          .waitFor();
        assert.equal(
          await loadingPage
            .getByRole("button", { name: names.discover })
            .isDisabled(),
          true,
        );
      } finally {
        release();
        await isolated.close();
      }
    },
  );

  await check(
    "failed optional camera import shows a keyboard-safe fallback and preserves the main journey",
    async () => {
      const isolated = await browser.newContext({
        viewport: { width: 390, height: 844 },
      });
      const failedPage = await isolated.newPage();
      const expectedImportErrors = [];
      failedPage.on("pageerror", (error) =>
        expectedImportErrors.push(error.message),
      );
      failedPage.on("console", (message) => {
        if (message.type() === "error")
          expectedImportErrors.push(message.text());
      });
      let abortedModules = 0;
      await isolated.route(
        /\/assets\/CameraExperience-[^/]+\.js(?:\?.*)?$/,
        (route) => {
          abortedModules += 1;
          return route.abort("failed");
        },
      );
      try {
        await failedPage.goto(url);
        const previousOverflow = await failedPage.evaluate(
          () => document.body.style.overflow,
        );
        await failedPage
          .getByRole("button", { name: /Bring MOLI Home/i })
          .click();
        const dialog = failedPage.getByRole("dialog", {
          name: /A little pause for MOLI/i,
        });
        await dialog.waitFor();
        assert.ok(
          abortedModules > 0,
          "The optional module request must actually fail.",
        );
        await dialog.getByText(/camera experience couldn.t load/i).waitFor();
        await assertFallbackKeyboard(failedPage, dialog);
        await failedPage.screenshot({
          path: `${output}/07-camera-load-error.png`,
          fullPage: true,
        });
        await failedPage.keyboard.press("Escape");
        assert.equal(await failedPage.getByRole("dialog").count(), 0);
        assert.equal(
          await failedPage.evaluate(() => document.body.style.overflow),
          previousOverflow,
        );
        await failedPage
          .getByRole("button", { name: /Bring MOLI Home/i })
          .click();
        await dialog.getByRole("button", { name: /^Back to my day$/i }).click();
        assert.equal(await failedPage.getByRole("dialog").count(), 0);
        await failedPage.getByRole("button", { name: names.start }).click();
        await failedPage.getByRole("button", { name: /Calm/i }).click();
        await failedPage.getByRole("button", { name: names.discover }).click();
        await failedPage
          .getByRole("button", { name: /Choose magic card 1/i })
          .waitFor();
        assert.ok(
          expectedImportErrors.some((message) =>
            /fetch|import|ERR_FAILED|TypeError/i.test(message),
          ),
          "Injected import failures are expected only in this isolated context.",
        );
      } finally {
        await isolated.close();
      }
    },
  );

  assert.deepEqual(
    failedAssets,
    [],
    `Asset failures: ${failedAssets.join("\n")}`,
  );
  assert.deepEqual(errors, [], `Browser errors: ${errors.join("\n")}`);
  console.log(
    `\n${checks} browser checks passed. Screenshots and PNG: ${output}`,
  );
} finally {
  await browser?.close();
  if (server && server.exitCode === null) server.kill("SIGTERM");
}
