# Changelog

All notable changes to Learning Adventure will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

### Added
- **NSC Practice workbook** — new curriculum-based collection (no scans
  needed), 5 chapters / 110 questions covering every high-priority
  curriculum gap:
  - **Jamaica's Parishes** (28 Q) — counties, parishes, capitals, fun facts
  - **Possessive Pronouns** (22 Q) — mine/yours/his/hers/ours/theirs,
    my/your before nouns, mine-vs-my usage
  - **Symmetry** (20 Q) — lines of symmetry, symmetrical letters/numbers,
    shape fold counts, Jamaican flag symmetry
  - **Materials & Properties** (21 Q) — wood/metal/plastic/glass/cloth/paper,
    hard/soft/rough/smooth/waterproof, right material for the job
  - **Rights & Responsibilities** (19 Q) — children's rights vs wants,
    duties at home/school/community, rights-duties pairs
- **Text-to-speech** — 🔊 read-aloud button beside every question prompt
  (Home quizzes, workbooks, lesson checks, tests) using the Web Speech API.
  Tap to hear the question, tap again to stop; hidden automatically on
  browsers without speech support (`js/tts.js`)
- `docs/PROGRESS.md` — living progress tracker (done / in progress / next up /
  tech debt); updated after every change

### Changed
- Service worker bumped to `learning-adventure-v8`; precaches all 5 NSC
  Practice chapters and `js/tts.js`
- Workbook chapter "pages" labels: non-numeric values (e.g. curriculum-based
  chapters) now display without the "Pages" prefix

### Fixed
- Doc audit: corrected question counts across docs (Ali Baba 23 + 40 = 63;
  workbooks total 661 Q; grand total ~1,303 Q across 86 quiz files),
  refreshed stale FEATURES.md (was pre-v1.2.0), completed the version
  history table below, checked off shipped PRD items

---

## [1.5.0] - 2026-06-03

### Added
- **Language Arts term tests** (3 × 15 questions) — phonics/digraphs/pronouns,
  nouns/verbs/reading, rhyming/adjectives/facts — aligned to Terms 1-3 lessons
- **Integrated Studies term tests** (3 × 15 questions) — body/senses/health,
  family/helpers/living things, weather/environment/Jamaica
- Tests page now groups all 9 assessments by subject (Language Arts /
  Mathematics / Integrated Studies); "coming soon" placeholder removed

### Changed
- Service worker bumped to `learning-adventure-v5`; precaches the 6 new
  assessment files

---

## [1.4.0] - 2026-06-03

### Added
- **Term 3 lessons** — 17 new lessons; **full school year now covered (54 lessons)**:
  - Language Arts (6): rhyming & word families, context clues, conjunctions,
    adjectives, informational writing, reading fluency & expression
  - Mathematics (6): numbers to 999, comparing 3-digit numbers, measurement
    (length/mass/capacity), Jamaican money, 2D shapes, 3D shapes
  - Integrated Studies (5): weather & seasons, water cycle, caring for the
    environment, **Jamaica's national symbols**, **Jamaica's national heroes**
    (Jamaican-made videos for both)
  - All 17 videos verified embeddable via YouTube oEmbed

### Changed
- Service worker bumped to `learning-adventure-v4`; precaches all Term 3
  lesson data

---

## [1.3.0] - 2026-06-03

### Added
- **Term 2 lessons** — 19 new lessons (37 total):
  - Language Arts (7): plural nouns, proper nouns & capitals, past tense,
    subject-verb agreement, making predictions, main idea & details,
    writing a story
  - Mathematics (7): subtraction to 20, 2-digit addition & subtraction with
    regrouping, word problems, skip counting, intro multiplication,
    telling time
  - Integrated Studies (5): families, community helpers, goods & services,
    living vs non-living, plants & how they grow
  - All 19 videos verified embeddable via YouTube oEmbed
- **Term grouping** on the Lessons page — Term 1 / Term 2 dividers within
  each subject

### Changed
- Service worker bumped to `learning-adventure-v3`; precaches all Term 2
  lesson data

---

## [1.2.0] - 2026-06-03

### Added
- **Lessons section** (`lessons.html`) — 18 Term 1 curriculum lessons across
  Language Arts (7), Mathematics (7), and Integrated Studies (4). Each lesson:
  embedded YouTube video (verified embeddable; Jack Hartmann, Homeschool Pop,
  NUMBEROCK, SciShow Kids, Learn Bright, Sesame Street), kid-friendly
  "What to remember" steps, and a 4-question "Did you get it?" check that
  awards stars
- **Attendance check-in** — "I'm here!" button on Home stamps the day on a
  month calendar with star stamps, tracks a streak, fires confetti; 🔥 streak
  pill in the header on every page
- **Tests section** (`assessments.html`) — dedicated page for the three
  Mathematics Assessments (moved off the Home grid), with best-score badges
- **Persistent 4-tab navigation** — Home / Lessons / Workbooks / Tests on all
  pages with active states; icon-only compact tabs on small screens
- Storage API: lesson completion (`markLessonComplete`, best-stars guard
  against double counting) and attendance (`checkInToday`, `getAttendanceStreak`)

### Changed
- Service worker bumped to `learning-adventure-v2`; precaches new pages and
  all lesson data; `ignoreSearch` matching so cache-busted index fetches work
  offline
- Total stars now counted across quizzes + lessons

### Fixed
- Mathematics Assessments no longer appear under a mis-labeled category on
  the Home grid

---

## [1.1.1] - 2026-06-03 (previously unreleased; shipped with the 2026-06-03 releases)

### Added
- **Ali Baba Stories Workbook** - New reading comprehension workbook
  - "Androcles and the Lion" story with 23 questions
    - Comprehension skills (10 questions)
    - Inference/critical thinking (5 questions)
    - Vocabulary (5 questions)
    - Story sequencing (3 questions)
  - "A Strange Treasure" story with 40 questions
    - Comprehension skills (10 questions)
    - Critical literacy (5 questions)
    - Vocabulary (5 questions)
    - Language Development: Fruits (5 questions)
    - Language Development: Plurals (5 questions)
    - Language Development: Collective Nouns (5 questions)
    - Language Development: Opposites/Antonyms (5 questions)

---

## [1.1.0] - 2026-01-07

### Added
- **Rebranding** - Changed from "Morgan's Learning" to "Learning Adventure"
- **First-time User Name Prompt** - Modal popup asks new users for their name
- **Personalized Greetings** - User's name displayed throughout the site
- **Interactive Math Components** - New Canvas/SVG elements for math questions
  - Number lines with tick marks
  - Analog clocks for time-telling
  - Counting objects (apples, stars, mangoes, etc.)
  - Shape grids for geometry
  - Place value blocks
  - Fraction visualizations
- **Rediscovering Mathematics Workbook** - 6 chapters with ~155 questions
  - Chapter 1: Numbers to 100 (28 questions)
  - Chapter 2: Addition (26 questions)
  - Chapter 3: Subtraction (25 questions)
  - Chapter 4: Telling Time (25 questions)
  - Chapter 5: Shapes and Geometry (26 questions)
  - Chapter 6: Money - Jamaican Dollars (25 questions)

### Changed
- Updated localStorage keys from `morganQuiz*` to `learningAdventure*`
- Improved interactive question layout (centered visuals, horizontal answer grid)
- Updated footer text to be generic

### Fixed
- Interactive elements not rendering in workbook review
- Answer buttons displaying vertically instead of horizontally

---

## [1.0.0] - 2025-12-23

### Added
- Initial release of Learning Adventure quiz platform
- **Core Quiz Engine** - Multiple question types support
  - Multiple choice
  - Multi-select
  - Text input
  - Fill-in-the-blank
  - Matching
- **Subject Categories**
  - Language Arts (Grammar, Reading, Phonics, Spelling, Creative Writing)
  - Mathematics
  - Integrated Studies
  - Spanish
  - Music
  - Computer Studies
- **Workbook Review System** - Practice from school workbooks
  - Integrated Language Arts Workbook
  - Integrated Phonics Workbook
- **Progress Tracking** - Stars, streaks, and achievements
- **Sound Effects & Animations** - Celebration feedback for correct answers
- **Jamaica NSC Curriculum Alignment** - Grade 2 standards

---

## Version History Summary

| Version | Date | Highlights |
|---------|------|------------|
| 1.5.0 | 2026-06-03 | LA + IS term tests — 9 tests total, subject-grouped Tests page |
| 1.4.0 | 2026-06-03 | Term 3 lessons (17) — full school year covered, 54 lessons |
| 1.3.0 | 2026-06-03 | Term 2 lessons (19), term-grouped Lessons UI |
| 1.2.0 | 2026-06-03 | Lessons section, attendance check-in, Tests page, 4-tab nav |
| 1.1.1 | 2026-06-03 | Ali Baba Stories workbook (2 stories, 63 questions) |
| 1.1.0 | 2026-01-07 | Rebranding, name prompt, interactive math, Rediscovering Mathematics workbook |
| 1.0.0 | 2025-12-23 | Initial release with core quiz features |

---

*Made with ❤️ for Grade 2 students following the Jamaica NSC Curriculum*
