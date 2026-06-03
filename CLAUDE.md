# Learning Adventure – Claude Code Guide

## Project Overview
An educational quiz web app for Grade 2 students following the Jamaica NSC curriculum. Static HTML/CSS/JS — no build step, no frameworks, no package.json.

## Stack
- **HTML5 / CSS3 / Vanilla JS** — no React, no Vue, no bundler
- **Static hosting** — all paths relative; works on GitHub Pages (incl. subdirectories) or any static host
- **Google Fonts** — Fredoka + Nunito
- **PWA** — `manifest.json` + `sw.js` (cache-first service worker)

## File Layout
```
/
├── index.html                  # Landing page / home
├── workbook-review.html        # Workbook quiz browser
├── manifest.json               # PWA manifest
├── sw.js                       # Service worker
├── css/
│   ├── base.css                # CSS variables, resets, typography
│   ├── components.css          # Reusable UI components
│   ├── navigation.css
│   ├── quiz.css
│   ├── animations.css
│   └── math-interactive.css
├── js/                         # Vanilla JS modules
├── quizzes/workbooks/          # Quiz data files per workbook
├── assets/images/
├── docs/                       # Project documentation (see Docs below)
└── Resources/Book Scans/       # Source textbook material
```

## Conventions
- **No build step** — edit HTML/CSS/JS files directly; changes are live on save.
- **CSS variables** live in `css/base.css` — use them for colors, spacing, fonts.
- **Quiz data** follows the pattern in `/quizzes/workbooks/` — match existing structure when adding new quizzes.
- **Audience** — Grade 2 children; keep UI friendly, colorful, and accessible.

## Deployment
Static hosting — Netlify config removed (deploying elsewhere later). All paths are relative, so the site works on GitHub Pages (including subdirectory deploys) or any static host. No CI steps.

## Docs (in `docs/`)
- `docs/STATUS.md` — **current project state, curriculum, content coverage — start here**
- `docs/PRD.md` — product requirements
- `docs/CHANGELOG.md` — version history
- `docs/FEATURES.md` — feature roadmap
- `docs/AGENTS.md` — agent/AI collaboration notes
- `docs/screenshots/` — app state screenshots
