# AGENTS.md

Single source of truth for AI coding agents. `CLAUDE.md` only points here (`@AGENTS.md`).

## Commands

```bash
npm install          # once, before the first build
npm run deploy       # full build into dist/
npm test             # Playwright: visual regression + game behaviour
npm run test:update  # regenerate baselines (intentional visual changes only)
```

- After any JS/CSS/HTML change: `npm run deploy && npm test` before committing.
- Unexpected visual failure: inspect the diff in `test-results/` first. Update baselines only if the change is intentional.

`deploy` runs these steps in order; each also runs alone:

```bash
npm run deploy:inject-seo            # src/json/seo-meta.json → JSON-LD before </head> in dist/index.html
npm run deploy:minify                # JS → dist/*.min.js, CSS → dist/*.min.css, HTML → dist/*.html
npm run deploy:generate-manifest     # dist/site.webmanifest from package.json
npm run deploy:generate-sitemap      # sitemap.xml; lastmod from src/build/pages.js = last git commit touching each page (CI checks out full history)
npm run deploy:copy-libs             # npm bundles (jQuery) → dist/
npm run deploy:generate-llms         # llms.txt template → dist/llms.txt
npm run deploy:generate-robots       # robots.txt template → dist/robots.txt
npm run deploy:generate-logo-sprite  # image/logos/*.svg → <symbol> sprite dist/logos.svg
npm run deploy:version-assets        # every dist/ URL in dist/*.html gets ?v=<content hash>; must stay last
```

- Cache: Cloudflare gives static files a one-month browser cache, HTML ten minutes. Unversioned `dist/` URLs left phones on old JS/CSS under new HTML; `version-assets` changes a file's URL whenever its content changes.
- Source HTML keeps plain `dist/…` URLs (tests and local preview serve them); only the built pages are versioned. Files outside `dist/` (images, fonts) are not versioned: give a changed one a new name.

## Architecture

Static HTML/CSS/JS. No framework, no bundler. Node.js runs only the build.

### Source vs. dist

- Source HTML: `index.html` (the game; loads `dist/`, `image/`, `font/`), `cv.html`, `404.html`, `about.html`.
- Source JS/CSS: `src/js/`, `src/css/`, each file minified on its own to `dist/*.min.js` / `*.min.css`.
- `index.html` is minified in `dist/` after SEO injection; the other pages are minified from root into `dist/`.
- `dist/` is build output, not committed. **Never edit `dist/`**; change the sources.

### Config and placeholders

- `package.json` → `config` drives build behaviour, manifest values, external lib paths and SEO keywords. Build scripts `require` it; no other config files.
- Contact and identity data live **only** in `config.contact`, `config.social`, `config.consulting`, `config.education`, `config.images`.
- Sources reference them via `__PLACEHOLDER__` tokens (`__EMAIL__`, `__PHONE_TEL__`, `__LINKEDIN__`, `__SITE_URL__`…). Never hardcode the values.
- Token users: `about.html`, `index.html`, `404.html`, `src/json/seo-meta.json`, `llms.txt`, `robots.txt`.
- `src/build/placeholders.js` computes every token, derived ones included (`__PHONE_TEL__`, `__TWITTER_HANDLE__`).
- `minify.js`, `inject-seo.js`, `generate-llms.js`, `generate-robots.js` apply them via `buildReplacements`/`applyReplacements`.
- To change contact info, edit `package.json` only. Never grep-and-replace across files.
- Root `llms.txt` and `robots.txt` are committed templates with literal tokens (like `about.html`'s `__DATE_MODIFIED__`).
- Resolved copies go to `dist/`; CI moves them to root in the deploy runner only. Never commit them.
- `src/build/pages.js` lists indexable pages and their last content commit. It feeds sitemap `lastmod`, `about.html`'s `__DATE_MODIFIED__` and the index `ProfilePage` `dateModified`. A new indexable page must be added there.
- Trade-off: `npm test` and local preview serve raw root files (`npx serve .`). Placeholder links stay unresolved until `npm run deploy`; run it before clicking links locally.
- The deployed site is unaffected: CI always resolves before publishing.

### External libraries

- jQuery is the only npm runtime dependency. `copy-libs` copies the bundle named in `config.build.externalLibs` into `dist/`.
- To add a frontend dependency after `npm install`:
  1. Add it to `config.build.externalLibs`.
  2. Reference the copied `.min.js` in `index.html` or `cv.html`.
  3. Run `npm run deploy:copy-libs`.

### Deployment

- Push to `main` → `.github/workflows/deploy.yml`: `npm ci && npm start`, assemble `deploy/` (`dist/` + static assets + root HTML), force-push to `gh-pages`.
- Live site: CNAME `www.colace.me`.

## Game JS (`src/js/`)

- Every function is a global declaration; no modules.
- TypeScript flags cross-file globals as undefined. Always false positives: add no imports, exports or workarounds.

### Load order

`index.html` loads scripts in this exact order:

```text
<head>
jquery.min.js, easing.min.js
config.min.js                                ← gameConfig, used by everything after it
viewport.min.js                              ← deviceName + touch layout viewport, before any layout
<body>
preloader.min.js                             ← starts its sequence immediately
container-transparent-or-displaynone.min.js  ← declares containerDiv
init.min.js
ale.min.js
layers.min.js
cutscene.min.js
pipes.min.js
powerup.min.js
animation.min.js
ending.min.js
state.min.js
main.min.js                                  ← must be last: bootstrap + window handlers
```

### Modules

- `config.js`: `gameConfig`, deep-frozen. Every duration, interval, distance, sprite frame, layout ratio. **Change tunables here, not in modules.**
- `viewport.js`: `deviceName` (feature detection: `ontouchstart`/`maxTouchPoints`); on touch devices rewrites the viewport meta (see "Touch layout").
- `container-transparent-or-displaynone.js`: `containerDiv`.
- `preloader.js`: C64 tape-loading sequence. `finishPreloader()` (on `window.onload`, returns a Promise) shows `RUN`, hides on click/tap/key.
- `ale.js`: movement, jump/fall/swim, frames (`setAleFrame`), eyes, orientation, happy state.
- `layers.js`: layers, scroll/swipe, phases (`setLayersMovement`), page dimensions, camera shift (`shiftCamera`), touch, world rise after RUN.
- `cutscene.js`: runner for scripted moments that take the world over from the scroll (`startCutscene`, `finishCutscene`) and their shared steps (`settleAle`, `walkAle`, `panWorld`).
- `pipes.js`: levels and the Super Mario pipe warps between them (`handlePipes`).
- `powerup.js`: the ? block and mushroom that shave Ale between Bologna and Kyiv (`handlePowerUp`).
- `animation.js`: scene behaviours and lifecycle (`resetScenes`/`layoutScenes`/`resizeScenes`/`triggerEnteredScenes`), stars, scroll hint, rAF utility, `flashElement`.
- `ending.js`: fireworks, rocket portal (`setRocketBoardable`, `boardRocket`, `resetRocketLaunch`).
- `init.js`: `storeDivs()`; `resetVariables()`/`resetFunctions()` delegate to the scene lifecycle and stop the fireworks.
- `state.js`: state namespaces, DOM refs, `LayersMovement`, `bosses`, `seaAnimalSpecies`, `scenes`.
- `main.js`: bootstrap, `window` handlers (`onload`, `onscroll`, `onresize`, `orientationchange`). `onresize` (`handleResize`) is assigned at the end of `onload`: a resize while loading (address bar, rotation) would reach divs `storeDivs()` has not stored yet.
- `easing.js`: jQuery UI easings (easeInCubic, easeOutCubic, easeOutElastic).

### Global state (`state.js`)

- Namespaces: `ale` (physics, sprite, `isShaved`), `scrollState` (position, touch, phase, level), `flags` (animation booleans), `timers` (every timer ID), `cutscene` (the cutscene playing).
- Per-boss and per-species state (`canAnimate`, `isAnimating`) lives on the `bosses` / `seaAnimalSpecies` objects.
- DOM elements, arrays and counters stay individual `var`s. Tunable numbers go in `gameConfig`.
- Never name a global after a browser built-in (`scroll`, `location`, `history`, `navigator`, `screen`). Hence `scrollState`.

### Scenes

Each animated section is one `scenes` entry:

- `world`: `"land"` or `"sea"` (sea containers live inside `#sea-1`).
- `container`: `enter` fires when the viewport centre crosses into its horizontal span.
- `reset()`: restore "not yet played", on load and when scrolling back to the start.
- `layout()`: place elements for the current state; optional `resize()`.
- `enter()`: entry animation or idle loop.

Bosses and sea animals are generated from `bosses` / `seaAnimalSpecies` by `createBossScene` / `createSeaAnimalScene`.

**To add a scene:** markup → tunables in `gameConfig` → behaviour in `animation.js` → one object in `scenes`.

### Piecharts

- `getPiechartElements(prefix)` returns `front`, `graphic1`, `graphic2`, `animation1`, `animation2`, `code1`, `code2`.
- Stored on each boss (`boss.piechart`) and as `piechartRobot`, `piechartSquid`, `piechartAlien`. Do NOT add alias variables.

### Scroll phases and keyboard

- `scrollState.layersMovement` is `LayersMovement.horizontal` (world), `.vertical` (climb), `.walkingToRocket` (last `world.aleToRocketDistance` px) or `.atRocket` (page end).
- Compare against the `LayersMovement` constants, never string literals.
- Desktop: within 1px of the bottom counts as the end. Zoom/scaling makes `scrollY` fractional; its max can stop short of `pageDiv.offsetHeight - containerDiv.offsetHeight`.
- Arrows go through `handleArrowKeys` (`layers.js`): down/right forward, up/left back.
- Key repeats are ignored. A rAF loop scrolls at `keyboard.arrowScrollSpeed` px/ms until `keyup` or window blur.

### Levels and pipes

- `scrollState.level`: 1 (land), 2 (sea), 3 (land, to the end). The sea lies below the land: in level 2 the camera (`shiftCamera`) looks `world.seaShiftRatio` × viewport height lower.
- Each land level reaches the sea through one pipe: `divePipe` under the LEVEL 2 "WARP ZONE" sign (wooden board on two posts, CSS only), `climbPipe` under the LEVEL 3 gate. Parts: top mouth `.pipe-top` (an `.elevation` Ale jumps onto), shaft, run along the sea floor, side mouth `.pipe-mouth` in the sea's wall.
- `getPipeStops(pipe)`: scroll positions `land` (on the top mouth), `inside` (hidden in the side mouth), `sea` (just clear of it). A level is the range between stops: Ale never rests inside a pipe.
- `handlePipes()` runs on every scroll/swipe step, right after `handlePowerUp()`. Walking past a stop toward the other mouth plays the warp, a cutscene: settle on the stop → sink → camera transit (Ale hidden) → walk out; back the same in reverse.
- A step wider than the viewport (Home, End, test jumps) is no walk: the level follows the position (`getLevelAt`), clamped out of the pipes.
- Pipes are CSS (hard-stop gradients, original art) with `z-index: 1`, in front of `#ale-container`, so Ale vanishes into the mouths. Keep other world elements from overlapping them.

### Cutscenes

- `startCutscene(facing, endPosition, steps, onEnd)`: each step `start()`s once, then `frame(t)` runs every animation frame with `t` from 0 to 1 over its `duration`. Frames must be idempotent in `t`: `finishCutscene()` replays the rest at `t = 1`.
- The input is locked meanwhile: scroll, swipes, flings and arrows are dropped. At the end `moveInputTo` resyncs `scrollY` or the virtual finger, and scenes see the whole cutscene as one step.
- Resize/rotation: `finishCutscene()` lands a running one first, then the position is clamped to the new stops. Reduced motion: cutscenes land at once.
- Crossing needs more than 1px past a stop (`cutsceneCrossTolerance`): zoom makes `scrollY` fractional, and the resync after a cutscene must not read as a step back.
- A dispatch step with `delta === 0` does nothing: the resync scroll would otherwise start Ale's run cycle.

### Power-up (Bologna → Kyiv)

- Ale starts with his hair (`image/ale/ale-slides.png`). Between Bologna and Kyiv, where a platform used to be, a ? block floats 260px over the ground (Ale's hair is 176px tall).
- Walking under it plays the cutscene: settle → jump, head hits the block (it bumps and empties) → mushroom rises out of it → slides off the edge while Ale steps forward under it → drops onto his head → grow flicker into the shaved Ale (`ale-shave-slides.png`, `#ale.ale-shaved`).
- `ale.isShaved` never resets: Ale stays shaved going back, at the start too, until a reload. A jump past the block shaves him at once (`usePowerUp`).
- `handlePowerUp()` runs before `handlePipes()`: on a jump the pipes zero the delta it reads.
- Block and mushroom are original pixel art (inline SVG); the mushroom starts inside the block, which paints over it. `#ale` carries the shaved sheet as an off-box background so it is loaded before the flicker.

### Touch layout (mobile)

- `index.html` ships `width=1000`; `viewport.js` rewrites it on touch devices before the game markup is laid out. Desktop keeps the window width.
- Portrait: `viewport.portraitWidth` (600), so a 360px phone draws the world at 0.6× instead of 0.36×.
- Landscape: `max(viewport.minWidth, viewport.minHeight × innerWidth / innerHeight)`, so the layout is at least `minHeight` (680) tall: the 548px splash and its ribbon (bottom 20%) stay on screen.
- Recomputed only on an orientation change, never on resize: the address bar changes `innerHeight` on every swipe and the world would jump.
- Scenes wider than the layout (charts, bosses) pass by while swiping; only the screens that stay put adapt. `@media (max-width: 760px)` (portrait layout and narrow desktop windows) in `style.css`:
  - `#splash-container` shifts left by `--splash-shift` so the title's letters (x 549–1080 of 1300) sit centred at full size; its ribbon and swipe hint shift back.
  - `#banners-container` centres on the climb.
- `viewport.js` also puts `.touch-layout` on `<html>` (touch devices only, both orientations; desktop never). `style.css` uses it to enlarge the smallest labels: certification dates (18px) and names (16px, wrapping in the banner), skill chart headers (14px, filling the 150px column).
- Skill scale labels: BEGINNER, ELEMENTARY, COMPETENT, ADVANCED, EXPERT. ELEMENTARY (10 characters) is the longest a 14px header holds on one line: keep new labels at 10 characters or fewer.
- `touchmove`/`touchend` listeners are non-passive (document-level ones default to passive and `preventDefault()` was ignored: native scroll, address bar toggling, a relayout per swipe). `touchstart` stays passive.
- `html` has `text-size-adjust: 100%`: Android text autosizing would inflate fixed-size labels out of their boxes.
- Momentum (`startFling`/`stopFling`, `layers.js`): the world follows the finger 1:1, then a quick release keeps it gliding through the same swipe path (the virtual finger moves). Velocity from the last `touch.flingSampleWindow` ms, so a finger that paused before lifting does not glide.
- The glide decays by `touch.flingFriction` per ms (0.998, iOS's normal rate) and stops at either end, below `flingMinVelocity`, on the next `touchstart` or when swiping is disabled. Crossing the portrait world: about 14 quick flicks (84 without momentum).

### Animation

- jQuery `.animate()`: movement (parallax, positioning, slide-ins).
- `setRafInterval`/`clearRafInterval` (`animation.js`): throttled rAF for visual cycles. Syncs with refresh, pauses in background tabs.
- `setInterval`: non-visual periodic triggers only (bubbles, sea animal blink).
- Blinks: use `flashElement(element, ms)`. Never pair a 0 ms `fadeTo` with a following `.stop()`: the fade lands on the next jQuery tick, so `.stop()` cancels it.
- Prefer composited `transform`/`opacity` over animating `top`/`bottom`/`left`/`width`/`height` during load or on visible layout. Layout animation causes reflow and CLS.
- Example: the world rise after RUN toggles `.layer-risen` (`transform`) instead of animating `top`.

### Ending

- The ending's only link is the rocket to `about.html`; profiles, CV and contacts are on the About page.
- `#rocket` stays `inert` until `.atRocket`, then gets `.rocket-boardable` and its "BOARD ▶" sign.
- Rocket layers, back to front: `.rocket-back` (glass) → `#ale-container` (later sibling of `#rocket`) → `.rocket-container` (front frame, `z-index: 6`, porthole cut out).
- Only Ale's head shows through the porthole; `world.aleRocketPaddingBottom` lifts him there.
- **Never put a `transform` on `#rocket`.** It becomes a stacking context and pulls the front frame below Ale.
- Launch (click, tap, Enter): Web Animations API, composited `transform`, timings in `gameConfig.launch`. Then the page navigates.
- Reduced motion: the link navigates immediately. A back/forward-cache restore runs `resetRocketLaunch()`.
- `#about-sign` SVG faces are painted far-to-near so the nearer stroke wins.
- Fireworks: one `<canvas>` (`#fireworks-canvas`) behind sign, rocket and clouds; original pixel art on a `fireworks.cellSize` grid.
- Firework sprites are row strings in `FIREWORK_SPRITES` (`ending.js`). Never copy Nintendo's actual sprites.
- Fireworks launch only at `.atRocket`, finish in-flight ones elsewhere, and are skipped with reduced motion. `stopFireworks()` clears them.
- `hideStarsInFinalScene()` hides climb stars inside the final scene, on load and resize.
- Touch: `handleEnd` (`layers.js`) lets `touchend` on links through; cancelling it would swallow the tap's click.

### Ending on narrow windows

- Laid out for wide windows: rocket at `world.rocketMaxOffsetFromCenter`, Ale at `world.aleMaxOffsetFromCenter` + `aleToRocketDistance`.
- `positionRocketAndAleContainerHorizontally()` shifts both left until Ale ends `world.aleEndMarginRight` px inside the right edge.
- `positionAboutSign()` keeps `#title-about-me` `aboutSign.rocketGap` px clear of the rocket.
- It slides left until the first letter (`aboutSign.textLeft`, viewBox x) is `aboutSign.marginLeft` from the edge, then scales (`transform`) down to `aboutSign.minScale`.
- Current config: nothing moves from 1504px up; the side-by-side layout fits down to the 1000px landscape layout viewport.
- Below that (the 600px portrait layout), when even `minScale` would overlap the rocket, the sign floats above it: centred, scaled to the width, its top `aboutSign.aboveDepth` viewBox px ending `aboutSign.aboveRocketGap` px above the rocket (clear of "BOARD ▶"), the rest of the extrusion masked out. Only if that fits at `minScale` or more: windows also too short (e.g. desktop 800×600) keep the `minScale` sign beside the rocket.

### Timing map

How `gameConfig` timings chain. Changing one link shifts everything after it.

| Sequence           | Chain (ms)                                                                                                                                                                                                      | Total                                    |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Preloader          | `startDelay` 300 → `LOAD` (4 × `typeCharInterval` 110 + `afterTypePause` 250) → `pressPlayPause` 500 → `okPause` 300 → `searchingPause` 600 → `foundPause` 400 → `loadingStripesDuration` 700                   | ≈ 3.5 s, then waits for load **and** RUN |
| RUN → playable     | `RUN` (3 × 110 + 250) → `runBlankDuration` 120 → `world.riseDuration` 1000 (also the CSS transition) → scroll on + `ale.introDrop.duration` 500                                                                 | ≈ 1.7 s to scroll, 2.2 s to run          |
| Jump               | `jump.upDuration` 300 (`jump.height` px) → `jump.downDuration` 300; falling off: `fallDuration` 300                                                                                                             | 600                                      |
| Swim stroke        | up `swim.upMsPerPx` × delta → down `swim.downMsPerPx` × delta; delta ≤ sea height − Ale height                                                                                                                  | down = 2 × up                            |
| Pipe warp          | `cutscene.settleDuration` 250 → `pipes.sinkDuration` 800 (`sinkDepth` px) → `transitDuration` 700 (camera ± `world.seaShiftRatio` × viewport height) → `walkDuration` 700 (2 × `aleHalfWidth` px); back: reversed | ≈ 2.45 s                                 |
| Power-up           | `cutscene.settleDuration` 250 → `powerUp.jumpDuration` 200 → `fallDuration` 250 (block bump) → `riseDuration` 500 → `stepDuration` 300 (`stepDistance` px) → `dropDuration` 250 → `growDuration` 700 (flicker every `growFlickerInterval` 100) | ≈ 2.45 s                                 |
| Boss entry         | `enterDuration` (robot/squid 1000, alien 300) → `experience.piechartFadeDuration` 500 → 3 text pairs, `piechartTextStagger` 300 apart, `piechartTextDuration` 1000 each                                         | robot/squid 3100, alien 2400             |
| Plants / buildings | item *i* starts at `stagger` × *i* (300), runs `duration` (800 / 1000)                                                                                                                                          | 1700 / 1600                              |
| Sea animals        | animal *i* starts at `stagger` × *i* (100), swims `swimInDistance` px in `duration` 600                                                                                                                         | 600 + 100 × (n − 1)                      |
| Rocket launch      | `launch.aleWalkDuration` 500 → `aleClimbDuration` 250 → `ignitionDuration` 500 (shake ±`shakeDistance` px every `shakeInterval` 60, flame every `exhaustFlickerInterval` 80) → `liftOffDuration` 800 → navigate | ≈ 2.05 s                                 |
| Swipe glide        | release velocity *v* (layout px/ms, ≤ `touch.flingMaxVelocity` 8) × `flingFriction` 0.998 per ms until < `flingMinVelocity` 0.05; frames capped at `flingMaxFrame` 50                                         | ≈ 500 × *v* px, ≈ 2 s                    |

- Boss text and chain drop run in parallel over `dropDuration` 1000; the idle loop starts at landing.
- Fireworks (independent of the launch): a step every `frameInterval` 33; next volley of 1, 3 or 6 `volleyInterval` 1500 after the last, `volleyStagger` 280 apart.
- Fireworks shapes: burst `burstRadius` 3 steps × `burstFrameHold` 2; star `starGrowFrames` 12; sparks `particleLife` 36–54 frames, blinking the last `flickerFrames` 14; comet every `cometInterval` 1800–4000.
- Idle loops (every / for): Ale blink `ale.blinkInterval` 4000 / 300; sea animals 3000 / 300; alien eyes 700 / 230 closed; scroll hint 1000 / 500.
- More idle loops: stars palette (4 colours) every `stars.interval` 100; robot hands 4000 (frame 100); squid hands 4000 (8 × 200); alien steer ±15° in 5° steps every 100.
- Stars are original pixel art. Keep the sprite yellow: the palette is CSS filters on it.

## Coding standards (`src/js/`)

- `const`/`let`, never `var` inside functions. Globals in `state.js` use `var` (cross-file scope without modules).
- Arrow functions for anonymous callbacks; named functions stay `function name() { }`.
- Template literals: `` `${value}px` ``, not `value + "px"`.
- `for...of` when the index is unused; `for (let i = ...)` for parallel arrays or staggered delays.
- Nested loops use distinct counters (`i`/`j`): a shared name shadows with `let` and clobbers with `var`.
- `className`, not `setAttribute("class", ...)`. `querySelectorAll`, not `getElementsByTagName` loops.
- Meaningful names (`elevationIndex`, `topOffset`); single letters only for simple loop counters.
- No Yoda conditions, no comma operators, no scientific notation (`1000`, not `1e3`), no string `setTimeout`.
- HTML: never auto-wrap long lines (`"html.format.wrapLineLength": 0`). Mid-tag breaks destroy the layout.

## Fonts

- All in `font/`; each OFL font next to its `*-OFL.txt`.
- C64 Pro Mono (`C64_Pro_Mono-STYLE.woff`): preloader, whole 404 page. Style64 license: keep it unmodified, original name.
- Press Start 2P: game UI, About nav/chips/labels. It is wide: size text down rather than overflow fixed-width boxes.
- Jersey 15: long text. Bangers: ribbons, piecharts, About headings. Manrope: only the About COalesCE wordmark (Latin, 400).

## About page

- `about.html` + `src/css/about.css`, no JavaScript.
- Red is `#e3171f`, darkened from the game's `#ed1c24` so white text passes 4.5:1.
- Every box has rounded corners (`--radius`). Only page frames (top bar, `main`, footer, grass strip) and language-meter cells stay square.
- Functional text never below 11px (Press Start 2P).
- Ale sprite: `.sprite-ale`, frame k at `background-position: k/8 * 100%`.
- Company pills: `.pill` links inside a `.nobr` span with the following punctuation, so a comma never starts a line.
- Section order: Career → COalesCE → tech stack → certifications → education/languages → FAQ → contact.
- Tech stack lists products and tools only. Concepts (RAG, Agentic AI, MLOps…) go in the summary.
- Visible cards: Data Engineering, Data Platforms, Cloud. The other twelve sit in a native `<details>` "full toolbox".
- Skill card top colour follows grid position (`nth-child`), so cards move without class changes.
- Chips use `<use href=dist/logos.svg#NAME>`. Add a mark by dropping `image/logos/NAME.svg`; no mark available → text only.
- Contact buttons are icon-only: each needs `aria-label` and `title`.
- JSON-LD (`ProfilePage` + `BreadcrumbList` + `FAQPage`) describes only visible content.
- FAQ: one native `<details class="card faq">` per question (`<h3>` in the `<summary>`). Each answer is the `FAQPage` answer text word for word: change both together. Structured data for hidden text breaks Google's guidelines, so the index carries no FAQ.

## Images

- Every image goes in its module's subfolder: `image/ale/`, `image/animation/`, `image/ending/`, `image/layers/`. **Never** in `image/` root.
- About page: `image/certs/` (badges), `image/logos/` (tech marks), `image/about/` (career-map landmarks: WebP copies of the game's `image/layers/` art at 2× their largest displayed width; the game keeps the full-size PNGs).
- `image/layers/urchin.png` and `urchin-eyes.png` are unused on purpose (future sea species). Don't delete them.

### Brand marks

Applies to `image/logos/` and the summary-pill company marks.

- Prefer Simple Icons (CC0). Microsoft Fabric and Hermes Agent are MIT-licensed.
- Otherwise reduce the vendor's own SVG artwork (favicon symbol or logo) to one colour.
- No official SVG: trace the largest official PNG (e.g. Denodo, Jev with `shape-rendering="crispEdges"`).
- Wordmarks (YNAP) use `class="logo logo-wordmark"`: 42×12 instead of the 14px square. Traced wordmarks need `fill-rule="evenodd"`.
- Never redraw a mark by hand. Compare the result with the source at chip size.

## 404 page

- Standalone: only `dist/404.min.css` and `dist/404.min.js` (from `src/css/404.css`, `src/js/404.js`). No resume scripts, no `gameConfig`.
- **Absolute** asset paths: GitHub Pages serves it for missing URLs at any depth.
- Tunables: frozen `invadersConfig` at the top of `404.js`.
- `color-scheme: only light` (meta + `:root`) blocks Chrome's auto-dark; hover styles only under `(hover: hover)`.

### `#bsod`

- Crashed C64 session on `#0000aa`. Lines ≤ 40 characters with C64-accurate output (`READY.` placement, `62,FILE NOT FOUND,00,00`).
- `.bsod-path` shows the requested URL. Each `.bsod-block` fades in at `--step` × `--bsod-reveal-step`.
- Alien glitches start after `invadersConfig.glitch.startDelay` and pause while the BSOD is off-screen.
- PETSCII glyphs: C64 Pro Mono Private Use Area (`U+E000` + code). `▼`, `→`, `·` are missing: draw them in CSS.
- Reduced motion: `.bsod-garbage` rows stay static, nothing else moves.
- `ENTER` (Return on Mac) reboots to `/` from every state, even mid-match. Exception: a `:focus-visible` link or button gets activated instead.
- After `invadersConfig.autoDebugDelay` (5 s) the page scrolls to the game, unless the user scrolls, taps, clicks or presses a key.
- Three columns above 860px, one below: under it the 7px font floor would clip the 40-character columns.

### `#debugger` (404 Invaders)

- `<canvas>` game; 30 invaders form "404" (`invaderGlyphs`).
- Fire (Space) starts/resumes/continues; ←/→ or A/D move; hold fire to keep shooting. Touch: hold and drag.
- Touch/mouse outside play: a tap on the stage (release within `tapSlop` px, no `pointercancel`) starts/resumes/continues, so a scroll swipe never starts a game.
- Stage `touch-action`: `pan-y` (page scrolls) except while playing (`.invaders-playing`, set in `setGameState`): `none`, so the drag never turns into a scroll. Scroll away from the HUD.
- Keys are captured only while ≥ `viewThreshold` of the section is visible, so Space and arrows still scroll on the BSOD.
- Scrolling away, blur or a hidden tab pauses.
- States: `ready → playing ⇄ paused`; `playing → cleared` (fire: faster wave) or `gameover` (fire: retry).
- Playfield in sprite pixels, scaled to the stage: integer CSS scale when it fits (≥ 2), else a whole number of device pixels. Resizes on window resize and stage `ResizeObserver`.

## Testing

- Playwright, locally only; run `npm run deploy` first. `playwright.config.js` serves the root with `serve` on port 3000.
- `tests/visual-regression.spec.js`: preloader + 12 scroll positions; fails above 1% pixel difference. Runs in three projects: `chromium` (desktop 1280×720), `mobile-portrait` (Android 360×800) and `mobile-landscape` (800×360), touch layouts included.
- On touch projects the position moves through the swipe path (`scrollToPercent`), not `scrollTo`.
- Baselines: `tests/visual-regression.spec.js-snapshots/`, per project and platform (`*-chromium-win32.png`, `*-mobile-portrait-win32.png`, `*-mobile-landscape-win32.png`).
- Section tests click `RUN`, then `settleGameAnimations()` finishes jQuery animations and stops JS cycles (stars, alien steer) at rest.
- The CSS animation kill switch doesn't reach JS-driven cycles; `stopFireworks()` clears fireworks.
- `tests/game.spec.js`: behaviour in the real page (preloader, `gameConfig` freeze, scenes, scroll phases, end detection, pipe warps, touch layout and swipes, sitemap…). Desktop project only; its "Touch devices" block emulates a phone itself.
- `npm run test:update` only after inspecting the diffs, for intentional visual changes.

## SEO

- `src/json/seo-meta.json`: Schema.org `Person` JSON-LD. Edit it, not `index.html`.
- `index.html` `<head>`: Open Graph, Twitter Cards, meta description. Always define `og:image` and `twitter:image`.
- `package.json` → `config.keywords`: manifest keywords.

### Audits (`claude-seo` submodule)

- `.claude/claude-seo/` (submodule, `AgriciDaniel/claude-seo`) ships SEO skills (`seo-audit`, `seo-page`, `seo-schema`, `seo-technical`, `seo-geo`…).
- Re-audit every few months or after significant content/meta changes. Apply findings to pages, `seo-meta.json`, `llms.txt`, `robots.txt`, build.
- Not auto-loaded: copy/symlink a skill into `.claude/skills/`, run `install.ps1`/`install.sh`, or read its `SKILL.md`.
- Clone/pull doesn't populate it: `git submodule update --init` once, then `git config submodule.recurse true`.
- Dependabot bumps it weekly (`gitsubmodule`). Manually: `git submodule update --remote .claude/claude-seo`, commit the gitlink.

### `robots.txt`

- Root template. Allows every crawler everywhere: search, AI answers, AI training.
- Named crawlers are grouped by category (search, social previews, AI answers, AI training). Add a new `User-agent` to its group.
- Every group repeats `Content-Signal: search=yes, ai-input=yes, ai-train=yes`: a named crawler ignores the `*` group (RFC 9309).
- Cloudflare's AI crawler blocking sits in front (training crawlers got 403 in October 2026). Check the Cloudflare dashboard too.

### `llms.txt`

- Root template per llmstxt.org: H1, `>` summary, disambiguation, `## Pages`, `## Profiles`, fact sections, `## Optional` last.
- No weight in Google Search; it is for other AI systems.
