# Learning Adventure — Project Status

> **Last updated:** 2026-06-04 (doc audit — counts verified against quiz files)
> Read this first when resuming work. Companion docs: [PROGRESS.md](PROGRESS.md) (live tracker — update after every change), [PRD.md](PRD.md), [FEATURES.md](FEATURES.md), [CHANGELOG.md](CHANGELOG.md), [AGENTS.md](AGENTS.md).

---

## 1. What This Is

Educational quiz web app for **Morgan (Grade 2, age 7)**. Static HTML/CSS/JS — no build step, no frameworks. Installable PWA with offline support. Now a light kid-LMS: Lessons (video + check) · Workbooks · Tests · daily Attendance.

**Current version:** 1.5.0 (2026-06-03 — 9 term tests across all subjects; full year of lessons)
**Overall completion:** core platform stable and feature-rich; ready for daily use.

---

## 2. Curriculum

**Jamaica National Standards Curriculum (NSC) — Grade 2**

Source material (in `Resources/`):
- `MOE-NSC-GRADE-2-Int.-Studies-Language-Math-FINAL.pdf` — official MOE curriculum guide (18MB)
- `NSC-Grade2-Curriculum-Extract.md` — extracted curriculum reference
- `Resources/Book Scans/` — scanned workbook pages used as quiz source material

Subjects covered: Language Arts, Mathematics, Integrated Studies, Computer Studies, Spanish, Music (Jamaican focus). Money questions use JMD; imagery uses Jamaican icons (doctorbird, ackee, mangoes).

---

## 3. Content Coverage

### Core quizzes — 19 files, 426 questions (`quizzes/`): 13 subject quizzes (291 Q) + 9 term tests (135 Q)
| Quiz | Subject |
|---|---|
| english-grammar, reading-comprehension, phonics, spelling-dictation, creative-writing | Language Arts |
| mathematics + 3 assessment quizzes | Mathematics |
| integrated-studies | Science / Social Studies / Health |
| computer-studies | Technology |
| spanish | Languages |
| music | Arts |

### Workbook quizzes — 5 collections, 18 chapters, 771 questions (`quizzes/workbooks/`)
| Workbook | Built | Pending |
|---|---|---|
| **Rediscovering Mathematics G2** | 7 chapters (Sets, Numbers to 100, Addition, Subtraction, Time, Shapes, Money) — ~195 Q | ✅ All scanned material covered ("part 1" scan; further chapters need new scans) |
| **Integrated Language Arts** | Nouns & Pronouns + Verbs (verbs.json covers book pp. 54–91, incl. verb2.pdf content: Do/Does, Did Not, Was/Were, -ing/-ed) | ✅ All scanned material covered — chapters beyond p.91 not yet scanned |
| **Integrated Phonics** | Vowel Sounds (79 Q) + Letter Sounds (92 Q) | ✅ All scanned material covered ("pt 1" scan; pt 2 not yet scanned) |
| **Ali Baba Stories** | 2 stories (Androcles and the Lion 23 Q, A Strange Treasure 40 Q) | ✅ Covered (released as v1.1.1 in changelog) |
| **NSC Practice** (curriculum-based, no scans) | 5 chapters, 110 Q (Parishes, Possessive Pronouns, Symmetry, Materials & Properties, Rights & Responsibilities) | ✅ All high-priority curriculum gaps covered; optional medium gaps remain (calendar, voiced th, onset/rimes) |

**Scan coverage verified 2026-06-03: every PDF in `Resources/ Book Scans/` is fully quizzified. New quiz content requires new scans.**

**Total: ~1,413 questions across 91 quiz JSON files** (19 core + 18 workbook + 54 lesson checks at 4 Q each = 216). Counts verified 2026-06-04.

---

## 4. Architecture

- **Pages:** `index.html` (quiz selector + runner + attendance), `lessons.html` (video lessons + checks), `workbook-review.html` (workbook/chapter browser), `assessments.html` (tests), `parent-dashboard.html` (password-gated progress reports)
- **JS (7 modules, ~4,200 lines):** `app.js` (core, 1,472 ln), `quiz-engine.js` (scoring/state), `feedback.js` (confetti/sounds), `storage.js` (localStorage), `workbook-review.js`, `math-interactive.js` (SVG number lines, clocks, shapes), `pwa-install.js`
- **CSS (6 files, ~3,280 lines):** base, components, navigation, quiz, animations, math-interactive
- **Question types:** multiple-choice, multi-select, text-input, fill-blank, matching, writing (auto-accept), interactive (math components)
- **PWA:** `manifest.json` + `sw.js` (cache-first, 49 precached assets) + persistent install button (iOS Safari supported)

---

## 5. Working Features

- Quiz engine with sections, progress, 1–3 star scoring (≥50/70/90%)
- Confetti, sound effects (toggleable), encouragement messages
- Progress persistence, streak counter, achievements (localStorage)
- Name prompt + personalized greetings
- Post-quiz review mode (filter correct/incorrect)
- Keyboard navigation, reduced-motion support, WCAG 2.1 AA target
- **Text-to-speech:** 🔊 button beside every question prompt reads it aloud (Web Speech API, `js/tts.js`); auto-hidden if unsupported
- **Printable certificates:** "My Certificate 🏆" on results screens → print-ready award with name, quiz, score, stars (`js/certificate.js`)
- **Parent dashboard:** password-gated (default `Password123`, changeable) progress report — stats, score tables, attendance strip, print (`parent-dashboard.html`)
- Offline-capable PWA install
- **Lessons:** 54 lessons covering the FULL school year — Term 1 (18) + Term 2 (19) + Term 3 (17): 20 LA, 20 Math, 14 IS — verified YouTube embed + steps + 4-Q check + stars (`quizzes/lessons/`), term-grouped UI. Term 3 includes Jamaican-made national symbols + heroes videos
- **Attendance (v1.2.0):** daily "I'm here!" check-in, month calendar, streak pill in header
- **Tests:** 9 term tests grouped by subject — Language Arts 3, Mathematics 3, Integrated Studies 3 (15 Q each, aligned to term lessons)
- **4-tab nav (v1.2.0):** Home / Lessons / Workbooks / Tests on all pages

---

## 6. Known Tech Debt

Tracked in [PROGRESS.md](PROGRESS.md) → Tech Debt section (single source of truth). Highlights: CSS injected from JS, hardcoded quiz list, duplicate keyframes, dead code, silent fetch failures.

---

## 7. Deployment

- Netlify config **removed** (commit: "Remove Netlify config — deploying elsewhere later")
- All paths relative → works on GitHub Pages including subdirectory deploys (404 fix in commit `899f015`)
- **Open question:** final hosting target not decided

---

## 8. Roadmap / Next Up

**Moved to [PROGRESS.md](PROGRESS.md) — the single source of truth for done / in progress / next up / tech debt. Update it after every change.**

One-line summary: next up is text-to-speech → certificates → parent dashboard; new workbook content blocked on new scans.
