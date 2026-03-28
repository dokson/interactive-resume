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
| Contact form   | [@emailjs/browser](https://www.emailjs.com/)                                                        |
| Build pipeline | [Node.js](https://nodejs.org/) (minify, SEO injection, manifest generation)                         |
| Testing        | [Playwright](https://playwright.dev/) visual regression (12 screenshot baselines)                   |
| CI/CD          | [GitHub Actions](https://github.com/features/actions)                                               |
| Hosting        | [GitHub Pages](https://pages.github.com/) (custom domain: [`www.colace.me`](https://www.colace.me)) |
| PDF sync       | CV.pdf auto-committed from [dokson/cv](https://github.com/dokson/cv)                                |

## 📝 License

This project is based on code from [Robby Leonardi's interactive resume](http://www.rleonardi.com/interactive-resume/), originally published more than 10 years ago and never formally open-sourced. The codebase has been **extensively refactored and reorganised** following modern software engineering best practices, and the characters, storyline, and most visual assets have been replaced with original work by Alessandro Colace, though some graphic elements from the original site are still present.

Because the underlying code derives from a proprietary work, no open-source license is applied here, and the project is **not available for redistribution or commercial use**.

You are welcome to view the code and draw inspiration for your own interactive resume, but please build something that genuinely reflects your own story and style.

## 🙏 Acknowledgments

- Huge thanks to [Robby Leonardi](http://www.rleonardi.com/) for the original concept and creative genius.

- Special thanks to [GitHub](http://github.com) for [GitHub Pages](https://pages.github.com/)

## 🔄 Updates

**March 2026**: Full codebase refactoring and modernization — split monolithic JS into focused modules, modernized to ES2024+ syntax, replaced legacy IE/vendor code with feature detection, introduced global state namespaces, and added Playwright visual regression testing.

**June 2025**: Resume updated with latest professional experiences and technical skills. Project published on GitHub to inspire others in the community.

**August 2019**: First version created for Bending Spoons _Game Lead_ application.

---

⭐ If you find this project useful or inspiring, consider giving it a star on GitHub!
