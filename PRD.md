# Product Requirements Document (PRD)
## Morgan's Learning Adventure - Educational Quiz Platform

**Version:** 1.0  
**Last Updated:** December 23, 2024  
**Status:** Active Development

---

## 1. Product Overview

### 1.1 Vision
An engaging, colorful educational quiz platform designed specifically for **Morgan**, a 7-year-old Grade 2 student in Jamaica. The platform provides interactive assessments aligned with the Jamaica National Standards Curriculum (NSC).

### 1.2 Goals
- Provide fun, age-appropriate learning experiences
- Track progress and celebrate achievements
- Support multiple subject areas from the NSC curriculum
- Work offline-first with no external dependencies
- Maintain child-safe, distraction-free environment

### 1.3 Target User
- **Primary:** Morgan (Grade 2, Age 7)
- **Secondary:** Parents/guardians for progress monitoring

---

## 2. Technical Stack

| Component | Technology |
|-----------|------------|
| Frontend | Vanilla HTML, CSS, JavaScript (ES6+) |
| Styling | Custom CSS with BEM methodology, CSS Custom Properties, Container Queries |
| Data Storage | localStorage (client-side only) |
| Hosting | Netlify |
| Build Tools | None (no build step required) |

### 2.1 Design Principles
- **Large touch targets** (60px+ buttons)
- **High contrast** colors for readability
- **Logical CSS properties** for internationalization
- **Container queries** for component-level responsiveness
- **Reduced motion** support for accessibility

---

## 3. Core Features

### 3.1 Quiz System
| Feature | Status | Description |
|---------|--------|-------------|
| Multiple Choice | ✅ Complete | Standard A/B/C/D selection |
| Multi-Select | ✅ Complete | Select multiple correct answers |
| Text Input | ✅ Complete | Free-form text answers |
| Fill-in-Blank | ✅ Complete | Complete sentences |
| Matching | ✅ Complete | Connect related items |
| Writing | ✅ Complete | Extended response (auto-accepted) |

### 3.2 Subject Coverage
| Category | Subjects | Quiz Files |
|----------|----------|------------|
| Language Arts | Grammar, Reading, Phonics, Spelling, Creative Writing | 5 files |
| Mathematics | Number Sense, Operations, Shapes, Time, Money | 4 files |
| Integrated Studies | Science, Social Studies, Health | 1 file |
| Technology | Computer Studies | 1 file |
| Languages | Spanish | 1 file |
| Arts | Music | 1 file |

### 3.3 Progress & Gamification
- **Star System:** 1-3 stars based on score (50%/70%/90%)
- **Streak Tracking:** Daily practice counter
- **Progress Persistence:** localStorage saves all progress
- **Review Mode:** Review answers after quiz completion

### 3.4 Workbook Review System
- Separate module for workbook-based practice
- Chapter/topic organization
- Section-by-section quiz progression

---

## 4. File Architecture

```
/Morgan Test Site
├── index.html              # Main quiz application
├── workbook-review.html    # Workbook review module
├── css/
│   ├── base.css            # Reset, variables, typography
│   ├── components.css      # Buttons, cards, inputs
│   ├── navigation.css      # Category nav, subject cards
│   ├── quiz.css            # Quiz-specific styles
│   └── animations.css      # Celebrations, transitions
├── js/
│   ├── app.js              # Main application (1448 lines)
│   ├── quiz-engine.js      # Quiz logic & scoring (350 lines)
│   ├── feedback.js         # Sounds, animations (306 lines)
│   ├── storage.js          # localStorage wrapper (205 lines)
│   └── workbook-review.js  # Workbook module (484 lines)
├── quizzes/
│   ├── [subject].json      # 13 quiz data files
│   └── workbooks/          # Workbook quiz data
└── assets/
    └── images/             # Illustrations, shapes
```

---

## 5. Data Models

### 5.1 Quiz Structure
```json
{
  "id": "unique-quiz-id",
  "title": "Quiz Title",
  "subject": "Subject Name",
  "category": "category-key",
  "icon": "📚",
  "description": "Brief description",
  "timeLimit": 10,
  "sections": [
    {
      "id": "section-id",
      "name": "Section Name",
      "instruction": "Instructions for section",
      "questions": [...]
    }
  ]
}
```

### 5.2 Question Types
```json
{
  "id": "q1",
  "type": "multiple-choice|multi-select|text-input|fill-blank|matching|writing",
  "prompt": "Question text",
  "options": ["A", "B", "C", "D"],
  "correct": "B",
  "hint": "Optional hint",
  "image": "optional-image.png"
}
```

### 5.3 Progress Storage
```json
{
  "name": "Morgan",
  "quizzes": {
    "quiz-id": {
      "completed": true,
      "score": 85,
      "bestScore": 90,
      "stars": 3,
      "attempts": 2,
      "date": "ISO-8601"
    }
  },
  "totalStars": 45,
  "streak": 5,
  "lastPlayed": "ISO-8601"
}
```

---

## 6. User Flows

### 6.1 Main Quiz Flow
```
Home → Select Category → Select Quiz → Section Intro → 
Questions (1..n) → Results → Review (optional) → Home
```

### 6.2 Workbook Flow
```
Workbooks List → Select Workbook → Select Chapter → 
Select Topic → Questions → Results → Back to Topics
```

---

## 7. Non-Functional Requirements

### 7.1 Performance
- First contentful paint < 1.5s
- No external API calls during quiz
- All assets loaded locally

### 7.2 Accessibility
- WCAG 2.1 AA compliance target
- Keyboard navigation support
- Screen reader compatible
- Reduced motion support

### 7.3 Browser Support
- Modern browsers (Chrome, Safari, Firefox, Edge)
- Tablet-first design (iPad primary device)
- Mobile responsive

### 7.4 Security
- No personal data collection beyond first name
- No external network requests
- All data stored client-side only

---

## 8. Known Limitations

1. **No user authentication** - Single user assumed
2. **No cloud sync** - Progress tied to device/browser
3. **Writing questions auto-accepted** - No AI grading
4. **No audio for question reading** - Text-only prompts
5. **Limited offline indicator** - No explicit offline mode UI

---

## 9. Future Considerations

- [ ] Text-to-speech for question prompts
- [ ] Parent dashboard/progress reports
- [ ] Printable certificates
- [ ] Additional grade levels
- [ ] Multiplayer/competitive modes
- [ ] PWA with offline support

---

## 10. Success Metrics

| Metric | Target |
|--------|--------|
| Quiz completion rate | > 80% |
| Average session duration | 10-15 minutes |
| Return visits (streak) | 3+ days/week |
| Average score improvement | +10% over time |

---

*This PRD is a living document. Update as the project evolves.*
