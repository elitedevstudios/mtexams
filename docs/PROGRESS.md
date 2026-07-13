# Progress Tracker

> **Single source of truth for what's done, in progress, and next.**
> **Rule: update this file after EVERY change, before committing.** Move finished items to Done, add new work to Next Up, and add a `[Unreleased]` line in [CHANGELOG.md](CHANGELOG.md) for user-facing changes.

**Last updated:** 2026-07-13

---

## Done

| Date | Milestone |
|---|---|
| 2026-07-13 | **Parent dashboard — Attendance Rate %** — new ✅ stat card showing present ÷ expected school-days (weekdays since `SCHOOL_YEAR_START`, default 2025-09-01, weekends excluded, capped 100%); rate also shown in the Attendance section heading. Browser-verified reads 95% against seeded data. sw.js → v16 |
| 2026-07-13 | **Integrated Phonics part 2 quizzified** — new "Phonics part 2" scan (book pp. 70–94) turned into a new chapter **Consonant Sounds (ph, ch, wh, st)** — 10 sections / 67 questions: initial/medial/final **ph** and **ch**, initial **wh**, initial/medial/final **st**. Integrated Phonics now 3 chapters. Browser-verified render + scoring, no console errors. sw.js → v15 |
| 2026-07-01 | **Rediscovering Math part 2 quizzified** — new scan turned into 152 questions. Extended 3 existing chapters (Money → dollars & cents, cents↔dollars, comparing, shopping/change; Addition → 2→3-digit, renaming, mental; Subtraction → to-20 number line, mental) and added 5 new chapters: Expanded Notation, Capacity & Volume, Division, Multiplication, Bigger Numbers (to 800). Rediscovering Mathematics now 12 chapters. sw.js → v14 |
| 2026-06-22 | **Quality audit + fixes** — full a11y/code/UX audit ([AUDIT-2026-06.md](AUDIT-2026-06.md)). Fixed 3 broken CSS animations (undefined keyframes), added skip links to all pages, name/answer input labels, name-modal Escape + focus trap (`js/modal-a11y.js`), sound-toggle focus ring, defined `--color-primary-dark`. Browser-verified skip link + Escape + focus trap live. Fixed lesson videos kicking out to YouTube on iOS (added `playsinline=1` to embed URL). Audit also confirmed several old debt items were already resolved (see Tech Debt). sw.js → v13 |
| 2026-06-04 | **Tests page restyle** — assessment cards now use full subject-card structure (color banner per subject, icon box, Term labels, footer with stars + score badge); balanced title wrapping. sw.js → v11 |
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
2. [ ] **Scan + quizzify remaining workbook pages** — ⛔ blocked: needs new scans (ILA p.92+). ✅ Rediscovering Math part 2 done (2026-07-01). ✅ Integrated Phonics part 2 done (2026-07-13). Remaining Math part-2 topics not yet quizzified: Telling Time (already covered by chapter-4-time) and the tens/ones word-problem warm-up page.
3. [ ] **Release** — roll the `[Unreleased]` changelog into v1.6.0 once this batch is confirmed working on Morgan's device.

🎉 **All planned roadmap features are now built** — remaining items are optional content or blocked on scans.

---

## Tech Debt

| Priority | Issue | Where |
|---|---|---|
| Med | Hardcoded quiz list (19 paths) — should be manifest-driven | `js/app.js:71-95` |
| Low | `setupQuestionEventListeners()` ~175 lines, handles 7+ question types | `js/app.js:1155-1326` |
| Low | Magic numbers (50/1500ms timeouts, 180px clock, 90/70/50 score thresholds) | `js/app.js` |
| Low | `colorMap` duplicates CSS vars | `js/app.js:409-415` |

**Resolved / corrected in the 2026-06-22 audit (were stale in this list):**
- ~~CSS injected from JS~~ — gone; CSS is fully external.
- ~~Dead `renderSubjectCards()`~~ — function does not exist.
- ~~Silent fetch failure~~ — already handled via `failedLoads` + `.load-error-banner`.
- ~~Duplicate keyframes~~ — misdiagnosed; the real issue was *undefined* keyframes (now fixed).

---

## Open Questions

- **Hosting target undecided** — Netlify config removed; all paths relative so GitHub Pages (incl. subdirectory) or any static host works.

---

## Verified Content Counts (2026-06-04, counted from quiz JSON files)

| Area | Files | Questions |
|---|---|---|
| Core subject quizzes | 13 | 291 |
| Term tests (LA 3 / Math 3 / IS 3) | 9 | 135 |
| Workbooks (5 collections, 23 chapters) | 23 | 923 |
| Lesson checks (54 lessons × 4 Q) | 54 | 216 |
| **Total** | **96** | **~1,565** |

Workbook detail: Rediscovering Math 7 ch / 195 Q · ILA 2 ch / 232 Q (Nouns & Pronouns 137, Verbs 95) · Phonics 2 ch / 171 Q (Vowel Sounds 79, Letter Sounds 92) · Ali Baba 2 stories / 63 Q (Androcles 23, A Strange Treasure 40) · NSC Practice 5 ch / 110 Q (Parishes 28, Possessive Pronouns 22, Symmetry 20, Materials 21, Rights & Responsibilities 19).
