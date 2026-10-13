# 🕹️ Alessandro Colace Interactive Resume

This **interactive resume** transforms a traditional CV into a **scrollable visual experience**, designed to **engage the visitors**, guiding them through **key milestones**, technical **skills**, and **career achievements**, in a way that is both informative and memorable.

[![Live Site](https://img.shields.io/badge/Live%20Site-www.colace.me-0078D4?style=flat-square&logo=google-chrome&logoColor=white)](https://www.colace.me)

## 🖼️ Project Story

I discovered the [original project by Robby Leonardi](http://www.rleonardi.com/interactive-resume/) (a groundbreaking work that won major web awards like [FWA](https://thefwa.com/), [Awwwards](https://www.awwwards.com/), and [CSS Design Awards](https://www.cssdesignawards.com/), and is widely recognized as one of the first truly gamified resumes) back in **2019** when I was applying for a **Game Lead** position at [Bending Spoons](https://bendingspoons.com/). Since I wanted to stand out by presenting my career in a **game-based format**, I customized it, making the first version of my interactive resume. It paid off: I made it past the initial screening, which is known to be extremely selective, and I was able to proceed with the interview process for the role. I designed my **personal reinterpretation** of the original concepts, updating characters, backgrounds, and the storyline to reflect my skills and journey as a professional.

The project remained untouched until **2025**, when I decided to revisit and polish it. I felt it would be a shame to keep it private, so I published it here on **GitHub Pages** (through the `gh-pages` branch) hoping it could inspire others to reimagine how a resume can look and feel.

## 🛠️ Tech Stack

| Layer          | Technology                                                                                          |
| -------------- | --------------------------------------------------------------------------------------------------- |
| Libraries      | [jQuery 4](https://jquery.com/), custom easing functions                                            |
| Animations     | `requestAnimationFrame`-based interval system for visual cycles                                     |
| Preloader      | Commodore 64 tape-loading boot screen (C64 Pro Mono font, Pepto palette), click/tap/key to `RUN`     |
| 404 page       | Crashed Commodore 64 blue screen with alien glitches + **404 Invaders** canvas mini-game, no dependencies |
| Fonts          | C64 Pro Mono (preloader, 404 page), Press Start 2P (game UI), Jersey 15 (long text), Bangers (ribbons, headings); all but C64 Pro Mono under [SIL OFL](https://openfontlicense.org/) |
| Navigation     | Mouse wheel or any arrow key on desktop, swipe on touch devices                                     |
| Contact form   | [@emailjs/browser](https://www.emailjs.com/)                                                        |
| Build pipeline | [Node.js](https://nodejs.org/) (minify, SEO injection, manifest generation)                         |
| Testing        | [Playwright](https://playwright.dev/) visual regression (13 baselines) + game behaviour tests      |
| CI/CD          | [GitHub Actions](https://github.com/features/actions)                                               |
| Hosting        | [GitHub Pages](https://pages.github.com/) (custom domain: [`www.colace.me`](https://www.colace.me)) |
| PDF sync       | CV.pdf auto-committed from [dokson/cv](https://github.com/dokson/cv)                                |

## 🎮 Commodore 64 Preloader & 404 Page

Both screens are original work designed for this project.

### Preloader

The resume boots like a Commodore 64. The BASIC V2 start-up screen types `LOAD`, asks you to `PRESS PLAY ON TAPE`, then searches for, finds and loads the resume behind animated raster border stripes. Once the page has finished loading it shows `READY.`. A click, tap or key press types `RUN`, the screen blanks, the world rises into place and Ale drops in. The world moves with a composited transform, so there is no layout shift. The preloader text meets WCAG AA contrast and is kept out of search snippets.

### 404 page

A missing page crashes the Commodore 64 onto a blue screen. Scroll down, and the invaders who ate the page are waiting to be shot.

- **The crash**: a believable C64 session on the URL that was requested. It shows:
  - a disk directory where `404.PAGE` is deleted and an `INVADERS` program has moved in;
  - `?FILE NOT FOUND  ERROR` and the 1541 error channel;
  - a BASIC recovery program whose `LOAD` lines link back to the resume, the about page and the CV;
  - a monitor dump of screen memory, in real C64 screen codes, that spells out what happened.
- **Alien glitches**:
  - small invaders walk across the text and eat characters;
  - bits flip into PETSCII graphics;
  - rows of corrupted screen memory keep changing;
  - raster bands of an alien signal flash by;
  - the 1541 drive LED keeps blinking.

  The glitches pause off-screen, and with reduced motion enabled nothing moves.
- **Way out or way in**: `ENTER` reboots to the homepage (`SYS 64738`) at any moment, even mid-match. Otherwise a countdown in the footer scrolls down to the game after 5 seconds, unless the visitor scrolls, taps or presses a key first.
- **404 Invaders**: 30 invaders lined up as the digits "404". Play with the arrows (or A/D) and Space, or hold and drag on touch screens. Waves get faster, the game pauses when you scroll away, and clearing a wave reads `SECTOR 404 RECLAIMED!`.
- **Standalone**: its own CSS and JS, no libraries, and absolute asset paths, so GitHub Pages can serve it at any URL depth.

## 📝 License

This project is based on code from [Robby Leonardi's interactive resume](http://www.rleonardi.com/interactive-resume/), originally published more than 10 years ago and never formally open-sourced. The codebase has been **extensively refactored and reorganised** following modern software engineering best practices, and the characters, storyline, and most visual assets have been replaced with original work by Alessandro Colace, though some graphic elements from the original site are still present.

Because the underlying code derives from a proprietary work, no open-source license is applied here, and the project is **not available for redistribution or commercial use**.

The preloader and the 404 page use the **C64 Pro Mono** typeface by [Style](https://style64.org/c64-truetype), embedded under its [license](https://style64.org/c64-truetype/license): the font file is not covered by this repository and may not be redistributed or offered for download. The other fonts are licensed under the SIL Open Font License 1.1 (license files in `font/`). Commodore 64 is a trademark of its respective owner; this project is not affiliated with or endorsed by it.

You are welcome to view the code and draw inspiration for your own interactive resume, but please build something that genuinely reflects your own story and style.

## 🙏 Acknowledgments

- Huge thanks to [Robby Leonardi](http://www.rleonardi.com/) for the original concept and creative genius.

- Thanks to [Style](https://style64.org/) for the C64 TrueType fonts and to Philip "Pepto" Timmermann for the [VIC-II color analysis](https://www.pepto.de/projects/colorvic/).

- Special thanks to [GitHub](http://github.com) for [GitHub Pages](https://pages.github.com/)

## 🔄 Updates

**October 2026**: New 404 page — a crashed Commodore 64 on a blue screen, written as a real C64 session on the URL that was requested and attacked by alien glitches that eat its text, followed by **404 Invaders**, a canvas mini-game (keyboard and touch) where you shoot down the invaders that ate the page. It auto-scrolls to the game after a 5-second countdown, and its assets load from absolute paths so it works at any URL depth.

**September 2026**: New Commodore 64-style preloader — BASIC V2 boot screen, animated tape-loading sequence with raster border stripes, and a click/tap/key "RUN" prompt to enter the resume. The world now rises with a composited transform after RUN (mobile Cumulative Layout Shift from 0.61 to ~0), the preloader text meets WCAG AA contrast and is excluded from search snippets, and the sitemap `lastmod` is derived from each page's git history. The game code was restructured for maintainability: every timing and distance lives in one frozen `gameConfig`, each animated section is a declarative scene with its own lifecycle, and new behaviour tests cover the preloader, scenes, scroll phases, sea and contact form. The space stars now flash through a Super Mario Bros. Super Star palette (yellow, orange, green, white).

**March 2026**: Full codebase refactoring and modernization — split monolithic JS into focused modules, modernized to ES2024+ syntax, replaced legacy IE/vendor code with feature detection, introduced global state namespaces, and added Playwright visual regression testing.

**June 2025**: Resume updated with latest professional experiences and technical skills. Project published on GitHub to inspire others in the community.

**August 2019**: First version created for Bending Spoons _Game Lead_ application.

---

⭐ If you find this project useful or inspiring, consider giving it a star on GitHub!
