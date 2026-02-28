# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # install dependencies (required before first build)
npm run deploy       # full build pipeline: inject-seo → minify → generate-manifest → copy-libs
```

Individual build steps can be run in isolation:

```bash
npm run deploy:inject-seo         # inject JSON-LD from src/json/seo-meta.json into dist/index.html
npm run deploy:minify             # minify src/js/*.js → dist/*.min.js and src/css/*.css → dist/*.min.css
npm run deploy:generate-manifest  # generate dist/site.webmanifest from package.json metadata
npm run deploy:copy-libs          # copy npm dependency bundles (jQuery, jQuery UI, EmailJS) into dist/
```

## Architecture

This is a static HTML/CSS/JS site with a Node.js-only build pipeline. There is no framework.

### Source vs. dist

- **`index.html`, `cv.html`, `404.html`** are source HTML files. `index.html` is the entry point for the interactive resume and references assets from `dist/` (minified JS/CSS) and static directories (`image/`, `font/`).
- **`dist/`** is the build output directory. It is not committed. The CI workflow assembles `deploy/` from `dist/` plus the static directories before pushing to `gh-pages`.
- **`src/js/`** and **`src/css/`** contain the editable source files. Every `.js` file in `src/js/` is minified individually to a corresponding `.min.js` in `dist/`. Same for CSS.

### SEO injection

`src/json/seo-meta.json` holds a Schema.org `Person` JSON-LD object. The inject-seo build step reads this and appends it as a `<script type="application/ld+json">` block just before `</head>` in `dist/index.html`. Edit `seo-meta.json` to update structured data without touching `index.html`.

### package.json as config hub

Build behaviour, web manifest values, external lib paths, and SEO keywords are all driven by `package.json`'s `config` block — not by separate config files. The build scripts read it directly via `require('../../package.json')`.

### External libraries

jQuery, jQuery UI, and `@emailjs/browser` are npm dependencies. The `copy-libs` step extracts their pre-built browser bundles into `dist/` so `index.html` can load them as local scripts. `config.build.externalLibs` in `package.json` defines which file to extract from each package.

### Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which runs `npm ci && npm start`, then assembles `deploy/` (merging `dist/`, static assets, and root HTML files) and force-pushes it to `gh-pages` via `peaceiris/actions-gh-pages`. The live site uses CNAME `www.colace.me`.
