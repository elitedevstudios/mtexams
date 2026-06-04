# Progress Tracker

> **Single source of truth for what's done, in progress, and next.**
> **Rule: update this file after EVERY change, before committing.** Move finished items to Done, add new work to Next Up, and add a `[Unreleased]` line in [CHANGELOG.md](CHANGELOG.md) for user-facing changes.

**Last updated:** 2026-06-04

---

## Done

| Date | Milestone |
|---|---|
| 2026-06-04 | **Parent dashboard** — `parent-dashboard.html` behind password gate (default `Password123`, changeable, on-device only). Stats cards, quiz/workbook/lesson tables, 30-day attendance strip, print report. 👪 Parents link in every footer. sw.js → v10 |
| 2026-06-04 | **Printable certificates** — "My Certificate 🏆" on results screens (Home/Tests + workbooks) → print-ready award with name, quiz, score, stars. Also FIXED pre-existing bug: workbook "See Results" skipped the results screen entirely. sw.js → v9 |
| 2026-06-04 | **Text-to-speech** — 🔊 read-aloud button on every question prompt (quizzes, workbooks, lessons, tests) via Web Speech API. Browser-tested speak/stop toggle. sw.js → v8 |
| 2026-06-04 | **NSC Practice +4 chapters** — Possessive Pronouns (22 Q), Symmetry (20 Q), Materials & Properties (21 Q), Rights & Responsibilities (19 Q). All high-priority curriculum gaps now covered. sw.js → v7 |
| 2026-06-04 | **NSC Practice workbook** — new curriculum-based collection; Chapter 1: Jamaica's Parishes (28 Q: counties, parishes, capitals, fun facts). Browser-tested all question types. sw.js → v6 |
| 2026-06-04 | Doc audit: corrected question counts, refreshed FEATURES.md, completed changelog version table, added this tracker |
| 2026-06-03 | **v1.5.0** — Language Arts + Integrated Studies term tests (9 tests total, subject-grouped) |
| 2026-06-03 | **v1.4.0** — Term 3 lessons (17); full school year covered, 54 lessons |
| 2026-06-03 | **v1.3.0** — Term 2 lessons (19), term-grouped Lessons UI |
| 2026-06-03 | **v1.2.0** — Lessons section, attendance check-in + streak, Tests page, 4-tab nav |
| 2026-01-07 | **v1.1.0** — Rebrand to Learning Adventure, name prompt, interactive math, Rediscovering Mathematics workbook |
| 2025-12-23 | **v1.0.0** — Initial release: quiz engine, 6 subjects, workbook review, progress tracking, PWA |

---

## In Progress

*(nothing — pick from Next Up)*

---

## Next Up (priority order)

1. [ ] **Medium-priority NSC chapters** (optional, no scans needed): calendar skills (days/months), voiced/voiceless 'th', onset & rimes, shape properties depth.
2. [ ] **Scan + quizzify remaining workbook pages** — ⛔ blocked: needs new scans (ILA p.92+, Phonics pt 2, Rediscovering Math part 2). All existing scans fully quizzified.
3. [ ] **Release** — roll the `[Unreleased]` changelog into v1.6.0 once this batch is confirmed working on Morgan's device.

🎉 **All planned roadmap features are now built** — remaining items are optional content or blocked on scans.

---

## Tech Debt

| Priority | Issue | Where |
|---|---|---|
| High | ~235 lines of CSS injected into `<head>` from JS — move to quiz.css | `js/app.js` ~1036–1111, ~1281–1442 |
| High | Hardcoded quiz list — should be manifest-driven | `js/app.js:67-81` |
| Med | Duplicate keyframes (`bounce`, `pulse`, `slide-up`) | `css/quiz.css` + `css/animations.css` |
| Med | Dead code: unused `renderSubjectCards()` | `js/app.js` ~359–384 |
| Med | No error UI on failed quiz fetch (silent failure) | `js/app.js` |
| Low | Console.log statements, magic numbers | various |

---

## Open Questions

- **Hosting target undecided** — Netlify config removed; all paths relative so GitHub Pages (incl. subdirectory) or any static host works.

---

## Verified Content Counts (2026-06-04, counted from quiz JSON files)

| Area | Files | Questions |
|---|---|---|
| Core subject quizzes | 13 | 291 |
| Term tests (LA 3 / Math 3 / IS 3) | 9 | 135 |
| Workbooks (5 collections, 18 chapters) | 18 | 771 |
| Lesson checks (54 lessons × 4 Q) | 54 | 216 |
| **Total** | **91** | **~1,413** |

Workbook detail: Rediscovering Math 7 ch / 195 Q · ILA 2 ch / 232 Q (Nouns & Pronouns 137, Verbs 95) · Phonics 2 ch / 171 Q (Vowel Sounds 79, Letter Sounds 92) · Ali Baba 2 stories / 63 Q (Androcles 23, A Strange Treasure 40) · NSC Practice 5 ch / 110 Q (Parishes 28, Possessive Pronouns 22, Symmetry 20, Materials 21, Rights & Responsibilities 19).
