# MOLI’s Lucky Day

A complete, mobile-first H5 mini-game built with React, Vite, JavaScript, and CSS. Meet an original illustrated marimo companion, check in with your mood, draw a tarot card, and save your personalized lucky guide.

An independent, unofficial portfolio concept. Tarot and lucky recommendations are playful entertainment and self-reflection, not factual predictions.

## Develop

Use Node.js 24 and npm. No accounts, API keys, server, or database are required.

```sh
npm ci
npm run dev
```

The repository is already an isolated checkout; use it directly without creating a Git worktree. All illustrations are original inline SVGs. The app makes no external AI or image requests.

## Play

1. Choose **Find My Luck** and select Happy, Anxious, Tired, or Lost.
2. Continue and tap one of three cards. The selected card flips to reveal one of six original tarot illustrations.
3. Choose **Reveal My Luck** for your mood-based message, lucky color, outfit, food, charm, tip, and energy.
4. **Save My Luck** generates a real 1080 × 1920 PNG from your current result. Download it or use native sharing on supported devices. On iOS, the image preview can also be saved with a long press.
5. **Try Again** starts a fresh reading from mood selection.

The latest reading is stored locally using the device’s local date and can be revisited on the same day. Recommendations remain fixed throughout a reading. Storage may be unavailable in restricted browser sessions; the current reading still works in memory.

## Validate and build

```sh
npm test
npm run build
npm run preview
```

The production site is generated in `dist/`. `npm run preview` serves that build for local validation. For browser checks, install Chromium for Playwright (`npx playwright install chromium`) or use an existing system Chromium, then run `npm run test:e2e`. The browser suite uses the production preview server and can be pointed at another server with `TEST_URL`.

## Publish one public HTTPS URL

### GitHub Pages

The included `.github/workflows/deploy.yml` builds and deploys on pushes to `main` or a manual workflow run. In this repository’s **Settings → Pages → Build and deployment**, select **GitHub Actions**. Push the project files to `main`, then wait for the **Deploy MOLI to GitHub Pages** workflow to succeed. Its deployment output provides the live HTTPS URL. The expected project URL is `https://985656040-rgb.github.io/moli-luck-day/`; it is only live after successful deployment.

Vite uses relative asset paths, so the app works at a project subpath. GitHub repository access and permission to configure Pages are required. This repository’s public hosting status must be verified after deployment.

### Netlify

For a quick manual deployment, run `npm run build`, open Netlify’s deploy interface, and upload the **contents of `dist/`**. Netlify supplies a public HTTPS address. For continuous deployment, import this repository; `netlify.toml` sets the build command and output directory.

### Vercel

Import this repository into Vercel, select the Vite preset, and deploy. `vercel.json` specifies the production build and `dist/` output. Vercel provides a public HTTPS URL.

Native file sharing depends on browser support and normally requires HTTPS. Download and image preview remain available when file sharing is unsupported. Public deployment requires the hosting account’s normal authorization; never put credentials in the source code.
