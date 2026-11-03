# MOLI’s Lucky Day

A complete, mobile-first H5 mini-game built with React, Vite, JavaScript, and CSS. Meet an original illustrated marimo companion, check in with your mood, draw a thoughtful tarot card, and save your personalized lucky guide.

**Independent Concept Project · Not an Official Collaboration**

Tarot and lucky recommendations are playful entertainment and self-reflection, not factual predictions. No login, payment, AI API, database, or backend is needed. All artwork is original, self-contained SVG.

## Develop

Use Node.js 24 and npm:

```sh
npm ci
npm run dev
```

Open the development server at its `/moli-luck-day/` path. The repository is already an isolated checkout; use it directly without creating a Git worktree.

## Play

1. Choose **Start My Lucky Day**, then select Happy, Calm, Anxious, Tired, or Unsure. MOLI reacts with a gentle message.
2. Choose **Discover My Fortune** and pick one of three face-down cards. The selected card flips and locks your choice.
3. Choose **Reveal My Lucky Guide** for your tarot reading, lucky color, outfit, food, item, number, daily affirmation, MOLI’s message, tip, and energy.
4. **Save My Lucky Card** creates a real 1080 × 1920 PNG from your current result. **Share My Luck** opens the same preview with native sharing where supported and a working download fallback. On iOS, the preview can also be saved with a long press.
5. **Play Again** starts a fresh reading from mood selection.

The six current tarot cards are The Sun, The Star, The Moon, The Empress, The Fool, and The World. Readings vary by mood and card, and recommendations remain fixed throughout the reading.

Your latest reading is saved using the device’s local date and can be revisited on the same day. Older readings are migrated without changing their original recommendations; legacy The Lovers and Lost readings remain viewable. If browser storage is blocked, the game still works in memory and supports image saving.

## Bring MOLI Home

The optional **Bring MOLI Home** feature overlays MOLI on your surroundings. Camera access is requested only after you open the feature and explicitly choose **Start Camera**. Move MOLI, adjust its size, and capture a local PNG. Closing the camera view stops its media tracks.

This is a camera overlay, not spatial AR. Camera images are never uploaded to a server. If access is denied or unsupported, choose **Use a cozy backdrop** to create a picture without camera access. Real camera access generally requires HTTPS or localhost, a supported browser, and the user’s permission.

## Validate and build

```sh
npm test
npm run build
npm run test:e2e
npm run preview
```

The production site is generated in `dist/`. The preview URL is `http://localhost:4173/moli-luck-day/`. For browser checks, install Chromium for Playwright with `npx playwright install chromium`, or use an existing system Chromium. Set `CHROMIUM_PATH` when its executable is elsewhere.

The browser suite starts and stops its own production preview, tests the full mobile journey and persistence, checks the GitHub Pages subpath and assets, verifies real PNG downloads and sharing fallbacks, exercises camera denial and its fallback, and checks phone, tablet, and desktop widths. Screenshots and generated PNGs are written to ignored `test-results/`. Set `TEST_URL` to test an already running site, including its `/moli-luck-day/` path.

## Publish through GitHub Pages

Use the existing repository: **985656040-rgb/moli-luck-day**. Vite’s production base is explicitly `/moli-luck-day/` so scripts, styles, reloads, and shared links work beneath the project path.

1. Open the repository’s **Settings → Pages → Build and deployment**.
2. Set **Source** to **GitHub Actions**. If the option is unavailable, the repository owner must enable Pages for the repository or organization.
3. Push the completed project to `main`, or open **Actions → Deploy MOLI to GitHub Pages → Run workflow**.
4. Wait for both **build** and **deploy** jobs to succeed. The workflow installs locked dependencies, runs the data tests, builds production assets, checks the browser journey, and publishes `dist/` using the official Pages actions.
5. Open the HTTPS URL from the successful deployment and verify a complete reading and PNG download on your phone.

The intended address is **https://985656040-rgb.github.io/moli-luck-day/**. This address is a deployment target, not proof that the site is already live. Confirm the workflow and live response before sharing it with a recruiter.

The workflow uses `contents: read`, `pages: write`, and `id-token: write`; no deployment token is stored in the source. Native file sharing depends on browser support; image download remains available where sharing is unsupported.
