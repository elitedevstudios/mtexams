/* ==========================================================================
   Main App - Morgan's Quiz Platform
   ========================================================================== */

const App = {
  // Available quizzes
  quizzes: {},
  
  // Current view state
  currentView: 'home',
  
  // DOM elements
  elements: {},

  /**
   * Initialize the application
   */
  async init() {
    // Cache DOM elements
    this.cacheElements();
    
    // Load settings
    const settings = Storage.loadSettings();
    Feedback.init(settings);
    
    // Load available quizzes
    await this.loadQuizzes();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Show initial view
    this.showHome();
    
    console.log('🎓 Morgan\'s Quiz Platform initialized!');
  },

  /**
   * Cache frequently used DOM elements
   */
  cacheElements() {
    this.elements = {
      main: document.getElementById('main-content'),
      subjectCards: document.getElementById('subject-cards'),
      quizContainer: document.getElementById('quiz-container'),
      homeBtn: document.getElementById('home-btn'),
      progressDisplay: document.getElementById('progress-display')
    };
  },

  /**
   * Load quiz data files
   */
  async loadQuizzes() {
    const quizFiles = [
      'quizzes/phonics-term1.json',
      'quizzes/english-term1.json'
    ];

    for (const file of quizFiles) {
      try {
        const response = await fetch(file);
        if (response.ok) {
          const quiz = await response.json();
          this.quizzes[quiz.id] = quiz;
        }
      } catch (error) {
        console.warn(`Failed to load quiz: ${file}`, error);
      }
    }
  },

  /**
   * Set up global event listeners
   */
  setupEventListeners() {
    // Home button
    if (this.elements.homeBtn) {
      this.elements.homeBtn.addEventListener('click', () => this.showHome());
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (this.currentView === 'quiz') {
        if (e.key === 'ArrowRight' || e.key === 'Enter') {
          const nextBtn = document.querySelector('.quiz-nav__btn--next:not([disabled])');
          if (nextBtn) nextBtn.click();
        }
        if (e.key === 'ArrowLeft') {
          const prevBtn = document.querySelector('.quiz-nav__btn--prev:not([disabled])');
          if (prevBtn) prevBtn.click();
        }
      }
    });
  },

  /**
   * Show home screen
   */
  showHome() {
    this.currentView = 'home';
    const progress = Storage.loadProgress();
    
    this.elements.main.innerHTML = `
      <section class="welcome">
        <h1 class="welcome__greeting">Hi, ${progress.name}! 👋</h1>
        <p class="welcome__message">Ready to learn and have fun? Choose a subject to begin!</p>
        ${progress.streak > 1 ? `<p class="welcome__streak">🔥 ${progress.streak} day streak!</p>` : ''}
      </section>

      <section class="section-title">
        <h2 class="section-title__text">📚 Term 1 Exams</h2>
        <p class="section-title__subtitle">Grade 2 – September to December</p>
      </section>

      <div class="subjects-grid" id="subject-cards">
        ${this.renderSubjectCards()}
      </div>

      <section class="progress-summary">
        <h3>Your Progress</h3>
        <div class="score">
          <span class="score__icon">⭐</span>
          <span class="score__value">${progress.totalStars}</span>
          <span>stars earned</span>
        </div>
      </section>
    `;

    // Add click handlers to subject cards
    document.querySelectorAll('.card--subject').forEach(card => {
      card.addEventListener('click', () => {
        const quizId = card.dataset.quizId;
        this.startQuiz(quizId);
      });
    });
  },

  /**
   * Render subject selection cards
   */
  renderSubjectCards() {
    const progress = Storage.loadProgress();
    
    return Object.values(this.quizzes).map(quiz => {
      const history = progress.quizzes[quiz.id];
      const starsHtml = history 
        ? this.renderStars(history.stars || 0) 
        : '<span class="badge">New!</span>';
      
      return `
        <article class="card card--subject" data-quiz-id="${quiz.id}" tabindex="0">
          <div class="card__icon">${quiz.icon}</div>
          <h3 class="card__title">${quiz.title}</h3>
          <p class="card__description">${quiz.description}</p>
          <div class="card__meta">
            <span class="badge badge--${quiz.subject.toLowerCase()}">${quiz.subject}</span>
            <span class="card__time">⏱️ ${quiz.timeLimit} min</span>
          </div>
          <div class="card__progress">
            ${starsHtml}
            ${history ? `<span class="card__score">Best: ${history.bestScore}%</span>` : ''}
          </div>
        </article>
      `;
    }).join('');
  },

  /**
   * Render star icons
   */
  renderStars(count, max = 3) {
    let html = '<div class="stars">';
    for (let i = 0; i < max; i++) {
      html += `<span class="stars__star ${i < count ? 'stars__star--earned' : ''}">★</span>`;
    }
    html += '</div>';
    return html;
  },

  /**
   * Start a quiz
   */
  startQuiz(quizId) {
    const quiz = this.quizzes[quizId];
    if (!quiz) {
      console.error('Quiz not found:', quizId);
      return;
    }

    this.currentView = 'quiz';
    QuizEngine.init(quiz);
    
    // Show section intro first
    this.showSectionIntro();
  },

  /**
   * Show section introduction
   */
  showSectionIntro() {
    const section = QuizEngine.getCurrentSection();
    const quiz = QuizEngine.state.quiz;
    const sectionProgress = QuizEngine.getSectionProgress();
    
    this.elements.main.innerHTML = `
      <div class="quiz page-enter">
        <header class="quiz__header">
          <div class="quiz__title">
            <span>${quiz.icon}</span>
            <span>${quiz.title}</span>
          </div>
          <div class="progress">
            <div class="progress__bar">
              <div class="progress__fill" style="inline-size: ${QuizEngine.getProgress()}%"></div>
            </div>
            <span class="progress__text">${QuizEngine.getCurrentQuestionNumber()} / ${QuizEngine.getTotalQuestions()}</span>
          </div>
        </header>

        <section class="section-intro slide-in-up">
          <div class="section-intro__icon">📝</div>
          <h2 class="section-intro__title">${section.name}</h2>
          <p class="section-intro__description">${section.instruction}</p>
          <button class="btn btn--primary btn--large" id="start-section-btn">
            Let's Go! 🚀
          </button>
        </section>
      </div>
    `;

    document.getElementById('start-section-btn').addEventListener('click', () => {
      this.showQuestion();
    });
  },

  /**
   * Show current question
   */
  showQuestion() {
    const question = QuizEngine.getCurrentQuestion();
    const section = QuizEngine.getCurrentSection();
    const quiz = QuizEngine.state.quiz;
    const existingAnswer = QuizEngine.getAnswer(
      QuizEngine.state.currentSectionIndex, 
      QuizEngine.state.currentQuestionIndex
    );

    // Check if we need to show passage (for comprehension)
    const passageHtml = section.showPassage && quiz.passage 
      ? this.renderPassage(quiz.passage) 
      : '';

    this.elements.main.innerHTML = `
      <div class="quiz page-enter">
        <header class="quiz__header">
          <div class="quiz__title">
            <span>${quiz.icon}</span>
            <span>${quiz.title}</span>
          </div>
          <div class="progress">
            <div class="progress__bar">
              <div class="progress__fill progress-animate" style="inline-size: ${QuizEngine.getProgress()}%"></div>
            </div>
            <span class="progress__text">${QuizEngine.getCurrentQuestionNumber()} / ${QuizEngine.getTotalQuestions()}</span>
          </div>
        </header>

        <p class="quiz__section-name">${section.name}</p>

        ${passageHtml}

        <article class="question-card slide-in-up" id="question-card">
          <span class="question-card__number">${QuizEngine.getCurrentQuestionNumber()}</span>
          ${question.instruction ? `<p class="question-card__instruction">${question.instruction}</p>` : ''}
          <p class="question-card__prompt">${question.prompt}</p>
          
          <div class="question-card__answers">
            ${this.renderQuestionInput(question, existingAnswer)}
          </div>

          <div id="feedback-container"></div>
        </article>

        <nav class="quiz-nav">
          <button class="btn btn--outline quiz-nav__btn--prev" ${!QuizEngine.hasPreviousQuestion() ? 'disabled' : ''}>
            ← Back
          </button>
          <span class="quiz-nav__info">
            Section ${QuizEngine.state.currentSectionIndex + 1} of ${quiz.sections.length}
          </span>
          <button class="btn btn--primary quiz-nav__btn--next" id="next-btn">
            ${QuizEngine.hasNextQuestion() ? 'Next →' : 'Finish ✓'}
          </button>
        </nav>
      </div>
    `;

    this.setupQuestionEventListeners(question);
  },

  /**
   * Render the reading passage
   */
  renderPassage(passage) {
    return `
      <article class="card passage-card">
        <h3 class="passage-card__title">📖 ${passage.title}</h3>
        <div class="passage-card__content">
          ${passage.content.split('\n\n').map(p => `<p>${p}</p>`).join('')}
        </div>
      </article>
    `;
  },

  /**
   * Render question input based on type
   */
  renderQuestionInput(question, existingAnswer) {
    switch (question.type) {
      case 'multiple-choice':
      case 'circle-word':
      case 'circle-correct':
      case 'tick-correct':
        return this.renderMultipleChoice(question, existingAnswer);

      case 'multi-select':
        return this.renderMultiSelect(question, existingAnswer);

      case 'text-input':
      case 'spelling':
      case 'fill-blank':
        return this.renderTextInput(question, existingAnswer);

      case 'matching':
        return this.renderMatching(question, existingAnswer);

      case 'writing':
        return this.renderWriting(question, existingAnswer);

      default:
        return this.renderMultipleChoice(question, existingAnswer);
    }
  },

  /**
   * Render multiple choice options
   */
  renderMultipleChoice(question, existingAnswer) {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
    
    return `
      <div class="options options--grid stagger-children">
        ${question.options.map((option, index) => {
          const isSelected = existingAnswer?.answer === option;
          const showResult = existingAnswer !== null;
          const isCorrect = option === question.correct;
          
          let stateClass = '';
          if (showResult && isSelected) {
            stateClass = isCorrect ? 'option--correct' : 'option--incorrect';
          } else if (isSelected) {
            stateClass = 'option--selected';
          }

          return `
            <button class="option ${stateClass}" 
                    data-value="${option}" 
                    ${showResult ? 'disabled' : ''}>
              <span class="option__letter">${letters[index]}</span>
              <span class="option__text">${option}</span>
              <span class="option__icon">${showResult && isSelected ? (isCorrect ? '✓' : '✗') : ''}</span>
            </button>
          `;
        }).join('')}
      </div>
    `;
  },

  /**
   * Render multi-select options
   */
  renderMultiSelect(question, existingAnswer) {
    const selectedAnswers = existingAnswer?.answer || [];
    
    return `
      <p class="question-card__instruction">Select ${question.minSelect || 2} answers:</p>
      <div class="options stagger-children">
        ${question.options.map((option, index) => {
          const isSelected = selectedAnswers.includes(option);
          
          return `
            <button class="option ${isSelected ? 'option--selected' : ''}" 
                    data-value="${option}"
                    data-multi="true">
              <span class="option__letter">${isSelected ? '☑' : '☐'}</span>
              <span class="option__text">${option}</span>
            </button>
          `;
        }).join('')}
      </div>
    `;
  },

  /**
   * Render text input
   */
  renderTextInput(question, existingAnswer) {
    const value = existingAnswer?.answer || '';
    const showResult = existingAnswer !== null;
    let inputClass = 'answer-input';
    
    if (showResult) {
      inputClass += existingAnswer.isCorrect ? ' answer-input--correct' : ' answer-input--incorrect';
    }

    return `
      <div class="form-group">
        <input type="text" 
               class="${inputClass}" 
               id="answer-input"
               value="${value}"
               placeholder="Type your answer here..."
               autocomplete="off"
               ${showResult ? 'readonly' : ''}>
      </div>
    `;
  },

  /**
   * Render matching question
   */
  renderMatching(question, existingAnswer) {
    const answers = existingAnswer?.answer || {};
    
    return `
      <div class="matching">
        ${question.pairs.map(pair => `
          <div class="matching__row">
            <span class="matching__item matching__item--left">${pair.left}</span>
            <span class="matching__connector"></span>
            <select class="matching__select" data-left="${pair.left}">
              <option value="">Choose...</option>
              ${pair.options.map(opt => `
                <option value="${opt}" ${answers[pair.left] === opt ? 'selected' : ''}>${opt}</option>
              `).join('')}
            </select>
          </div>
        `).join('')}
      </div>
    `;
  },

  /**
   * Render writing area
   */
  renderWriting(question, existingAnswer) {
    const value = existingAnswer?.answer || '';
    
    return `
      <div class="form-group">
        <textarea class="writing-area" 
                  id="writing-input"
                  placeholder="Write your answer here..."
                  rows="8">${value}</textarea>
        <p class="question-card__instruction">
          Try to write at least ${question.minWords || 20} words.
        </p>
      </div>
    `;
  },

  /**
   * Setup event listeners for question interactions
   */
  setupQuestionEventListeners(question) {
    const questionCard = document.getElementById('question-card');
    const feedbackContainer = document.getElementById('feedback-container');
    const nextBtn = document.getElementById('next-btn');

    // Multiple choice / single select
    if (['multiple-choice', 'circle-word', 'circle-correct', 'tick-correct'].includes(question.type)) {
      questionCard.querySelectorAll('.option:not([disabled])').forEach(option => {
        option.addEventListener('click', () => {
          const value = option.dataset.value;
          const result = QuizEngine.submitAnswer(value);
          
          // Update UI
          questionCard.querySelectorAll('.option').forEach(opt => {
            opt.classList.remove('option--selected');
            opt.disabled = true;
            
            if (opt.dataset.value === question.correct) {
              opt.classList.add('option--correct');
              opt.querySelector('.option__icon').textContent = '✓';
            } else if (opt.dataset.value === value && !result.isCorrect) {
              opt.classList.add('option--incorrect');
              opt.querySelector('.option__icon').textContent = '✗';
            }
          });

          // Show feedback
          if (result.isCorrect) {
            Feedback.showCorrect(option);
            Feedback.showMessage('correct', result.feedback, feedbackContainer);
          } else {
            Feedback.showIncorrect(option);
            Feedback.showMessage('incorrect', result.feedback, feedbackContainer);
            if (result.hint) {
              setTimeout(() => {
                Feedback.showMessage('hint', `💡 Hint: ${result.hint}`, feedbackContainer);
              }, 1500);
            }
          }
        });
      });
    }

    // Multi-select
    if (question.type === 'multi-select') {
      const maxSelect = question.maxSelect || 2;
      let selectedValues = [];

      questionCard.querySelectorAll('.option[data-multi]').forEach(option => {
        option.addEventListener('click', () => {
          const value = option.dataset.value;
          
          if (selectedValues.includes(value)) {
            selectedValues = selectedValues.filter(v => v !== value);
            option.classList.remove('option--selected');
            option.querySelector('.option__letter').textContent = '☐';
          } else if (selectedValues.length < maxSelect) {
            selectedValues.push(value);
            option.classList.add('option--selected');
            option.querySelector('.option__letter').textContent = '☑';
          }
        });
      });

      // Submit on next
      nextBtn.addEventListener('click', (e) => {
        if (selectedValues.length > 0 && !QuizEngine.isCurrentQuestionAnswered()) {
          e.preventDefault();
          QuizEngine.submitAnswer(selectedValues);
        }
      }, { once: true });
    }

    // Text input
    if (['text-input', 'spelling', 'fill-blank'].includes(question.type)) {
      const input = document.getElementById('answer-input');
      
      if (input && !input.readOnly) {
        input.focus();
        
        input.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            this.submitTextAnswer(input, question, feedbackContainer);
          }
        });

        // Also submit on next click
        nextBtn.addEventListener('click', (e) => {
          if (input.value.trim() && !QuizEngine.isCurrentQuestionAnswered()) {
            e.preventDefault();
            this.submitTextAnswer(input, question, feedbackContainer);
          }
        }, { once: true });
      }
    }

    // Writing
    if (question.type === 'writing') {
      const textarea = document.getElementById('writing-input');
      
      nextBtn.addEventListener('click', (e) => {
        if (textarea && textarea.value.trim()) {
          QuizEngine.submitAnswer(textarea.value);
        }
      }, { once: true });
    }

    // Matching
    if (question.type === 'matching') {
      nextBtn.addEventListener('click', (e) => {
        const selects = questionCard.querySelectorAll('.matching__select');
        const answers = {};
        let allFilled = true;
        
        selects.forEach(select => {
          if (select.value) {
            answers[select.dataset.left] = select.value;
          } else {
            allFilled = false;
          }
        });

        if (allFilled && !QuizEngine.isCurrentQuestionAnswered()) {
          e.preventDefault();
          const result = QuizEngine.submitAnswer(answers);
          
          if (result.isCorrect) {
            Feedback.showMessage('correct', result.feedback, feedbackContainer);
            Feedback.playSound('correct');
          } else {
            Feedback.showMessage('incorrect', result.feedback, feedbackContainer);
            Feedback.playSound('incorrect');
          }
        }
      }, { once: true });
    }

    // Navigation
    document.querySelector('.quiz-nav__btn--prev')?.addEventListener('click', () => {
      if (QuizEngine.previousQuestion()) {
        // Check if we're at start of a new section
        this.showQuestion();
      }
    });

    nextBtn.addEventListener('click', () => {
      if (QuizEngine.hasNextQuestion()) {
        const currentSection = QuizEngine.state.currentSectionIndex;
        QuizEngine.nextQuestion();
        
        // Check if we moved to a new section
        if (QuizEngine.state.currentSectionIndex !== currentSection) {
          this.showSectionIntro();
        } else {
          this.showQuestion();
        }
      } else {
        // Quiz complete
        this.showResults();
      }
    });
  },

  /**
   * Submit text answer
   */
  submitTextAnswer(input, question, feedbackContainer) {
    const value = input.value.trim();
    if (!value) return;

    // Check for acceptable answers
    let isCorrect = false;
    const normalizedValue = value.toLowerCase();
    
    if (question.acceptableAnswers) {
      isCorrect = question.acceptableAnswers.some(
        ans => ans.toLowerCase() === normalizedValue
      );
    } else {
      isCorrect = normalizedValue === question.correct.toLowerCase();
    }

    // Manually set correctness since we're handling acceptable answers
    const questionKey = `${QuizEngine.state.currentSectionIndex}-${QuizEngine.state.currentQuestionIndex}`;
    QuizEngine.state.answers[questionKey] = {
      answer: value,
      isCorrect: isCorrect,
      timestamp: Date.now()
    };

    input.readOnly = true;
    input.classList.add(isCorrect ? 'answer-input--correct' : 'answer-input--incorrect');

    if (isCorrect) {
      Feedback.playSound('correct');
      Feedback.showMessage('correct', Feedback.getRandomMessage(true), feedbackContainer);
    } else {
      Feedback.playSound('incorrect');
      Feedback.showMessage('incorrect', `The correct answer is: ${question.correct}`, feedbackContainer);
    }
  },

  /**
   * Show quiz results
   */
  showResults() {
    this.currentView = 'results';
    const score = QuizEngine.calculateScore();
    const quiz = QuizEngine.state.quiz;

    // Save results
    Storage.saveQuizResult(quiz.id, score);

    // Show celebration
    Feedback.showCelebration(score.score, score.stars);

    const celebrationEmoji = score.score >= 90 ? '🏆' : score.score >= 70 ? '🎉' : score.score >= 50 ? '⭐' : '💪';

    this.elements.main.innerHTML = `
      <div class="results page-enter">
        <div class="results__celebration trophy-bounce">${celebrationEmoji}</div>
        <h1 class="results__title">Quiz Complete!</h1>
        
        <div class="results__score">
          You scored <span class="results__score-value">${score.score}%</span>
        </div>

        <div class="results__stars">
          ${this.renderStars(score.stars)}
        </div>

        <p class="results__message">${score.message}</p>

        <div class="results__stats card">
          <div class="stat">
            <span class="stat__icon">✅</span>
            <span class="stat__value">${score.correctAnswers}</span>
            <span class="stat__label">Correct</span>
          </div>
          <div class="stat">
            <span class="stat__icon">❌</span>
            <span class="stat__value">${score.incorrectAnswers}</span>
            <span class="stat__label">Incorrect</span>
          </div>
          <div class="stat">
            <span class="stat__icon">⏱️</span>
            <span class="stat__value">${Math.floor(score.timeSpent / 60)}:${(score.timeSpent % 60).toString().padStart(2, '0')}</span>
            <span class="stat__label">Time</span>
          </div>
        </div>

        <div class="results__actions">
          <button class="btn btn--outline" id="retry-btn">
            Try Again 🔄
          </button>
          <button class="btn btn--primary" id="home-btn-results">
            Back Home 🏠
          </button>
        </div>
      </div>
    `;

    // Add styles for results stats
    const style = document.createElement('style');
    style.textContent = `
      .results__stats {
        display: flex;
        justify-content: center;
        gap: var(--space-xl);
        margin-block: var(--space-xl);
      }
      .stat {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-xs);
      }
      .stat__icon {
        font-size: 1.5rem;
      }
      .stat__value {
        font-size: var(--font-size-xl);
        font-weight: 700;
        font-family: var(--font-family-display);
      }
      .stat__label {
        font-size: var(--font-size-sm);
        color: var(--color-text-muted);
      }
      .passage-card {
        margin-block-end: var(--space-xl);
        background: var(--color-accent);
      }
      .passage-card__title {
        margin-block-end: var(--space-md);
      }
      .passage-card__content p {
        margin-block-end: var(--space-md);
        line-height: 1.8;
      }
      .welcome__streak {
        font-size: var(--font-size-lg);
        color: var(--color-accent-dark);
        margin-block-start: var(--space-sm);
      }
      .card__meta {
        display: flex;
        gap: var(--space-sm);
        margin-block: var(--space-sm);
        justify-content: center;
      }
      .card__time {
        color: var(--color-text-muted);
        font-size: var(--font-size-sm);
      }
      .card__progress {
        margin-block-start: var(--space-md);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-xs);
      }
      .card__score {
        font-size: var(--font-size-sm);
        color: var(--color-text-muted);
      }
      .progress-summary {
        text-align: center;
        margin-block-start: var(--space-2xl);
        padding-block-start: var(--space-xl);
        border-block-start: 2px solid var(--color-border);
      }
      .progress-summary h3 {
        margin-block-end: var(--space-md);
        color: var(--color-text-muted);
      }
    `;
    document.head.appendChild(style);

    document.getElementById('retry-btn').addEventListener('click', () => {
      QuizEngine.reset();
      this.showSectionIntro();
    });

    document.getElementById('home-btn-results').addEventListener('click', () => {
      this.showHome();
    });
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => App.init());
