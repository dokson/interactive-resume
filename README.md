# 🕹️ Alessandro Colace Interactive Resume

This **interactive resume** transforms a traditional CV into a **scrollable visual experience**, designed to **engage the visitors**, guiding them through **key milestones**, technical **skills**, and **career achievements**, in a way that is both informative and memorable.

[![Live Site](https://img.shields.io/badge/Live%20Site-www.colace.me-0078D4?style=flat-square&logo=google-chrome&logoColor=white)](https://www.colace.me)

## 🖼️ Project Story

In **2019**, applying for a **Game Lead** role at [Bending Spoons](https://bendingspoons.com/), I turned my career into a game, starting from [Robby Leonardi's interactive resume](http://www.rleonardi.com/interactive-resume/). It got me past the notoriously selective screening.

The project remained untouched until **2025**, when I decided to revisit and polish it. I felt it would be a shame to keep it private, so I published it here on **GitHub Pages** (through the `gh-pages` branch) hoping it could inspire others to reimagine how a resume can look and feel.

## 🛠️ Tech Stack

| Layer          | Technology                                                                                                                    |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Libraries      | [jQuery 4](https://jquery.com/), custom easing functions                                                                      |
| Animations     | `requestAnimationFrame`-based interval system for visual cycles                                                               |
| Preloader      | Commodore 64 tape-loading boot screen (C64 Pro Mono font, Pepto palette), click/tap/key to `RUN`                              |
| 404 page       | Crashed Commodore 64 blue screen with alien glitches + **404 Invaders** canvas mini-game, no dependencies                     |
| About page     | Retro profile page: skills with brand marks, career, COalesCE, contacts                                                       |
| Ending         | Board the rocket to reach the About page; Mario-style canvas fireworks                                                        |
| Fonts          | C64 Pro Mono, Press Start 2P, Jersey 15, Bangers, Manrope; all but C64 Pro Mono under [SIL OFL](https://openfontlicense.org/) |
| Navigation     | Mouse wheel or any arrow key on desktop, swipe on touch devices                                                               |
| Build pipeline | [Node.js](https://nodejs.org/) (minify, SEO injection, manifest generation)                                                   |
| Testing        | [Playwright](https://playwright.dev/) visual regression (13 baselines) + game behaviour tests                                 |
| CI/CD          | [GitHub Actions](https://github.com/features/actions)                                                                         |
| Hosting        | [GitHub Pages](https://pages.github.com/) (custom domain: [`www.colace.me`](https://www.colace.me))                           |
| PDF sync       | CV.pdf auto-committed from [dokson/cv](https://github.com/dokson/cv)                                                          |

## 🎮 Commodore 64 Preloader & 404 Page

Both screens are original work designed for this project.

- **Preloader**: the resume boots like a C64: the BASIC V2 screen types `LOAD`, plays the tape behind raster border stripes and waits at `READY.`. A click, tap or key types `RUN` and the world rises into place, without layout shift.
- **404 page**: a missing URL crashes the C64 onto a blue screen, a believable BASIC session (`?FILE NOT FOUND  ERROR`) whose `LOAD` lines link back to the site while small invaders eat its text. `ENTER` reboots to the homepage; otherwise the page scrolls down to **404 Invaders**, a canvas mini-game (keyboard or touch) against 30 invaders lined up as "404".

## 📝 License

The project started as a complete rewrite of the code of [Robby Leonardi's interactive resume](http://www.rleonardi.com/interactive-resume/), never open-sourced. Characters, story and most graphics are original work by Alessandro Colace; a few original graphic elements remain.

Because the underlying code derives from a proprietary work, no open-source license is applied here, and the project is **not available for redistribution or commercial use**.

The preloader and the 404 page use the **C64 Pro Mono** typeface by [Style](https://style64.org/c64-truetype), embedded under its [license](https://style64.org/c64-truetype/license): the font file is not covered by this repository and may not be redistributed or offered for download. The other fonts are licensed under the SIL Open Font License 1.1 (license files in `font/`). Commodore 64 is a trademark of its respective owner; this project is not affiliated with or endorsed by it.

The Mario-style pixel art (fireworks, sea creatures, some trees) is original. Super Mario is a trademark of Nintendo; this project is not affiliated with or endorsed by it.

You are welcome to view the code and draw inspiration for your own interactive resume, but please build something that genuinely reflects your own story and style.

## 🙏 Acknowledgments

- Thanks to [Style](https://style64.org/) for the C64 TrueType fonts and to Philip "Pepto" Timmermann for the [VIC-II color analysis](https://www.pepto.de/projects/colorvic/).

- Special thanks to [GitHub](http://github.com) for [GitHub Pages](https://pages.github.com/)

## 🔄 Updates

**October 2026**:

- Commodore 64 crash 404 page with the **404 Invaders** mini-game.
- Arrow-key navigation and retro game fonts.
- Redesigned About page.
- The rocket is the new ending: board it to reach the About page. The contact form and EmailJS are gone.
- Mario-style fireworks, sea creatures, seaweed and trees.

**September 2026**: Commodore 64 tape-loading preloader with click-to-RUN (mobile CLS from 0.61 to ~0); data-driven game engine with a central `gameConfig`, declarative scenes and behaviour tests.

**March 2026**: Full codebase refactoring and modernization — split monolithic JS into focused modules, modernized to ES2024+ syntax, replaced legacy IE/vendor code with feature detection, introduced global state namespaces, and added Playwright visual regression testing.

**June 2025**: Resume updated with latest professional experiences and technical skills. Project published on GitHub to inspire others in the community.

**August 2019**: First version created for Bending Spoons _Game Lead_ application.

---

⭐ If you find this project useful or inspiring, consider giving it a star on GitHub!
