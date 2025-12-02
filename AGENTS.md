# AGENTS.md - Kids Educational Quiz Platform

## Project Overview

A colorful, interactive educational quiz and assessment website for **Morgan**, a 7-year-old Grade 2 student in Jamaica. Built with vanilla HTML, CSS, and JavaScript—no frameworks, no build tools, just clean simple code.

### Curriculum Alignment
Follows the **Jamaica National Standards Curriculum (NSC)** for Grade 2:
- **Language Arts**: Reading comprehension, phonics, vocabulary, spelling, sentence structure
- **Mathematics**: Number sense (0-100), addition, subtraction, basic multiplication concepts, shapes, measurement, time, money (Jamaican dollars)
- **Integrated Studies**: Science, social studies, health & family life education

Reference: https://moey.gov.jm/curriculum/

---

## Design Principles for Kids

### Visual Design
- **Large touch targets**: Buttons minimum 48px, ideally 60px+ for young children
- **High contrast**: Dark text on light backgrounds, colorful accents
- **Rounded corners**: Soft, friendly shapes (border-radius: 12px-20px)
- **Playful fonts**: Use readable, child-friendly fonts (Comic Neue, Nunito, Fredoka One)
- **Generous whitespace**: Don't crowd elements—kids need breathing room

### Color Palette (Suggested)
```css
:root {
  /* Primary - Friendly & Engaging */
  --color-primary: oklch(65% 0.2 250);      /* Bright blue */
  --color-secondary: oklch(75% 0.18 150);   /* Fresh green */
  --color-accent: oklch(80% 0.2 80);        /* Sunny yellow */
  
  /* Feedback Colors */
  --color-correct: oklch(70% 0.2 145);      /* Success green */
  --color-incorrect: oklch(65% 0.2 25);     /* Gentle red */
  --color-highlight: oklch(85% 0.15 320);   /* Encouraging purple */
  
  /* Neutrals */
  --color-bg: oklch(98% 0.01 250);          /* Soft off-white */
  --color-card: oklch(100% 0 0);            /* Pure white */
  --color-text: oklch(25% 0.02 250);        /* Near black */
  --color-text-muted: oklch(50% 0.02 250);  /* Gray */
}
```

### Interactions & Feedback
- **Immediate feedback**: Show correct/incorrect instantly with animation
- **Positive reinforcement**: Celebrate correct answers (confetti, stars, sounds)
- **Gentle error handling**: Never shame—encourage retry with hints
- **Progress indicators**: Show how far along in the quiz
- **Sound effects**: Optional audio cues (can be toggled off)

---

## File Structure

```
/Morgan Test Site
├── AGENTS.md
├── index.html                      # Homepage / quiz selector
├── css/
│   ├── base.css                    # Reset, variables, typography
│   ├── components.css              # Buttons, cards, inputs
│   ├── navigation.css              # Category nav, subject cards, dashboard
│   ├── quiz.css                    # Quiz-specific styles
│   └── animations.css              # Fun animations & transitions
├── js/
│   ├── app.js                      # Main application logic
│   ├── quiz-engine.js              # Quiz logic, scoring, state
│   ├── feedback.js                 # Animations, sounds, celebrations
│   └── storage.js                  # Save progress (localStorage)
├── quizzes/
│   ├── english-grammar.json        # Nouns, verbs, adjectives, pronouns
│   ├── reading-comprehension.json  # Stories with questions
│   ├── phonics.json                # Letter sounds, blends, rhyming
│   ├── spelling-dictation.json     # Spelling and sentence writing
│   ├── creative-writing.json       # Story writing, descriptions
│   ├── mathematics.json            # Numbers, operations, shapes, time
│   ├── integrated-studies.json     # Jamaica, science, health
│   ├── computer-studies.json       # Computer basics, internet safety
│   ├── spanish.json                # Basic Spanish vocabulary
│   └── music.json                  # Rhythm, instruments, Jamaican music
├── assets/
│   ├── images/                     # Illustrations, icons
│   ├── sounds/                     # Audio feedback (optional)
│   └── fonts/                      # Web fonts if needed
└── tests/
    └── quiz-engine.test.js         # Unit tests for quiz logic
```

## Subject Categories

| Category | Subjects | NSC Aligned |
|----------|----------|-------------|
| **Language Arts** | English Grammar, Reading Comprehension, Phonics, Spelling & Dictation, Creative Writing | ✅ Yes |
| **Mathematics** | Mathematics | ✅ Yes |
| **Integrated Studies** | Science, Social Studies, Health | ✅ Yes |
| **Technology** | Computer Studies | Global standards |
| **Languages** | Spanish | Global standards |
| **Arts** | Music | Jamaican focus |

---

## Code Style Guidelines

### HTML
- Semantic elements: `<main>`, `<section>`, `<article>`, `<button>`
- Meaningful class names using BEM methodology
- ARIA labels for accessibility
- Keep markup simple and readable

```html
<!-- Good Example -->
<section class="quiz">
  <header class="quiz__header">
    <h1 class="quiz__title">Addition Fun!</h1>
    <div class="quiz__progress" role="progressbar" aria-valuenow="3" aria-valuemax="10">
      Question 3 of 10
    </div>
  </header>
  
  <article class="quiz__question">
    <p class="quiz__prompt">What is 5 + 3?</p>
    <div class="quiz__options">
      <button class="quiz__option" data-value="7">7</button>
      <button class="quiz__option" data-value="8">8</button>
      <button class="quiz__option" data-value="9">9</button>
    </div>
  </article>
</section>
```

### CSS
- **BEM naming**: `.block__element--modifier`
- **Logical properties**: Always use `margin-inline`, `padding-block`, etc.
- **Container queries**: For responsive quiz cards
- **CSS custom properties**: For theming and consistency
- **No `!important`**: Keep specificity low

```css
/* Good Example */
.quiz-card {
  container-type: inline-size;
  container-name: quiz-card;
  
  padding-block: var(--space-lg);
  padding-inline: var(--space-md);
  border-radius: var(--radius-lg);
  background: var(--color-card);
}

@container quiz-card (min-inline-size: 400px) {
  .quiz-card__options {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-md);
  }
}
```

### JavaScript
- Vanilla JS only—no frameworks
- ES6+ features (const/let, arrow functions, template literals)
- Modular code with clear functions
- Descriptive variable names
- JSDoc comments for functions

```javascript
/**
 * Check if the selected answer is correct and update score
 * @param {string} selectedAnswer - The answer chosen by the student
 * @param {string} correctAnswer - The correct answer
 * @returns {boolean} Whether the answer was correct
 */
function checkAnswer(selectedAnswer, correctAnswer) {
  const isCorrect = selectedAnswer === correctAnswer;
  
  if (isCorrect) {
    playSound('correct');
    showCelebration();
    incrementScore();
  } else {
    playSound('tryAgain');
    showEncouragement();
  }
  
  return isCorrect;
}
```

---

## Quiz Data Format

Store quiz questions as JSON for easy editing:

```json
{
  "id": "math-addition-1",
  "title": "Addition Adventure",
  "subject": "Mathematics",
  "topic": "Addition (0-20)",
  "grade": 2,
  "questions": [
    {
      "id": "q1",
      "type": "multiple-choice",
      "prompt": "What is 5 + 3?",
      "options": ["7", "8", "9", "6"],
      "correct": "8",
      "hint": "Count 5 fingers, then count 3 more!",
      "image": null
    },
    {
      "id": "q2",
      "type": "multiple-choice",
      "prompt": "Morgan has 4 mangoes. She gets 6 more. How many mangoes does she have now?",
      "options": ["9", "10", "11", "8"],
      "correct": "10",
      "hint": "Start at 4 and count up 6 more.",
      "image": "mango.png"
    }
  ]
}
```

---

## Testing Instructions

### Manual Testing Checklist
- [ ] All buttons are large enough to tap easily
- [ ] Colors have sufficient contrast (use browser dev tools)
- [ ] Quiz loads without errors (check console)
- [ ] Correct answers show positive feedback
- [ ] Wrong answers encourage retry without shame
- [ ] Progress saves when page is closed
- [ ] Works on tablet/iPad (primary device for kids)
- [ ] Sounds can be muted
- [ ] Keyboard navigation works (Tab, Enter, Space)

### Browser Testing
```bash
# Open in default browser
open index.html

# Or start a simple local server
python3 -m http.server 8000
# Then visit http://localhost:8000
```

### Accessibility Testing
- Test with VoiceOver (Cmd + F5 on Mac)
- Check color contrast with browser DevTools
- Ensure all interactive elements are focusable
- Verify ARIA labels are meaningful

### JavaScript Unit Tests
If adding tests, use a simple test runner or inline assertions:

```javascript
// tests/quiz-engine.test.js
console.assert(checkAnswer('8', '8') === true, 'Correct answer should return true');
console.assert(checkAnswer('7', '8') === false, 'Wrong answer should return false');
console.assert(calculateScore([true, true, false]) === 66, 'Score should be 66%');
```

---

## Accessibility Requirements

### For Young Readers
- Large, readable fonts (minimum 18px body, 24px+ for questions)
- Simple vocabulary in UI labels
- Icons paired with text labels
- Audio option for reading questions aloud

### WCAG Compliance
- Focus states visible on all interactive elements
- Reduced motion support for animations
- Sufficient color contrast (4.5:1 minimum)
- Screen reader friendly

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}
```

---

## Development Commands

```bash
# Start local development server
python3 -m http.server 8000

# Format HTML (if using prettier)
npx prettier --write "**/*.html"

# Validate HTML
npx html-validate "**/*.html"

# Check CSS (optional)
npx stylelint "css/**/*.css"
```

---

## Content Guidelines

### Language for Grade 2 Jamaica
- Use Jamaican context (mangoes, ackee, Jamaican dollars, parishes)
- Simple, clear sentences
- Encouraging tone ("Great job!", "Try again!", "You're doing amazing!")
- Avoid slang in questions, keep formal but friendly

### Question Writing Tips
- One concept per question
- Clear, unambiguous wording
- Reasonable distractors (wrong answers should be plausible)
- Include visual aids where helpful
- Mix question types to maintain engagement

---

## Progress Tracking

Store student progress in localStorage:

```javascript
const progress = {
  name: "Morgan",
  quizzes: {
    "math-addition-1": {
      completed: true,
      score: 90,
      date: "2024-12-01",
      attempts: 1
    }
  },
  totalStars: 15,
  streak: 3
};

localStorage.setItem('studentProgress', JSON.stringify(progress));
```

---

## Celebration & Rewards

### Star System
- 1 star: Complete a quiz
- 2 stars: Score 70%+
- 3 stars: Score 90%+

### Visual Celebrations
- Confetti animation for correct answers
- Star burst for quiz completion
- Badge unlocks for achievements
- Streak counter for daily practice

---

## Security Notes

- No external API calls needed—all content is local
- No personal data collection beyond first name
- localStorage only—no server storage
- Safe for offline use

---

## Helpful Resources

- [Jamaica NSC Curriculum](https://moey.gov.jm/curriculum/)
- [WCAG Accessibility Guidelines](https://www.w3.org/WAI/standards-guidelines/wcag/)
- [CSS Logical Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_logical_properties_and_values)
- [Container Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries)

---

*This AGENTS.md is a living document. Update as the project evolves.*
