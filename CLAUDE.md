# Learning Adventure – Claude Code Guide

## Project Overview
An educational quiz web app for Grade 2 students following the Jamaica NSC curriculum. Static HTML/CSS/JS — no build step, no frameworks, no package.json.

## Stack
- **HTML5 / CSS3 / Vanilla JS** — no React, no Vue, no bundler
- **Netlify** — static hosting (`netlify.toml` at root)
- **Google Fonts** — Fredoka + Nunito

## File Layout
```
/
├── index.html                  # Landing page / home
├── workbook-review.html        # Workbook quiz browser
├── netlify.toml
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
└── Resources/Book Scans/       # Source textbook material
```

## Conventions
- **No build step** — edit HTML/CSS/JS files directly; changes are live on save.
- **CSS variables** live in `css/base.css` — use them for colors, spacing, fonts.
- **Quiz data** follows the pattern in `/quizzes/workbooks/` — match existing structure when adding new quizzes.
- **Audience** — Grade 2 children; keep UI friendly, colorful, and accessible.

## Deployment
Push to `main` → Netlify auto-deploys. No CI steps.

## Docs
- `PRD.md` — product requirements
- `CHANGELOG.md` — version history
- `FEATURES.md` — feature roadmap
- `AGENTS.md` — agent/AI collaboration notes
