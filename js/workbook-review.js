/* ==========================================================================
   Workbook Review - Morgan's Quiz Platform
   ========================================================================== */

const WorkbookApp = {
  workbooks: [],
  currentWorkbook: null,
  currentChapter: null,
  currentQuiz: null,
  currentView: 'workbooks',

  /**
   * Initialize the workbook review app
   */
  async init() {
    const settings = Storage.loadSettings();
    Feedback.init(settings);
    
    await this.loadWorkbooks();
    this.setupEventListeners();
    this.showWorkbooksView();
    
    console.log('📖 Workbook Review initialized!');
  },

  /**
   * Load workbooks index
   */
  async loadWorkbooks() {
    try {
      const response = await fetch('quizzes/workbooks/workbooks-index.json');
      if (response.ok) {
        const data = await response.json();
        this.workbooks = data.workbooks;
      }
    } catch (error) {
      console.error('Failed to load workbooks:', error);
    }
  },

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    document.getElementById('main-content').addEventListener('click', (e) => {
      const workbookCard = e.target.closest('.workbook-card');
      const chapterItem = e.target.closest('.workbook-card__chapter');
      const topicCard = e.target.closest('.topic-card');
      const backBtn = e.target.closest('.back-btn');
      const optionBtn = e.target.closest('.quiz__option');
      const nextBtn = e.target.closest('.quiz__next-btn');
      const finishBtn = e.target.closest('.quiz__finish-btn');
      const restartBtn = e.target.closest('.quiz__restart-btn');
      const backToChapterBtn = e.target.closest('.back-to-chapter-btn');

      if (chapterItem) {
        e.stopPropagation();
        const workbookId = chapterItem.dataset.workbookId;
        const chapterId = chapterItem.dataset.chapterId;
        this.showChapterView(workbookId, chapterId);
      } else if (workbookCard && !chapterItem) {
        const workbookId = workbookCard.dataset.workbookId;
        const workbook = this.workbooks.find(w => w.id === workbookId);
        if (workbook && workbook.chapters.length === 1) {
          this.showChapterView(workbookId, workbook.chapters[0].id);
        }
      } else if (topicCard) {
        const sectionId = topicCard.dataset.sectionId;
        this.startQuizSection(sectionId);
      } else if (backBtn) {
        this.handleBack();
      } else if (optionBtn && !optionBtn.disabled) {
        this.handleOptionClick(optionBtn);
      } else if (nextBtn) {
        this.showNextQuestion();
      } else if (finishBtn || restartBtn) {
        this.showChapterView(this.currentWorkbook.id, this.currentChapter.id);
      } else if (backToChapterBtn) {
        this.showChapterView(this.currentWorkbook.id, this.currentChapter.id);
      }
    });
  },

  /**
   * Show workbooks list view
   */
  showWorkbooksView() {
    this.currentView = 'workbooks';
    document.getElementById('loading-view').style.display = 'none';
    document.getElementById('workbooks-view').style.display = 'block';
    document.getElementById('chapter-view').style.display = 'none';
    document.getElementById('quiz-view').style.display = 'none';

    const grid = document.getElementById('workbooks-grid');
    
    if (this.workbooks.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">📚</div>
          <h2 class="empty-state__title">No workbooks yet</h2>
          <p>Workbook reviews will appear here once they're added.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = this.workbooks.map(workbook => this.renderWorkbookCard(workbook)).join('');
  },

  /**
   * Render a workbook card
   */
  renderWorkbookCard(workbook) {
    const colorClass = workbook.color === 'secondary' ? 'workbook-card__header--secondary' : 
                       workbook.color === 'accent' ? 'workbook-card__header--accent' : '';
    
    return `
      <article class="workbook-card" data-workbook-id="${workbook.id}">
        <div class="workbook-card__header ${colorClass}">
          <span class="workbook-card__icon">${workbook.icon}</span>
          <div>
            <h2 class="workbook-card__title">${workbook.title}</h2>
            <p class="workbook-card__subject">${workbook.subject} • Grade ${workbook.grade}</p>
          </div>
        </div>
        <div class="workbook-card__body">
          <p class="workbook-card__description">${workbook.description}</p>
          <ul class="workbook-card__chapters">
            ${workbook.chapters.map(chapter => `
              <li class="workbook-card__chapter" data-workbook-id="${workbook.id}" data-chapter-id="${chapter.id}">
                <span class="workbook-card__chapter-title">
                  <span class="workbook-card__chapter-icon">📄</span>
                  ${chapter.title}
                </span>
                <span class="workbook-card__chapter-pages">Pages ${chapter.pages}</span>
              </li>
            `).join('')}
          </ul>
        </div>
      </article>
    `;
  },

  /**
   * Show chapter view with topics
   */
  async showChapterView(workbookId, chapterId) {
    this.currentView = 'chapter';
    this.currentWorkbook = this.workbooks.find(w => w.id === workbookId);
    this.currentChapter = this.currentWorkbook.chapters.find(c => c.id === chapterId);

    document.getElementById('workbooks-view').style.display = 'none';
    document.getElementById('chapter-view').style.display = 'block';
    document.getElementById('quiz-view').style.display = 'none';

    // Load the quiz data for this chapter
    try {
      const response = await fetch(`quizzes/workbooks/${this.currentChapter.quizFile}`);
      if (response.ok) {
        this.currentQuiz = await response.json();
        this.renderChapterView();
      }
    } catch (error) {
      console.error('Failed to load chapter quiz:', error);
    }
  },

  /**
   * Render chapter view with sections/topics
   */
  renderChapterView() {
    const chapterView = document.getElementById('chapter-view');
    const progress = Storage.loadProgress();
    
    chapterView.innerHTML = `
      <button class="back-btn">
        <span>←</span>
        <span>Back to Workbooks</span>
      </button>

      <header class="chapter-header">
        <div class="chapter-header__breadcrumb">
          <a href="#" onclick="WorkbookApp.showWorkbooksView(); return false;">${this.currentWorkbook.title}</a>
          <span>›</span>
          <span>${this.currentChapter.title}</span>
        </div>
        <h1 class="chapter-header__title">${this.currentChapter.title}</h1>
        <p class="chapter-header__meta">Pages ${this.currentChapter.pages} • ${this.currentQuiz.sections.length} Topics • ${this.getTotalQuestions()} Questions</p>
      </header>

      <div class="topics-grid">
        ${this.currentQuiz.sections.map(section => {
          const sectionProgress = this.getSectionProgress(section.id, progress);
          return `
            <article class="topic-card" data-section-id="${section.id}">
              <div class="topic-card__icon">${this.getTopicIcon(section.name)}</div>
              <h3 class="topic-card__title">${section.name}</h3>
              <p class="topic-card__count">${section.questions.length} questions</p>
              <div class="topic-card__progress">
                <div class="topic-card__progress-bar" style="inline-size: ${sectionProgress}%"></div>
              </div>
            </article>
          `;
        }).join('')}
      </div>
    `;
  },

  /**
   * Get total questions in current quiz
   */
  getTotalQuestions() {
    return this.currentQuiz.sections.reduce((total, section) => total + section.questions.length, 0);
  },

  /**
   * Get section progress percentage
   */
  getSectionProgress(sectionId, progress) {
    const key = `workbook-${this.currentWorkbook.id}-${this.currentChapter.id}-${sectionId}`;
    const sectionData = progress.quizzes?.[key];
    if (sectionData && sectionData.completed) {
      return 100;
    }
    return 0;
  },

  /**
   * Get icon for topic based on name
   */
  getTopicIcon(name) {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('noun')) return '📝';
    if (nameLower.includes('pronoun')) return '👤';
    if (nameLower.includes('plural')) return '📚';
    if (nameLower.includes('group') || nameLower.includes('collective')) return '👥';
    if (nameLower.includes('number')) return '🔢';
    if (nameLower.includes('proper')) return '🏷️';
    if (nameLower.includes('irregular')) return '🔀';
    return '📖';
  },

  /**
   * Start quiz for a specific section
   */
  startQuizSection(sectionId) {
    this.currentView = 'quiz';
    this.currentSection = this.currentQuiz.sections.find(s => s.id === sectionId);
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.answers = [];

    document.getElementById('chapter-view').style.display = 'none';
    document.getElementById('quiz-view').style.display = 'block';

    this.showQuestion();
  },

  /**
   * Show current question
   */
  showQuestion() {
    const quizView = document.getElementById('quiz-view');
    const question = this.currentSection.questions[this.currentQuestionIndex];
    const totalQuestions = this.currentSection.questions.length;

    quizView.innerHTML = `
      <button class="back-btn back-to-chapter-btn">
        <span>←</span>
        <span>Back to Topics</span>
      </button>

      <div class="quiz">
        <header class="quiz__header">
          <h2 class="quiz__title">${this.currentSection.name}</h2>
          <div class="quiz__progress">
            <span>Question ${this.currentQuestionIndex + 1} of ${totalQuestions}</span>
            <div class="quiz__progress-bar">
              <div class="quiz__progress-fill" style="inline-size: ${((this.currentQuestionIndex + 1) / totalQuestions) * 100}%"></div>
            </div>
          </div>
        </header>

        <article class="quiz__question">
          <p class="quiz__prompt">${question.prompt}</p>
          
          <div class="quiz__options">
            ${this.renderOptions(question)}
          </div>

          ${question.hint ? `<p class="quiz__hint" style="display: none;">💡 Hint: ${question.hint}</p>` : ''}
        </article>

        <div class="quiz__feedback" style="display: none;"></div>
        
        <div class="quiz__actions" style="display: none;">
          <button class="btn btn--primary quiz__next-btn">Next Question →</button>
        </div>
      </div>
    `;
  },

  /**
   * Render question options based on type
   */
  renderOptions(question) {
    if (question.type === 'multiple-choice') {
      return question.options.map((option, index) => `
        <button class="quiz__option" data-value="${option}" data-index="${index}">
          ${option}
        </button>
      `).join('');
    } else if (question.type === 'multi-select') {
      return `
        <div class="quiz__multi-select">
          ${question.options.map((option, index) => `
            <label class="quiz__checkbox-option">
              <input type="checkbox" value="${option}" data-index="${index}">
              <span>${option}</span>
            </label>
          `).join('')}
        </div>
        <button class="btn btn--primary quiz__submit-multi">Check Answer</button>
      `;
    } else if (question.type === 'text-input') {
      return `
        <div class="quiz__text-input">
          <input type="text" class="quiz__input" placeholder="Type your answer..." autocomplete="off">
          <button class="btn btn--primary quiz__submit-text">Check Answer</button>
        </div>
      `;
    }
    return '';
  },

  /**
   * Handle option click
   */
  handleOptionClick(optionBtn) {
    const question = this.currentSection.questions[this.currentQuestionIndex];
    const selectedValue = optionBtn.dataset.value;
    const isCorrect = selectedValue === question.correct;

    // Disable all options
    document.querySelectorAll('.quiz__option').forEach(btn => {
      btn.disabled = true;
      if (btn.dataset.value === question.correct) {
        btn.classList.add('quiz__option--correct');
      } else if (btn === optionBtn && !isCorrect) {
        btn.classList.add('quiz__option--incorrect');
      }
    });

    // Update score and show feedback
    if (isCorrect) {
      this.score++;
      Feedback.playSound('correct');
      this.showFeedback(true, 'Great job! That\'s correct! 🎉');
    } else {
      Feedback.playSound('incorrect');
      this.showFeedback(false, `Not quite. The correct answer is: ${question.correct}`);
    }

    this.answers.push({ questionId: question.id, correct: isCorrect });

    // Show next button or finish
    const actionsDiv = document.querySelector('.quiz__actions');
    actionsDiv.style.display = 'flex';
    
    if (this.currentQuestionIndex >= this.currentSection.questions.length - 1) {
      actionsDiv.innerHTML = `<button class="btn btn--primary quiz__finish-btn">See Results →</button>`;
    }
  },

  /**
   * Show feedback message
   */
  showFeedback(isCorrect, message) {
    const feedbackDiv = document.querySelector('.quiz__feedback');
    feedbackDiv.style.display = 'block';
    feedbackDiv.className = `quiz__feedback quiz__feedback--${isCorrect ? 'correct' : 'incorrect'}`;
    feedbackDiv.innerHTML = `<p>${message}</p>`;
  },

  /**
   * Show next question
   */
  showNextQuestion() {
    this.currentQuestionIndex++;
    if (this.currentQuestionIndex < this.currentSection.questions.length) {
      this.showQuestion();
    } else {
      this.showResults();
    }
  },

  /**
   * Show quiz results
   */
  showResults() {
    const quizView = document.getElementById('quiz-view');
    const totalQuestions = this.currentSection.questions.length;
    const percentage = Math.round((this.score / totalQuestions) * 100);
    const stars = percentage >= 90 ? 3 : percentage >= 70 ? 2 : percentage >= 50 ? 1 : 0;

    // Save progress
    const progressKey = `workbook-${this.currentWorkbook.id}-${this.currentChapter.id}-${this.currentSection.id}`;
    const progress = Storage.loadProgress();
    if (!progress.quizzes) progress.quizzes = {};
    
    const existingScore = progress.quizzes[progressKey]?.score || 0;
    if (percentage > existingScore) {
      progress.quizzes[progressKey] = {
        completed: true,
        score: percentage,
        stars: stars,
        date: new Date().toISOString()
      };
      progress.totalStars = (progress.totalStars || 0) + stars;
      Storage.saveProgress(progress);
    }

    // Play celebration if good score
    if (percentage >= 70) {
      Feedback.showCelebration(percentage, stars);
    }

    quizView.innerHTML = `
      <div class="quiz-results">
        <div class="quiz-results__header">
          <h2 class="quiz-results__title">
            ${percentage >= 90 ? '🌟 Amazing!' : percentage >= 70 ? '🎉 Great Job!' : percentage >= 50 ? '👍 Good Try!' : '💪 Keep Practicing!'}
          </h2>
        </div>

        <div class="quiz-results__score">
          <div class="quiz-results__percentage">${percentage}%</div>
          <p class="quiz-results__text">${this.score} out of ${totalQuestions} correct</p>
          <div class="quiz-results__stars">
            ${'⭐'.repeat(stars)}${'☆'.repeat(3 - stars)}
          </div>
        </div>

        <div class="quiz-results__actions">
          <button class="btn btn--secondary quiz__restart-btn">Try Again</button>
          <button class="btn btn--primary back-to-chapter-btn">Back to Topics</button>
        </div>
      </div>
    `;
  },

  /**
   * Handle back navigation
   */
  handleBack() {
    if (this.currentView === 'quiz') {
      this.showChapterView(this.currentWorkbook.id, this.currentChapter.id);
    } else if (this.currentView === 'chapter') {
      this.showWorkbooksView();
    }
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  WorkbookApp.init();
});
