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

## Coding Standards & Best Practices

When editing JavaScript files in `src/js/`, please adhere to the following best practices to maintain human-readable code. Avoid writing "minified-style" artifacts directly into the source:
- **Avoid Yoda conditions**: Write `variable === val` instead of `val === variable`.
- **Avoid comma operators**: Do not chain multiple distinct expressions with commas (e.g., `doThis(), doThat()`). Write them as separate statements on new lines.
- **Use standard boolean literals**: Always use `true` and `false` instead of minifier tricks like `!0` and `!1`.
- **Write clean conditionals**: Expand inline nested ternaries or complex `&&` operator assignments into readable `if/else` blocks. 
- **DOM Queries**: If a view component selects many DOM elements, group them logically or use helper mappings instead of repetitive isolated `document.getElementById` declarations.
- **HTML Formatting**: Do not use automatic line-wrapping or formatters that wrap long HTML lines (e.g., in `index.html`). The extensive use of inline classes and IDs for animations means that line breaks mid-tag will destroy the layout. Use settings like `"html.format.wrapLineLength": 0` in VS Code or configure `.prettierrc` (`"printWidth": 9999`) to prevent this.

## Architecture & Maintenance Guidelines

- **SEO & Metadata**: To keep SEO optimal according to most recent standards:
  - Update `src/json/seo-meta.json` to change the Schema.org `Person` JSON-LD injects.
  - Update `index.html` `<head>` tags to change Open Graph (`og:*`), Twitter Cards (`twitter:*`), and standard meta descriptions. ALWAYS ensure `og:image` and `twitter:image` are defined.
  - Update `package.json` -> `config.keywords` to change the site manifest keywords.
- **Adding External Libraries**: If you `npm install` a new frontend dependency:
  1. Add it to `package.json` -> `config.build.externalLibs`.
  2. Reference the copied `.min.js` file in `index.html` or `cv.html`.
  3. Run `npm run deploy:copy-libs` to sync it to `dist/`.
