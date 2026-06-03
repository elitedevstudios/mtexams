# Learning Adventure — Project Status

> **Last updated:** 2026-06-03
> Read this first when resuming work. Companion docs: [PRD.md](PRD.md), [FEATURES.md](FEATURES.md), [CHANGELOG.md](CHANGELOG.md), [AGENTS.md](AGENTS.md).

---

## 1. What This Is

Educational quiz web app for **Morgan (Grade 2, age 7)**. Static HTML/CSS/JS — no build step, no frameworks. Installable PWA with offline support.

**Current version:** 1.1.0 (+ unreleased Ali Baba Stories workbook)
**Overall completion:** ~75% of core platform; stable and usable today.

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

### Core quizzes — 13 files, ~500 questions (`quizzes/`)
| Quiz | Subject |
|---|---|
| english-grammar, reading-comprehension, phonics, spelling-dictation, creative-writing | Language Arts |
| mathematics + 3 assessment quizzes | Mathematics |
| integrated-studies | Science / Social Studies / Health |
| computer-studies | Technology |
| spanish | Languages |
| music | Arts |

### Workbook quizzes — 4 workbooks, 14 chapters, ~915 questions (`quizzes/workbooks/`)
| Workbook | Built | Pending |
|---|---|---|
| **Rediscovering Mathematics G2** | 7 chapters (Sets, Numbers to 100, Addition, Subtraction, Time, Shapes, Money) — ~238 Q | ✅ Fully covered |
| **Integrated Language Arts** | 2 chapters (Nouns & Pronouns 151 Q, Verbs 105 Q) | ⏳ Remaining chapters — scans from ~p.92+ |
| **Integrated Phonics** | 2 chapters (Vowel Sounds 91 Q, Letter Sounds 102 Q) | ⏳ Remaining chapters — scans from ~p.70+ |
| **Ali Baba Stories** | 2 stories (Androcles and the Lion 28 Q, A Strange Treasure 48 Q) | ✅ Covered (unreleased in changelog) |

**Total: ~1,415 questions across 27 quiz JSON files.**

---

## 4. Architecture

- **Pages:** `index.html` (quiz selector + runner), `workbook-review.html` (workbook/chapter browser)
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
- Offline-capable PWA install

---

## 6. Known Tech Debt

| Priority | Issue | Where |
|---|---|---|
| High | ~235 lines of CSS injected into `<head>` from JS — move to quiz.css | `js/app.js` ~1036–1111, ~1281–1442 |
| High | Hardcoded quiz list — should be manifest-driven | `js/app.js:67-81` |
| Med | Duplicate keyframes (`bounce`, `pulse`, `slide-up`) | `css/quiz.css` + `css/animations.css` |
| Med | Dead code: unused `renderSubjectCards()` | `js/app.js` ~359–384 |
| Med | No error UI on failed quiz fetch (silent failure) | `js/app.js` |
| Low | Console.log statements, magic numbers | various |

---

## 7. Deployment

- Netlify config **removed** (commit: "Remove Netlify config — deploying elsewhere later")
- All paths relative → works on GitHub Pages including subdirectory deploys (404 fix in commit `899f015`)
- **Open question:** final hosting target not decided

---

## 8. Roadmap / Next Up

From PRD future considerations + content gaps:
- [ ] Remaining Integrated Language Arts chapters (scans available)
- [ ] Remaining Integrated Phonics chapters (scans available)
- [ ] Text-to-speech for question prompts
- [ ] Parent dashboard / progress reports
- [ ] Printable certificates / badges
- [ ] Release Ali Baba Stories in changelog (currently "Unreleased")
- [ ] **New functions & features — to be specified (next work session)**
