/* ==========================================================================
   Main App - Morgan's Quiz Platform (Expanded Version)
   ========================================================================== */

const App = {
  // Available quizzes
  quizzes: {},
  
  // Current view state
  currentView: 'home',
  currentCategory: 'all',
  
  // Categories configuration
  categories: {
    all: { name: 'All Subjects', icon: '📚' },
    'language-arts': { name: 'Language Arts', icon: '📝' },
    mathematics: { name: 'Mathematics', icon: '🔢' },
    integrated: { name: 'Integrated Studies', icon: '🌍' },
    technology: { name: 'Technology', icon: '💻' },
    language: { name: 'Languages', icon: '🌐' },
    arts: { name: 'Arts', icon: '🎨' }
  },
  
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
      'quizzes/english-grammar.json',
      'quizzes/reading-comprehension.json',
      'quizzes/phonics.json',
      'quizzes/spelling-dictation.json',
      'quizzes/creative-writing.json',
      'quizzes/mathematics.json',
      'quizzes/mathematics-assessment-1.json',
      'quizzes/mathematics-assessment-2.json',
      'quizzes/mathematics-assessment-3.json',
      'quizzes/integrated-studies.json',
      'quizzes/computer-studies.json',
      'quizzes/spanish.json',
      'quizzes/music.json'
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
    const stats = this.calculateStats(progress);
    const userName = progress.name || 'Friend';
    
    this.elements.main.innerHTML = `
      <section class="welcome">
        <h1 class="welcome__greeting">Hi, ${userName}! 👋</h1>
        <p class="welcome__message">Ready to learn and have fun? Choose a subject to begin!</p>
        ${progress.streak > 1 ? `<p class="welcome__streak">🔥 ${progress.streak} day streak! Keep it up!</p>` : ''}
      </section>

      <!-- Dashboard Stats -->
      <div class="dashboard-stats">
        <div class="stat-card">
          <span class="stat-card__icon">⭐</span>
          <span class="stat-card__value">${progress.totalStars}</span>
          <span class="stat-card__label">Stars Earned</span>
        </div>
        <div class="stat-card">
          <span class="stat-card__icon">✅</span>
          <span class="stat-card__value">${stats.completed}</span>
          <span class="stat-card__label">Completed</span>
        </div>
        <div class="stat-card">
          <span class="stat-card__icon">📚</span>
          <span class="stat-card__value">${stats.total}</span>
          <span class="stat-card__label">Total Quizzes</span>
        </div>
        <div class="stat-card">
          <span class="stat-card__icon">🏆</span>
          <span class="stat-card__value">${stats.bestScore}%</span>
          <span class="stat-card__label">Best Score</span>
        </div>
      </div>

      <!-- Category Navigation -->
      <nav class="nav-categories" role="navigation" aria-label="Subject categories">
        ${this.renderCategoryNav()}
      </nav>

      <!-- Subjects by Category -->
      <div id="subjects-container">
        ${this.renderSubjectsByCategory()}
      </div>
    `;

    // Add event listeners
    this.setupHomeEventListeners();
  },

  /**
   * Calculate dashboard stats
   */
  calculateStats(progress) {
    const total = Object.keys(this.quizzes).length;
    const completed = Object.keys(progress.quizzes).filter(
      id => progress.quizzes[id].completed
    ).length;
    
    const scores = Object.values(progress.quizzes)
      .filter(q => q.completed)
      .map(q => q.bestScore || q.score || 0);
    
    const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
    
    return { total, completed, bestScore };
  },

  /**
   * Render category navigation
   */
  renderCategoryNav() {
    return Object.entries(this.categories).map(([key, cat]) => {
      const count = key === 'all' 
        ? Object.keys(this.quizzes).length 
        : Object.values(this.quizzes).filter(q => q.category === key).length;
      
      if (count === 0 && key !== 'all') return '';
      
      const isActive = this.currentCategory === key;
      
      return `
        <button class="nav-category ${isActive ? 'nav-category--active' : ''}" 
                data-category="${key}"
                aria-pressed="${isActive}">
          <span class="nav-category__icon">${cat.icon}</span>
          <span class="nav-category__name">${cat.name}</span>
          <span class="nav-category__count">${count}</span>
        </button>
      `;
    }).join('');
  },

  /**
   * Render subjects organized by category
   */
  renderSubjectsByCategory() {
    const progress = Storage.loadProgress();
    const filteredQuizzes = this.currentCategory === 'all'
      ? Object.values(this.quizzes)
      : Object.values(this.quizzes).filter(q => q.category === this.currentCategory);
    
    if (filteredQuizzes.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-state__icon">📭</div>
          <h3 class="empty-state__title">No quizzes found</h3>
          <p class="empty-state__message">There are no quizzes in this category yet.</p>
        </div>
      `;
    }

    // Group by category if showing all
    if (this.currentCategory === 'all') {
      const grouped = {};
      filteredQuizzes.forEach(quiz => {
        const cat = quiz.category || 'other';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(quiz);
      });

      return Object.entries(grouped).map(([catKey, quizzes]) => {
        const catInfo = this.categories[catKey] || { name: catKey, icon: '📄' };
        return `
          <section class="subjects-section">
            <header class="subjects-section__header">
              <h2 class="subjects-section__title">
                <span class="subjects-section__icon">${catInfo.icon}</span>
                ${catInfo.name}
                <span class="subjects-section__count">(${quizzes.length})</span>
              </h2>
            </header>
            <div class="subjects-grid">
              ${quizzes.map(quiz => this.renderSubjectCard(quiz, progress)).join('')}
            </div>
          </section>
        `;
      }).join('');
    }

    // Single category view
    return `
      <div class="subjects-grid">
        ${filteredQuizzes.map(quiz => this.renderSubjectCard(quiz, progress)).join('')}
      </div>
    `;
  },

  /**
   * Render a single subject card
   */
  renderSubjectCard(quiz, progress) {
    const history = progress.quizzes[quiz.id];
    const stars = history?.stars || 0;
    const isCompleted = history?.completed;
    const isNew = !history;
    
    const colorMap = {
      primary: 'var(--color-primary)',
      secondary: 'var(--color-secondary)',
      accent: 'var(--color-accent)',
      highlight: 'var(--color-highlight)'
    };
    const cardColor = colorMap[quiz.color] || 'var(--color-primary)';

    const starsHtml = Array(3).fill(0).map((_, i) => 
      `<span class="star--${i < stars ? 'earned' : 'empty'}">★</span>`
    ).join('');

    let badgeHtml = '';
    if (isNew) {
      badgeHtml = '<span class="subject-card__badge subject-card__badge--new">New!</span>';
    } else if (isCompleted && stars === 3) {
      badgeHtml = '<span class="subject-card__badge subject-card__badge--completed">⭐ Perfect!</span>';
    } else if (isCompleted) {
      badgeHtml = '<span class="subject-card__badge subject-card__badge--completed">✓ Done</span>';
    }

    return `
      <article class="subject-card" data-quiz-id="${quiz.id}" tabindex="0" style="--card-color: ${cardColor}">
        <div class="subject-card__banner"></div>
        <div class="subject-card__content">
          <header class="subject-card__header">
            <div class="subject-card__icon">${quiz.icon}</div>
            <div class="subject-card__info">
              <h3 class="subject-card__title">${quiz.title}</h3>
              <p class="subject-card__subject">${quiz.subject}</p>
            </div>
          </header>
          <p class="subject-card__description">${quiz.description}</p>
          <footer class="subject-card__footer">
            <div class="subject-card__meta">
              <span class="subject-card__time">⏱️ ${quiz.timeLimit} min</span>
              ${history ? `<span class="subject-card__stars">${starsHtml}</span>` : ''}
            </div>
            ${badgeHtml}
          </footer>
        </div>
      </article>
    `;
  },

  /**
   * Setup home page event listeners
   */
  setupHomeEventListeners() {
    // Category navigation
    document.querySelectorAll('.nav-category').forEach(btn => {
      btn.addEventListener('click', () => {
        this.currentCategory = btn.dataset.category;
        this.showHome();
      });
    });

    // Subject cards
    document.querySelectorAll('.subject-card').forEach(card => {
      card.addEventListener('click', () => {
        const quizId = card.dataset.quizId;
        this.startQuiz(quizId);
      });
      
      // Keyboard support
      card.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const quizId = card.dataset.quizId;
          this.startQuiz(quizId);
        }
      });
    });
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
    // Check section-level passage first, then quiz-level
    const passage = section.passage || (section.showPassage && quiz.passage ? quiz.passage : null);
    const passageHtml = passage ? this.renderPassage(passage) : '';

    this.elements.main.innerHTML = `
      <div class="quiz page-enter">
        <!-- Breadcrumb Navigation -->
        <nav class="breadcrumb">
          <button class="back-btn" id="back-home-btn">
            ← Back to Home
          </button>
        </nav>

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
          ${this.renderQuestionImage(question)}
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
    this.initInteractiveElements(question);
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
   * Render question image(s) if present
   * Supports single image, multiple images, or image grid
   * @param {Object} question - The question object
   * @returns {string} HTML string for images
   */
  renderQuestionImage(question) {
    // Single image
    if (question.image) {
      return `
        <div class="question-card__image">
          <img src="${question.image}" alt="${question.imageAlt || 'Question illustration'}" loading="lazy">
          ${question.imageCaption ? `<p class="question-card__image-caption">${question.imageCaption}</p>` : ''}
        </div>
      `;
    }
    
    // Multiple images (for counting, comparing, etc.)
    if (question.images && Array.isArray(question.images)) {
      const gridClass = question.imagesLayout === 'row' ? 'question-card__images--row' : 
                        question.imagesLayout === 'grid' ? 'question-card__images--grid' : '';
      return `
        <div class="question-card__images ${gridClass}">
          ${question.images.map((img, idx) => `
            <div class="question-card__image-item">
              <img src="${typeof img === 'string' ? img : img.src}" 
                   alt="${typeof img === 'string' ? `Image ${idx + 1}` : (img.alt || `Image ${idx + 1}`)}" 
                   loading="lazy">
              ${typeof img === 'object' && img.label ? `<span class="question-card__image-label">${img.label}</span>` : ''}
            </div>
          `).join('')}
        </div>
      `;
    }
    
    // Shape display for geometry questions
    if (question.shape) {
      return `
        <div class="question-card__shape">
          <img src="assets/images/shapes/${question.shape}.svg" alt="${question.shape} shape" class="shape-image">
        </div>
      `;
    }
    
    // Multiple shapes for comparison
    if (question.shapes && Array.isArray(question.shapes)) {
      return `
        <div class="question-card__shapes">
          ${question.shapes.map(shape => `
            <div class="question-card__shape-item">
              <img src="assets/images/shapes/${shape}.svg" alt="${shape} shape" class="shape-image">
            </div>
          `).join('')}
        </div>
      `;
    }
    
    return '';
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

      case 'number-line':
        return this.renderNumberLine(question, existingAnswer);

      case 'clock-reading':
        return this.renderClockReading(question, existingAnswer);

      case 'counting':
        return this.renderCounting(question, existingAnswer);

      case 'shape-counting':
        return this.renderShapeCounting(question, existingAnswer);

      case 'place-value':
        return this.renderPlaceValue(question, existingAnswer);

      case 'fraction-visual':
        return this.renderFractionVisual(question, existingAnswer);

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
   * Render interactive number line question
   */
  renderNumberLine(question, existingAnswer) {
    const { min = 0, max = 20, step = 1, highlightRange } = question;
    const questionId = question.id;
    
    return `
      <div class="interactive-question">
        <div class="interactive-question__visual" 
             id="number-line-${questionId}"
             data-interactive="number-line"
             data-min="${min}"
             data-max="${max}"
             data-step="${step}"
             data-question-id="${questionId}"
             ${highlightRange ? `data-highlight="${highlightRange.join(',')}"` : ''}>
        </div>
        <div class="options options--grid stagger-children">
          ${question.options.map((option, index) => {
            const isSelected = existingAnswer?.answer === option.toString();
            return `
              <button class="option ${isSelected ? 'option--selected' : ''}" 
                      data-value="${option}">
                <span class="option__text">${option}</span>
              </button>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  /**
   * Render clock reading question with visual clock
   */
  renderClockReading(question, existingAnswer) {
    const { hours = 12, minutes = 0 } = question;
    const questionId = question.id;
    
    return `
      <div class="interactive-question">
        <div class="clock-container">
          <div id="clock-${questionId}"
               data-interactive="clock"
               data-hours="${hours}"
               data-minutes="${minutes}"
               data-size="180">
          </div>
        </div>
        <div class="options options--grid stagger-children">
          ${question.options.map((option, index) => {
            const isSelected = existingAnswer?.answer === option;
            return `
              <button class="option ${isSelected ? 'option--selected' : ''}" 
                      data-value="${option}">
                <span class="option__text">${option}</span>
              </button>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  /**
   * Render counting question with visual objects
   */
  renderCounting(question, existingAnswer) {
    const { count, object = 'apple', arrangement = 'grid', groupSize = 5 } = question;
    const questionId = question.id;
    
    return `
      <div class="interactive-question">
        <div class="interactive-question__visual"
             id="counting-${questionId}"
             data-interactive="counting"
             data-count="${count}"
             data-object="${object}"
             data-arrangement="${arrangement}"
             data-group-size="${groupSize}">
        </div>
        <div class="options options--grid stagger-children">
          ${question.options.map((option, index) => {
            const isSelected = existingAnswer?.answer === option.toString();
            return `
              <button class="option ${isSelected ? 'option--selected' : ''}" 
                      data-value="${option}">
                <span class="option__text">${option}</span>
              </button>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  /**
   * Render shape counting question
   */
  renderShapeCounting(question, existingAnswer) {
    const { shapes, counts, targetShape } = question;
    const questionId = question.id;
    
    return `
      <div class="interactive-question">
        <p class="interactive-question__prompt">
          How many <strong>${targetShape}s</strong> can you count?
        </p>
        <div class="interactive-question__visual"
             id="shapes-${questionId}"
             data-interactive="shapes"
             data-shapes="${shapes.join(',')}"
             data-counts='${JSON.stringify(counts)}'>
        </div>
        <div class="options options--grid stagger-children">
          ${question.options.map((option, index) => {
            const isSelected = existingAnswer?.answer === option.toString();
            return `
              <button class="option ${isSelected ? 'option--selected' : ''}" 
                      data-value="${option}">
                <span class="option__text">${option}</span>
              </button>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  /**
   * Render place value question with visual blocks
   */
  renderPlaceValue(question, existingAnswer) {
    const { number } = question;
    const questionId = question.id;
    
    return `
      <div class="interactive-question">
        <div class="interactive-question__visual"
             id="place-value-${questionId}">
        </div>
        <div class="options options--grid stagger-children">
          ${question.options.map((option, index) => {
            const isSelected = existingAnswer?.answer === option.toString();
            return `
              <button class="option ${isSelected ? 'option--selected' : ''}" 
                      data-value="${option}">
                <span class="option__text">${option}</span>
              </button>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  /**
   * Render fraction visual question
   */
  renderFractionVisual(question, existingAnswer) {
    const { numerator, denominator } = question;
    const questionId = question.id;
    
    return `
      <div class="interactive-question">
        <div class="fraction-container">
          <div id="fraction-${questionId}"
               data-interactive="fraction"
               data-numerator="${numerator}"
               data-denominator="${denominator}">
          </div>
        </div>
        <div class="options options--grid stagger-children">
          ${question.options.map((option, index) => {
            const isSelected = existingAnswer?.answer === option;
            return `
              <button class="option ${isSelected ? 'option--selected' : ''}" 
                      data-value="${option}">
                <span class="option__text">${option}</span>
              </button>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  /**
   * Initialize interactive elements after rendering
   */
  initInteractiveElements(question) {
    if (typeof MathInteractive === 'undefined') return;

    setTimeout(() => {
      switch (question.type) {
        case 'number-line':
          const nlContainer = document.getElementById(`number-line-${question.id}`);
          if (nlContainer) {
            MathInteractive.createNumberLine(nlContainer, {
              min: question.min || 0,
              max: question.max || 20,
              step: question.step || 1,
              interactive: false,
              highlightRange: question.highlightRange
            });
          }
          break;

        case 'clock-reading':
          const clockContainer = document.getElementById(`clock-${question.id}`);
          if (clockContainer) {
            MathInteractive.createClock(clockContainer, {
              hours: question.hours,
              minutes: question.minutes,
              size: 180,
              showDigital: false
            });
          }
          break;

        case 'counting':
          const countContainer = document.getElementById(`counting-${question.id}`);
          if (countContainer) {
            MathInteractive.createCountingObjects(countContainer, {
              count: question.count,
              object: question.object || 'apple',
              arrangement: question.arrangement || 'grid',
              groupSize: question.groupSize || 5
            });
          }
          break;

        case 'shape-counting':
          const shapeContainer = document.getElementById(`shapes-${question.id}`);
          if (shapeContainer) {
            MathInteractive.createShapeGrid(shapeContainer, {
              shapes: question.shapes,
              counts: question.counts
            });
          }
          break;

        case 'place-value':
          const pvContainer = document.getElementById(`place-value-${question.id}`);
          if (pvContainer) {
            MathInteractive.createPlaceValueBlocks(pvContainer, {
              number: question.number,
              showLabels: true
            });
          }
          break;

        case 'fraction-visual':
          const fracContainer = document.getElementById(`fraction-${question.id}`);
          if (fracContainer) {
            MathInteractive.createFractionBar(fracContainer, {
              numerator: question.numerator,
              denominator: question.denominator,
              showLabel: false
            });
          }
          break;
      }
    }, 50);
  },

  /**
   * Setup event listeners for question interactions
   */
  setupQuestionEventListeners(question) {
    const questionCard = document.getElementById('question-card');
    const feedbackContainer = document.getElementById('feedback-container');
    const nextBtn = document.getElementById('next-btn');
    const backHomeBtn = document.getElementById('back-home-btn');

    // Back to home button
    if (backHomeBtn) {
      backHomeBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to leave? Your progress will be saved.')) {
          this.showHome();
        }
      });
    }

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
          <button class="btn btn--secondary" id="review-btn">
            Review Answers 📋
          </button>
          <button class="btn btn--outline" id="retry-btn">
            Try Again 🔄
          </button>
          <button class="btn btn--primary" id="home-btn-results">
            Back Home 🏠
          </button>
        </div>
      </div>
    `;

    document.getElementById('review-btn').addEventListener('click', () => {
      this.showReview();
    });

    document.getElementById('retry-btn').addEventListener('click', () => {
      QuizEngine.reset();
      this.showSectionIntro();
    });

    document.getElementById('home-btn-results').addEventListener('click', () => {
      this.showHome();
    });
  },

  /**
   * Show review of all questions and answers
   */
  showReview() {
    this.currentView = 'review';
    const quiz = QuizEngine.state.quiz;
    const answers = QuizEngine.state.answers;

    let reviewHTML = `
      <div class="review page-enter">
        <header class="review__header">
          <button class="btn btn--ghost back-btn" id="back-to-results">
            ← Back to Results
          </button>
          <h1 class="review__title">📋 Review: ${quiz.title}</h1>
        </header>

        <div class="review__summary">
          <span class="review__filter review__filter--all active" data-filter="all">All Questions</span>
          <span class="review__filter review__filter--correct" data-filter="correct">✅ Correct</span>
          <span class="review__filter review__filter--incorrect" data-filter="incorrect">❌ Incorrect</span>
        </div>

        <div class="review__questions">
    `;

    let questionNumber = 0;

    quiz.sections.forEach((section, sectionIndex) => {
      reviewHTML += `
        <div class="review__section">
          <h2 class="review__section-title">${section.name}</h2>
      `;

      section.questions.forEach((question, questionIndex) => {
        questionNumber++;
        const answerKey = `${sectionIndex}-${questionIndex}`;
        const userAnswer = answers[answerKey];
        const isCorrect = userAnswer?.isCorrect || false;
        const statusClass = isCorrect ? 'review__item--correct' : 'review__item--incorrect';
        const statusIcon = isCorrect ? '✅' : '❌';

        reviewHTML += `
          <div class="review__item ${statusClass}" data-status="${isCorrect ? 'correct' : 'incorrect'}">
            <div class="review__item-header">
              <span class="review__item-number">Q${questionNumber}</span>
              <span class="review__item-status">${statusIcon}</span>
            </div>
            
            <p class="review__item-prompt">${question.prompt}</p>
            
            <div class="review__item-answers">
              <div class="review__answer review__answer--user ${isCorrect ? 'review__answer--correct' : 'review__answer--wrong'}">
                <strong>Your answer:</strong> ${this.formatAnswer(userAnswer?.answer, question)}
              </div>
              ${!isCorrect ? `
                <div class="review__answer review__answer--correct-answer">
                  <strong>Correct answer:</strong> ${this.formatAnswer(question.correct, question)}
                </div>
              ` : ''}
            </div>

            ${question.hint ? `
              <div class="review__hint">
                💡 <em>${question.hint}</em>
              </div>
            ` : ''}
          </div>
        `;
      });

      reviewHTML += `</div>`;
    });

    reviewHTML += `
        </div>

        <div class="review__actions">
          <button class="btn btn--outline" id="retry-from-review">
            Try Again 🔄
          </button>
          <button class="btn btn--primary" id="home-from-review">
            Back Home 🏠
          </button>
        </div>
      </div>
    `;

    this.elements.main.innerHTML = reviewHTML;

    // Event listeners
    document.getElementById('back-to-results').addEventListener('click', () => {
      this.showResults();
    });

    document.getElementById('retry-from-review').addEventListener('click', () => {
      QuizEngine.reset();
      this.showSectionIntro();
    });

    document.getElementById('home-from-review').addEventListener('click', () => {
      this.showHome();
    });

    // Filter functionality
    document.querySelectorAll('.review__filter').forEach(filter => {
      filter.addEventListener('click', (e) => {
        const filterType = e.target.dataset.filter;
        
        // Update active state
        document.querySelectorAll('.review__filter').forEach(f => f.classList.remove('active'));
        e.target.classList.add('active');

        // Filter questions
        document.querySelectorAll('.review__item').forEach(item => {
          const status = item.dataset.status;
          if (filterType === 'all') {
            item.style.display = 'block';
          } else if (filterType === status) {
            item.style.display = 'block';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  },

  /**
   * Format answer for display in review
   */
  formatAnswer(answer, question) {
    if (answer === undefined || answer === null) {
      return '<em>No answer</em>';
    }

    if (Array.isArray(answer)) {
      return answer.join(', ');
    }

    if (typeof answer === 'object') {
      // For matching questions
      return Object.entries(answer).map(([k, v]) => `${k} → ${v}`).join(', ');
    }

    return answer.toString();
  },

};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => App.init());
