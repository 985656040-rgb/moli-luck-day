import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";
import { generateReading, MOODS, TAROTS, STORAGE_KEY } from "../src/data.js";

const url = process.env.TEST_URL || "http://127.0.0.1:4173";
const output = fileURLToPath(new URL("../test-results", import.meta.url));
await mkdir(output, { recursive: true });
let server;
let browser;
const errors = [];
let checks = 0;

async function check(name, action) {
  await action();
  checks += 1;
  console.log(`PASS ${name}`);
}

async function noOverflow(page) {
  const dimensions = await page.evaluate(() => ({
    width: innerWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  assert.ok(
    dimensions.scroll <= dimensions.width,
    `Horizontal overflow: ${dimensions.scroll} > ${dimensions.width}`,
  );
}

async function capture(page, name) {
  await page.waitForTimeout(name === "01-welcome" ? 1400 : 650);
  await page.screenshot({
    path: `${output}/${name}-mobile.png`,
    fullPage: true,
  });
  await page.setViewportSize({ width: 320, height: 568 });
  await noOverflow(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await noOverflow(page);
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
        "Production preview exited before readiness. Check whether port 4173 is already occupied.",
      );
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      /* Server is still starting. */
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(
    `Production preview did not become ready at ${url}. Run npm run build first.`,
  );
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
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await check(
    "welcome renders on mobile without horizontal overflow",
    async () => {
      await page.goto(url);
      await page.getByRole("button", { name: /Find My Luck/i }).waitFor();
      await noOverflow(page);
      await capture(page, "01-welcome");
    },
  );

  await check(
    "mood is required and every mood displays its supportive message",
    async () => {
      await page.getByRole("button", { name: /Find My Luck/i }).click();
      assert.equal(
        await page.getByRole("button", { name: /^Continue/i }).isDisabled(),
        true,
      );
      for (const mood of MOODS) {
        await page
          .getByRole("button", { name: new RegExp(mood.label, "i") })
          .click();
        await page.getByText(mood.message, { exact: false }).waitFor();
      }
      await page.getByRole("button", { name: /Anxious/i }).click();
      await noOverflow(page);
      await capture(page, "02-mood");
      await page.getByRole("button", { name: /^Continue/i }).click();
    },
  );

  await check(
    "one card flips, reveals interpretation, and locks further choices",
    async () => {
      await page.getByRole("button", { name: /Choose magic card 2/i }).click();
      await page
        .getByRole("button", { name: /Reveal My Luck/i })
        .waitFor({ state: "visible" });
      for (const index of [1, 3])
        assert.equal(
          await page
            .getByRole("button", {
              name: new RegExp(`Choose magic card ${index}`, "i"),
            })
            .isDisabled(),
          true,
        );
      await noOverflow(page);
      await capture(page, "03-tarot");
      await page.getByRole("button", { name: /Reveal My Luck/i }).click();
    },
  );

  let reading;
  await check(
    "complete personalized guide persists a stable reading",
    async () => {
      await page.getByRole("heading", { name: /Your lucky guide/i }).waitFor();
      reading = await page.evaluate(
        (key) => JSON.parse(localStorage.getItem(key)),
        STORAGE_KEY,
      );
      assert.ok(reading);
      assert.equal(reading.mood, "anxious");
      for (const value of [
        reading.color.name,
        reading.outfit,
        reading.food,
        reading.charm,
        reading.tip,
      ])
        await page.getByText(value, { exact: true }).first().waitFor();
      await page
        .getByText(MOODS.find((mood) => mood.id === reading.mood).comfort, {
          exact: true,
        })
        .waitFor();
      await page
        .getByText(TAROTS.find((card) => card.id === reading.tarot).message, {
          exact: false,
        })
        .first()
        .waitFor();
      await noOverflow(page);
      await capture(page, "04-guide");
    },
  );

  await check(
    "save creates a real 1080 × 1920 PNG from the reading",
    async () => {
      await page.getByRole("button", { name: /Save My Luck/i }).click();
      const downloadButton = page.getByRole("button", { name: /Download/i });
      const downloadLink = page.getByRole("link", { name: /Download/i });
      await downloadButton.or(downloadLink).waitFor({ state: "visible" });
      await page.getByRole("button", { name: /Close save preview/i }).focus();
      await page.keyboard.press("Shift+Tab");
      assert.equal(
        await page
          .getByRole("button", { name: /Share My Luck/i })
          .evaluate((element) => element === document.activeElement),
        true,
      );
      await page.keyboard.press("Tab");
      assert.equal(
        await page
          .getByRole("button", { name: /Close save preview/i })
          .evaluate((element) => element === document.activeElement),
        true,
      );
      const downloadPromise = page.waitForEvent("download");
      await downloadButton.or(downloadLink).click();
      const download = await downloadPromise;
      const path = `${output}/fortune.png`;
      await download.saveAs(path);
      const png = await readFile(path);
      assert.equal(png.subarray(1, 4).toString(), "PNG");
      assert.equal(png.readUInt32BE(16), 1080);
      assert.equal(png.readUInt32BE(20), 1920);
      assert.ok(
        png.length > 20_000,
        "Export should contain meaningful artwork.",
      );
      assert.deepEqual(
        await page.evaluate(
          (key) => JSON.parse(localStorage.getItem(key)),
          STORAGE_KEY,
        ),
        reading,
      );
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
      await page.getByRole("button", { name: /Share My Luck/i }).click();
      const shared = await page.evaluate(() => window.sharedFile);
      assert.equal(shared.type, "image/png");
      assert.equal(shared.name, `moli-lucky-day-${reading.date}.png`);
      assert.equal(shared.size, png.length);
      assert.equal(await page.getByRole("dialog").count(), 1);
      await page.keyboard.press("Escape");
      assert.equal(await page.getByRole("dialog").count(), 0);
    },
  );

  await check("same-day reading survives reload", async () => {
    await page.reload();
    const revisit = page.getByRole("button", {
      name: /(?:View|Revisit|Open|See).*?(?:reading|luck)|Today.s (?:reading|luck)/i,
    });
    if (await revisit.count()) await revisit.first().click();
    await page.getByRole("heading", { name: /Your lucky guide/i }).waitFor();
    assert.deepEqual(
      await page.evaluate(
        (key) => JSON.parse(localStorage.getItem(key)),
        STORAGE_KEY,
      ),
      reading,
    );
  });

  await check(
    "sharing falls back to a copied game link when file sharing is unavailable",
    async () => {
      await page.getByRole("button", { name: /Save My Luck/i }).click();
      await page.getByRole("link", { name: /Download/i }).waitFor();
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
      await page.getByRole("button", { name: /Share My Luck/i }).click();
      assert.equal(
        await page.evaluate(() => window.copiedGameLink),
        page.url(),
      );
      await page.getByText(/Game link copied!/).waitFor();
      await page.getByRole("button", { name: /Close/i }).click();
    },
  );

  await check("Try Again returns to fresh mood selection", async () => {
    await page.getByRole("button", { name: /Try Again/i }).click();
    assert.equal(
      await page.getByRole("button", { name: /^Continue/i }).isDisabled(),
      true,
    );
    await page.getByRole("button", { name: /Happy/i }).click();
    await page.getByRole("button", { name: /^Continue/i }).click();
    await page.getByRole("button", { name: /Choose magic card 1/i }).click();
    await page.getByRole("button", { name: /Reveal My Luck/i }).click();
    await page.getByRole("heading", { name: /Your lucky guide/i }).waitFor();
    const fresh = await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)),
      STORAGE_KEY,
    );
    assert.equal(fresh.mood, "happy");
    assert.notDeepEqual(fresh, reading);
    await page
      .getByText(MOODS.find((mood) => mood.id === "happy").comfort, {
        exact: true,
      })
      .waitFor();
  });

  await check(
    "all six tarot cards and every mood can be restored and rendered",
    async () => {
      for (const card of TAROTS) {
        const result = generateReading(
          MOODS[TAROTS.indexOf(card) % MOODS.length].id,
          card.id,
        );
        await page.evaluate(
          ({ key, result }) =>
            localStorage.setItem(key, JSON.stringify(result)),
          { key: STORAGE_KEY, result },
        );
        await page.reload();
        const revisit = page.getByRole("button", {
          name: /(?:View|Revisit|Open|See).*?(?:reading|luck)|Today.s (?:reading|luck)/i,
        });
        if (await revisit.count()) await revisit.first().click();
        await page.getByText(card.name, { exact: true }).first().waitFor();
        await page.getByText(card.message, { exact: false }).first().waitFor();
        await noOverflow(page);
      }
    },
  );

  await check(
    "small phone, tablet, and desktop layouts do not overflow",
    async () => {
      for (const [width, height] of [
        [320, 568],
        [768, 1024],
        [1440, 1000],
      ]) {
        await page.setViewportSize({ width, height });
        await noOverflow(page);
      }
      await page.screenshot({
        path: `${output}/05-desktop.png`,
        fullPage: true,
      });
    },
  );

  await check(
    "corrupt local storage recovers to a playable welcome screen",
    async () => {
      await page.evaluate(
        (key) => localStorage.setItem(key, "{broken"),
        STORAGE_KEY,
      );
      await page.reload();
      await page.getByRole("button", { name: /Find My Luck/i }).waitFor();
      await page.getByRole("button", { name: /Find My Luck/i }).click();
      await page.getByRole("button", { name: /^Continue/i }).waitFor();
    },
  );
  assert.deepEqual(errors, [], `Browser errors: ${errors.join("\n")}`);
  console.log(
    `\n${checks} browser checks passed. Screenshots and PNG: ${output}`,
  );
} finally {
  await browser?.close();
  if (server && server.exitCode === null) server.kill("SIGTERM");
}
