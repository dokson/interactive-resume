# AGENTS.md

Single source of truth for AI coding agents (Claude Code, Cursor, OpenAI Codex CLI, Cline, Aider, Gemini CLI, etc.) working with code in this repository. `CLAUDE.md` is a one-line `@AGENTS.md` pointer so Claude Code picks it up automatically.

## Commands

```bash
npm install          # install dependencies (required before first build)
npm run deploy       # full build pipeline: inject-seo → minify → generate-manifest → generate-sitemap → copy-libs → generate-llms → generate-robots
npm test             # run visual regression + game behaviour tests (Playwright)
npm run test:update  # update baseline screenshots after intentional visual changes
```

After any JS/CSS/HTML change, run `npm run deploy && npm test` before committing. If a visual regression test fails unexpectedly, investigate the diff in `test-results/` before updating baselines; run `npm run test:update` only when the visual change is intentional.

Individual build steps can be run in isolation:

```bash
npm run deploy:inject-seo         # inject JSON-LD from src/json/seo-meta.json into dist/index.html
npm run deploy:minify             # minify JS → dist/*.min.js, CSS → dist/*.min.css, HTML → dist/*.html
npm run deploy:generate-manifest  # generate dist/site.webmanifest from package.json metadata
npm run deploy:generate-sitemap   # generate sitemap.xml; lastmod = last git commit touching each page's content (CI checks out full history)
npm run deploy:copy-libs          # copy npm dependency bundles (jQuery, EmailJS) into dist/
npm run deploy:generate-llms      # resolve __PLACEHOLDER__ tokens in llms.txt → dist/llms.txt
npm run deploy:generate-robots    # resolve __PLACEHOLDER__ tokens in robots.txt → dist/robots.txt
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

### Centralized contact/social placeholders

Contact and identity data (email, phone, LinkedIn, GitHub, X/Twitter, Wikidata, consulting brand, education, site URL/domain, profile image path) live **only** in `package.json`'s `config.contact` / `config.social` / `config.consulting` / `config.education` / `config.images` blocks. Source files (`about.html`, `index.html`, `404.html`, `src/json/seo-meta.json`, `llms.txt`, `robots.txt`) reference these via `__PLACEHOLDER__` tokens (e.g. `__EMAIL__`, `__PHONE_TEL__`, `__LINKEDIN__`, `__SITE_URL__`) — never hardcode the literal value in a source file. `src/build/placeholders.js` is the single module computing every token (including derived/obfuscated variants like `__EMAIL_OBFUSCATED__` and `__TWITTER_HANDLE__`); `minify.js`, `inject-seo.js`, `generate-llms.js`, and `generate-robots.js` all call its `buildReplacements`/`applyReplacements`. To change contact info, edit `package.json` only — never grep-and-replace across HTML/JSON/txt files. `llms.txt` and `robots.txt` at the repo root are **templates** (committed with literal `__PLACEHOLDER__` text, same as `about.html`'s `__BUILD_TIMESTAMP__`); their resolved output goes to `dist/`, and the CI workflow (`mv dist/llms.txt llms.txt`, `mv dist/robots.txt robots.txt`) promotes the resolved version to root only in the ephemeral deploy runner, never committed.

**Known trade-off**: `npm test` and any local preview serve the raw root files directly (`npx serve .`, see `playwright.config.js`), so `href`/`src` attributes built from placeholders (e.g. `href=__LINKEDIN__`) are literal, unresolved, non-navigable strings until `npm run deploy` has run. Always run `npm run deploy` before manually clicking through links in a local preview. This does not affect the deployed site (CI always resolves before publishing).

### External libraries

jQuery and `@emailjs/browser` are npm dependencies. The `copy-libs` step extracts their pre-built browser bundles into `dist/` so `index.html` can load them as local scripts. `config.build.externalLibs` in `package.json` defines which file to extract from each package.

### Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which runs `npm ci && npm start`, then assembles `deploy/` (merging `dist/`, static assets, and root HTML files) and force-pushes it to `gh-pages` via `peaceiris/actions-gh-pages`. The live site uses CNAME `www.colace.me`.

### JS module structure

All source JS lives in `src/js/`. The build minifies every file individually; no bundler is used. All functions are global declarations — the TypeScript server will flag cross-file globals as "undefined", but these are **always false positives**. Do not add imports, exports, or workarounds for them.

`index.html` loads scripts in this exact order (load order matters):

```
─── <head> ────────────────────────────────
jquery.min.js, easing.min.js
config.min.js                                ← gameConfig: every tunable number (read-only)
─── <body> ────────────────────────────────
preloader.min.js                             ← C64 preloader, starts its sequence immediately
container-transparent-or-displaynone.min.js  ← declares deviceName + containerDiv
─── (EmailJS) ─────────────────────────────
email.min.js
init.min.js
ale.min.js
layers.min.js
animation.min.js                             ← scene lifecycle + setRafInterval/clearRafInterval utility
contact.min.js                               ← has top-level emailjs.init() + initContactButton()
state.min.js                                 ← global state, DOM refs, bosses, sea species, scenes
main.min.js                                  ← must be last: bootstrap + window event handlers
```

Module responsibilities:

- **`config.js`** — `gameConfig`, deep-frozen: every duration, interval, distance, sprite frame and layout ratio of the game, grouped by component (preloader, ale, world, plants, buildings, experience, bosses, seaAnimals, sea, stars, scrollHint, links, contact, fireworks). **Change behaviour here, not in the modules.**
- **`container-transparent-or-displaynone.js`** — Device detection (`deviceName`) via feature detection (`ontouchstart`/`maxTouchPoints`) and `containerDiv` declaration
- **`preloader.js`** — Commodore 64 preloader: tape-loading sequence (starts immediately), then `finishPreloader()` (called on `window.onload`, returns a Promise) waits for the sequence, shows a `RUN` prompt and hides the preloader on click/tap/key. Uses `font/C64_Pro_Mono-STYLE.woff` (Style64 license: keep the file unmodified and with its original name)
- **`ale.js`** — Ale character: movement, jump/fall/swim, sprite frames (`setAleFrame`), eyes, orientation, happy state
- **`layers.js`** — Layer system, scroll/swipe, scroll phases (`setLayersMovement`), page dimensions, sea shift, touch events, world rise after RUN
- **`animation.js`** — Scene behaviours (plants, buildings, bosses, sea animals, piecharts), scene lifecycle (`resetScenes`/`layoutScenes`/`resizeScenes`/`triggerEnteredScenes`), stars, scroll hint, rAF interval utility
- **`contact.js`** — Contact section, links, fireworks, EmailJS send; has top-level `emailjs.init()` and `initContactButton()` calls
- **`init.js`** — `storeDivs()` (DOM collection), `initVariablesAfterShowContainer()`, `resetVariables()`/`resetFunctions()` (delegate to the scene lifecycle)
- **`state.js`** — Global state namespaces, DOM element declarations, `LayersMovement` phases, `bosses`, `seaAnimalSpecies` and the **`scenes`** registry
- **`main.js`** — Bootstrap and `window` event handlers (`onload`, `onscroll`, `onresize`, `orientationchange`)
- **`easing.js`** — Custom jQuery UI easing functions (easeInCubic, easeOutCubic, easeOutElastic)

### Scenes (state.js)

Every animated section of the world is one entry in `scenes`, carrying its whole lifecycle: `world` (`"land"` or `"sea"`; sea containers live inside `#sea-1`), `container` (its horizontal span triggers `enter` when the viewport centre crosses into it), `reset()` (restore the "not yet played" state, on load and when scrolling back to the start), `layout()` (place elements for the current state), optional `resize()`, and `enter()` (entry animation or idle loop). Bosses and sea animals are generated from the `bosses` / `seaAnimalSpecies` arrays by `createBossScene` / `createSeaAnimalScene`. **To add a scene:** add its markup, its tunables in `gameConfig`, its behaviour functions in `animation.js`, then one object in `scenes`.

### Scroll phases

`scrollState.layersMovement` is one of `LayersMovement.horizontal` (walking through the world), `.vertical` (climbing to the contact section), `.walkingToRocket` (last `gameConfig.world.aleToRocketDistance` px) and `.atRocket` (end of the page: links, fireworks, happy Ale). Compare against the `LayersMovement` constants, never string literals.

### Timing map

How the timings in `gameConfig` chain together (values in ms at today's config). Changing one link shifts everything after it.

| Sequence | Chain | Total |
|---|---|---|
| Preloader | `startDelay` 300 → type `LOAD` (4 × `typeCharInterval` 110 + `afterTypePause` 250) → `pressPlayPause` 500 → `okPause` 300 → `searchingPause` 600 → `foundPause` 400 → raster stripes `loadingStripesDuration` 700 | ≈ 3.5 s, then waits for page load **and** the RUN input |
| RUN → playable | type `RUN` (3 × 110 + 250) → `runBlankDuration` 120 → world rise `world.riseDuration` 1000 (also sets the CSS transition) → scroll enabled + Ale drop `ale.introDrop.duration` 500 | ≈ 1.7 s to scrolling, 2.2 s until Ale can run |
| Jump onto an elevation | `jump.upDuration` 300 (rises `jump.height` px) → `jump.downDuration` 300 | 600; falling off = `fallDuration` 300 |
| Swim stroke | up `swim.upMsPerPx` × scroll delta → down `swim.downMsPerPx` × delta (delta capped at sea height − Ale height) | down always takes 2× up |
| Sea layer shift | moves `seaShiftStep` px every `seaShiftInterval` ms (1 px/ms) over `seaShiftRatio` × viewport height | ≈ 540 at 720 px height |
| Boss entry | `enterDuration` (robot/squid 1000, alien 300) → piechart fade `experience.piechartFadeDuration` 500 → three text pairs every `piechartTextStagger` 300, each `piechartTextDuration` 1000; idle loop starts at landing. Text + chain drop in parallel over `dropDuration` 1000 | robot/squid 3100, alien 2400 |
| Plants / buildings | item *i* starts at `stagger` × *i* (300), runs `duration` (800 / 1000) | plants 1700, buildings 1600 |
| Sea animals | animal *i* starts at `stagger` × *i* (100), swims `swimInDistance` px in `duration` 600 | 600 + 100 × (count − 1) |
| Fireworks | one firework every `launchInterval` 1000; each draws `rows` rings × `ringInterval` 40 = 320, then fades `fadeDuration` 1000 | new launch before the previous fade ends |
| Idle cycles | Ale blink every `ale.blinkInterval` 4000 for 300 · sea animals every 3000 for 300 · alien eyes every 700 closed 230 · stars cycle a 4-colour Super Star palette every `stars.interval` 100 · scroll hint every 1000 visible 500 · robot hands every 4000 (frame 100) · squid hands every 4000 (8 toggles × 200) · alien steer ±15° step 5° every 100 | independent loops |

### Global state namespaces (state.js)

Global mutable state is organized into four namespace objects to reduce global pollution and clarify ownership:

- **`ale`** — Character physics & sprite state (isJumping, isFalling, isSwimming, frameIndex, elevations, etc.)
- **`scrollState`** — Page position, touch coordinates, layers movement phase. Named `scrollState` (not `scroll`) to avoid overwriting the native `window.scroll` function.
- **`flags`** — Animation control booleans (canAnimatePlant, canDrawFireworks, starPaletteIndex, etc.); per-boss and per-species state lives on the `bosses` / `seaAnimalSpecies` objects (`canAnimate`, `isAnimating`)
- **`timers`** — All timer IDs (blinkAleEyes, shiftAleFrame, stars, alienEyes, drawFirework, etc.)

DOM elements, arrays and counters remain as individual `var` declarations; tunable numbers belong in `gameConfig`.

### Animation approach

- **jQuery `.animate()`** is used for movement animations (parallax, character positioning, slide-ins)
- **`setRafInterval` / `clearRafInterval`** (defined in `animation.js`) wraps `requestAnimationFrame` with timestamp-based throttling. Used for visual cyclic animations (robot hands, squid hands, alien steer, fireworks, stars blink, alien eyes, Ale eyes). Benefits: syncs with display refresh, auto-pauses in background tabs.
- **`flashElement(element, ms)`** (in `animation.js`) shows an overlay immediately and hides it after `ms` — use it for every blink (Ale, alien, sea animals, scroll hint). Never pair a 0 ms `fadeTo` with a following `.stop()`: the fade only applies on the next jQuery tick, so `.stop()` cancels it and the blink is lost.
- **`setInterval`** is still used for periodic non-visual triggers (bubble creation every 3s, sea animal blink every 3s, etc.)
- **Prefer composited CSS transitions (`transform`/`opacity`) over jQuery `.animate()` on layout properties** (`bottom`, `top`, `left`, `width`, `height`) for animations that run during page load or otherwise affect visible layout — animating layout properties triggers reflow and Cumulative Layout Shift. Example: the world rise after RUN toggles `.layer-risen` (`transform`) instead of animating `top`.

### Testing

`npm test` runs two Playwright suites (locally only; `npm run deploy` first):

- **`tests/visual-regression.spec.js`** — screenshot comparison of the preloader and 12 scroll positions. Baselines in `tests/visual-regression.spec.js-snapshots/` (platform-specific `*-chromium-win32.png`), fail above 1% pixel difference. The section tests click `RUN`, then `settleGameAnimations()` finishes jQuery animations in the experience sections and stops the JS-driven cycles (stars, alien steer) in their rest state, because the CSS animation kill switch doesn't reach them.
- **`tests/game.spec.js`** — behaviour tests in the real page: preloader sequence and RUN (click/key), frozen `gameConfig`, scene registry integrity, scene entry/reset, boss landing, scroll phases, progress bar, sea enter/leave, contact form validation, rAF interval utility, sitemap output.
- `npm run test:update` — regenerate baselines after intentional visual changes only
- Playwright config: `playwright.config.js` (uses `serve` as webServer on port 3000)

### Piechart objects

Piecharts use a helper `getPiechartElements(prefix)` that returns an object with properties: `front`, `graphic1`, `graphic2`, `animation1`, `animation2`, `code1`, `code2`. They are attached to each boss (`boss.piechart`) and also stored as `piechartRobot`, `piechartSquid`, `piechartAlien`. Do NOT create individual alias variables for piechart elements.

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
- **Nested loops use distinct counters** (`i`/`j`): a shared name shadows with `let` and clobbers with `var`.

## Architecture & Maintenance Guidelines

- **SEO & Metadata**: To keep SEO optimal according to most recent standards:
  - Update `src/json/seo-meta.json` to change the Schema.org `Person` JSON-LD injects.
  - Update `index.html` `<head>` tags to change Open Graph (`og:*`), Twitter Cards (`twitter:*`), and standard meta descriptions. ALWAYS ensure `og:image` and `twitter:image` are defined.
  - Update `package.json` -> `config.keywords` to change the site manifest keywords.
  - **Periodic SEO audits**: the `.claude/claude-seo/` git submodule (from `AgriciDaniel/claude-seo`) ships specialised SEO skills (`seo-audit`, `seo-page`, `seo-schema`, `seo-technical`, `seo-geo`, ...). Use them every few months — or after any significant content/meta change — to re-audit the site. The skills aren't auto-loaded into Claude Code (they live outside `.claude/skills/`), so either copy/symlink the desired skill folder into `.claude/skills/`, run the repo's `install.ps1`/`install.sh`, or invoke the methodology manually by reading the relevant `SKILL.md`. Apply findings to `index.html`, `about.html`, `seo-meta.json`, `llms.txt`, `robots.txt`, and the build pipeline as appropriate.
  - `robots.txt` (root, template) lists per-crawler rules grouped by category — search engines (Googlebot, Bingbot, YandexBot, Applebot), social preview crawlers (Twitterbot, facebookexternalhit, LinkedInBot), and AI answer engines/GEO (GPTBot, OAI-SearchBot, and other named training/user-fetch/search-index bot tokens). When adding a new crawler, place it in the matching category and keep the `Disallow: /document/cv.pdf` line consistent with the others.
- **Image Directory Structure**: Images in the `image/` directory must be categorized semantically to match the JS modules they belong to. When adding new images, place them in the appropriate subfolder (`image/ale/`, `image/animation/`, `image/contact/`, or `image/layers/`). **NEVER** place images directly in the root `image/` directory; every image must belong to one of these specific sections.
- **Adding External Libraries**: If you `npm install` a new frontend dependency:
  1. Add it to `package.json` -> `config.build.externalLibs`.
  2. Reference the copied `.min.js` file in `index.html` or `cv.html`.
  3. Run `npm run deploy:copy-libs` to sync it to `dist/`.
- **Namespace naming**: Never use browser built-in names (`scroll`, `location`, `history`, `navigator`, `screen`) for global namespace objects. Use descriptive alternatives (`scrollState`, etc.).
