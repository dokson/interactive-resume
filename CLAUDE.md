# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # install dependencies (required before first build)
npm run deploy       # full build pipeline: inject-seo → minify → generate-manifest → copy-libs
npm test             # run visual regression tests (compare screenshots against baselines)
npm run test:update  # update baseline screenshots after intentional visual changes
```

**IMPORTANT**: After any JS/CSS/HTML change, always run `npm run deploy && npm test` before committing. If a visual regression test fails unexpectedly, investigate the diff in `test-results/` before updating baselines. Only run `npm run test:update` when the visual change is intentional.

Individual build steps can be run in isolation:

```bash
npm run deploy:inject-seo         # inject JSON-LD from src/json/seo-meta.json into dist/index.html
npm run deploy:minify             # minify JS → dist/*.min.js, CSS → dist/*.min.css, HTML → dist/*.html
npm run deploy:generate-manifest  # generate dist/site.webmanifest from package.json metadata
npm run deploy:generate-sitemap   # dynamically generate sitemap.xml with the latest build date
npm run deploy:copy-libs          # copy npm dependency bundles (jQuery, EmailJS) into dist/
```

## Architecture

This is a static HTML/CSS/JS site with a Node.js-only build pipeline. There is no framework.

### Source vs. dist

- **`index.html`, `cv.html`, `404.html`, `about.html`** are source HTML files. `index.html` is the entry point for the interactive resume and references assets from `dist/` (minified JS/CSS) and static directories (`image/`, `font/`).
- **`dist/`** is the build output directory. It is not committed. The CI workflow assembles `deploy/` from `dist/` plus static directories before pushing to `gh-pages`.
- **`src/js/`** and **`src/css/`** contain the editable source files. Every `.js` is minified to `.min.js` in `dist/`, every `.css` to `.min.css`. `index.html` is also minified in-place in `dist/` (after SEO injection); `cv.html`, `404.html`, and `about.html` are minified from root into `dist/`. **Never edit files in `dist/` directly** — all changes must be made to source files.

### SEO injection

`src/json/seo-meta.json` holds a Schema.org `Person` JSON-LD object. The inject-seo build step reads this and appends it as a `<script type="application/ld+json">` block just before `</head>` in `dist/index.html`. Edit `seo-meta.json` to update structured data without touching `index.html`.

### package.json as config hub

Build behaviour, web manifest values, external lib paths, and SEO keywords are all driven by `package.json`'s `config` block — not by separate config files. The build scripts read it directly via `require('../../package.json')`.

### External libraries

jQuery and `@emailjs/browser` are npm dependencies. The `copy-libs` step extracts their pre-built browser bundles into `dist/` so `index.html` can load them as local scripts. `config.build.externalLibs` in `package.json` defines which file to extract from each package.

### Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which runs `npm ci && npm start`, then assembles `deploy/` (merging `dist/`, static assets, and root HTML files) and force-pushes it to `gh-pages` via `peaceiris/actions-gh-pages`. The live site uses CNAME `www.colace.me`.

### JS module structure

All source JS lives in `src/js/`. The build minifies every file individually; no bundler is used. All functions are global declarations — the TypeScript server will flag cross-file globals as "undefined", but these are **always false positives**. Do not add imports, exports, or workarounds for them.

`index.html` loads scripts in this exact order (load order matters):

```
─── (jQuery + easing.js) ──────────────────
container-transparent-or-displaynone.min.js  ← declares deviceName + containerDiv
preloader.min.js                             ← declares preloaderDiv
─── (EmailJS) ─────────────────────────────
email.min.js
init.min.js
ale.min.js
layers.min.js
animation.min.js                             ← declares setRafInterval/clearRafInterval utility
contact.min.js                               ← has top-level emailjs.init() + initContactButton()
state.min.js                                 ← must be last: declares all global state + event handlers
```

Module responsibilities:

- **`container-transparent-or-displaynone.js`** — Device detection (`deviceName`) via feature detection (`ontouchstart`/`maxTouchPoints`) and `containerDiv` declaration
- **`preloader.js`** — Preloader bootstrap: `preloaderDiv` declaration, show/hide/shift-up preloader
- **`ale.js`** — Ale character: movement, jump/fall/swim, eyes, orientation, happy state
- **`layers.js`** — Layer system, scroll/swipe, page dimensions, horizontal shift, touch events
- **`animation.js`** — About/sea/experience animations, scroll hint, rAF interval utility
- **`contact.js`** — Contact section, fireworks, EmailJS send; has top-level `emailjs.init()` and `initContactButton()` calls
- **`init.js`** — `collectElements()`, `storeDivs()`, `initVariablesAfterShowContainer()`, `resetVariables()`, `resetFunctions()`
- **`state.js`** — All global state organized in namespace objects (`ale`, `scrollState`, `flags`, `timers`) + DOM element declarations + window event handlers
- **`easing.js`** — Custom jQuery UI easing functions (easeInCubic, easeOutCubic, easeOutElastic)

### Global state namespaces (state.js)

Global mutable state is organized into four namespace objects to reduce global pollution and clarify ownership:

- **`ale`** — Character physics & sprite state (isJumping, isFalling, isSwimming, frameIndex, elevations, etc.)
- **`scrollState`** — Page position, touch coordinates, layers movement mode. Named `scrollState` (not `scroll`) to avoid overwriting the native `window.scroll` function.
- **`flags`** — Animation control booleans (canAnimatePlant, canAnimateRobot, canDrawFireworks, etc.)
- **`timers`** — All timer IDs (blinkAleEyes, shiftAleFrame, stars, alienEyes, drawFirework, etc.)

DOM elements, arrays, counters, and constants remain as individual `var` declarations.

### Animation approach

- **jQuery `.animate()`** is used for movement animations (parallax, character positioning, slide-ins)
- **`setRafInterval` / `clearRafInterval`** (defined in `animation.js`) wraps `requestAnimationFrame` with timestamp-based throttling. Used for visual cyclic animations (robot hands, squid hands, alien steer, fireworks, stars blink, alien eyes, Ale eyes). Benefits: syncs with display refresh, auto-pauses in background tabs.
- **`setInterval`** is still used for periodic non-visual triggers (bubble creation every 3s, sea animal blink every 3s, etc.)

### Visual regression testing

Playwright-based screenshot comparison across 12 key scroll positions. Baselines are stored in `tests/visual-regression.spec.js-snapshots/` and committed to git. Tests run locally only (baselines are platform-specific: `*-chromium-win32.png`).

- `npm test` — compare current state against baselines (fails if >1% pixel difference)
- `npm run test:update` — regenerate baselines after intentional visual changes
- Playwright config: `playwright.config.js` (uses `serve` as webServer on port 3000)

### Piechart objects

Piecharts use a helper `getPiechartElements(prefix)` that returns an object with properties: `front`, `graphic1`, `graphic2`, `animation1`, `animation2`, `code1`, `code2`. These are stored as `piechartRobot`, `piechartSquid`, `piechartAlien` — access elements via `piechartRobot.front`, `piechartRobot.code1`, etc. Do NOT create individual alias variables for piechart elements.

## Coding Standards & Best Practices

When editing JavaScript files in `src/js/`, please adhere to the following:

- **Use `const`/`let`**, never `var` inside functions. Global state in `state.js` uses `var` (required for cross-file scope without modules).
- **Use arrow functions** for all anonymous callbacks (`() => { }`, not `function () { }`). Keep named function declarations as `function name() { }`.
- **Use template literals** for string concatenation with values: `` `${value}px` ``, not `value + "px"`.
- **Use `for...of`** where the loop index is not needed. Keep `for (let i = ...)` when the index is used for parallel array access or staggered delays.
- **Use `className`** instead of `setAttribute("class", ...)` for class manipulation.
- **Use `querySelectorAll`** for DOM collection instead of manual `getElementsByTagName` loops.
- **Use meaningful variable names**: `elevationIndex`, `animalArray`, `topOffset` — never single-letter names like `e`, `t`, `i`, `n` for anything other than simple loop counters.
- **Avoid Yoda conditions**: Write `variable === val` instead of `val === variable`.
- **Avoid comma operators**: Do not chain expressions with commas. Write them as separate statements.
- **No scientific notation**: Write `1000`, `2000`, not `1e3`, `2e3`.
- **No `setTimeout` with strings**: Always use the function form.
- **HTML Formatting**: Do not use automatic line-wrapping or formatters that wrap long HTML lines (e.g., in `index.html`). The extensive use of inline classes and IDs for animations means that line breaks mid-tag will destroy the layout. Use settings like `"html.format.wrapLineLength": 0`.
- **IMPORTANT**: When renaming loop variables from `e`→`i` in nested loops, verify that inner and outer loops don't share the same variable name. With `var` this silently worked; with `let` it would shadow, but with `var` (in older code) it caused the container visibility bug. Use `i`/`j` for nested loops.

## Architecture & Maintenance Guidelines

- **SEO & Metadata**: To keep SEO optimal according to most recent standards:
  - Update `src/json/seo-meta.json` to change the Schema.org `Person` JSON-LD injects.
  - Update `index.html` `<head>` tags to change Open Graph (`og:*`), Twitter Cards (`twitter:*`), and standard meta descriptions. ALWAYS ensure `og:image` and `twitter:image` are defined.
  - Update `package.json` -> `config.keywords` to change the site manifest keywords.
- **Image Directory Structure**: Images in the `image/` directory must be categorized semantically to match the JS modules they belong to. When adding new images, place them in the appropriate subfolder (`image/ale/`, `image/animation/`, `image/contact/`, or `image/layers/`). **NEVER** place images directly in the root `image/` directory; every image must belong to one of these specific sections.
- **Adding External Libraries**: If you `npm install` a new frontend dependency:
  1. Add it to `package.json` -> `config.build.externalLibs`.
  2. Reference the copied `.min.js` file in `index.html` or `cv.html`.
  3. Run `npm run deploy:copy-libs` to sync it to `dist/`.
- **Namespace naming**: Never use browser built-in names (`scroll`, `location`, `history`, `navigator`, `screen`) for global namespace objects. Use descriptive alternatives (`scrollState`, etc.).
