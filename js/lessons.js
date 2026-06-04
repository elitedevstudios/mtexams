/* ==========================================================================
   Lessons Module - Learning Adventure
   Curriculum lessons: video → friendly steps → "Did you get it?" check
   ========================================================================== */

const LessonsApp = {
  lessons: [],
  currentLesson: null,
  currentQuestionIndex: 0,
  score: 0,
  answers: [],

  SUBJECT_ORDER: ['Language Arts', 'Mathematics', 'Integrated Studies'],
  SUBJECT_ICONS: {
    'Language Arts': '📝',
    'Mathematics': '🔢',
    'Integrated Studies': '🌍'
  },

  /**
   * Initialize the lessons app
   */
  async init() {
    const settings = Storage.loadSettings();
    Feedback.init(settings);

    await this.loadLessonsIndex();
    this.setupEventListeners();
    this.showLessonsView();
  },

  /**
   * Load the lessons index
   */
  async loadLessonsIndex() {
    try {
      const response = await fetch('quizzes/lessons/lessons-index.json?v=' + Date.now());
      if (response.ok) {
        const data = await response.json();
        this.lessons = data.lessons;
      }
    } catch (error) {
      console.error('Failed to load lessons:', error);
    }
  },

  /**
   * Set up delegated event listeners
   */
  setupEventListeners() {
    document.getElementById('main-content').addEventListener('click', (e) => {
      const lessonCard = e.target.closest('.lesson-card');
      const backBtn = e.target.closest('.back-to-lessons-btn');
      const backToLessonBtn = e.target.closest('.back-to-lesson-btn');
      const startCheckBtn = e.target.closest('.lesson-check-btn');
      const optionBtn = e.target.closest('.quiz__option');
      const multiSubmitBtn = e.target.closest('.quiz__submit-multi');
      const textSubmitBtn = e.target.closest('.quiz__submit-text');
      const nextBtn = e.target.closest('.quiz__next-btn');
      const finishBtn = e.target.closest('.quiz__finish-btn');
      const retryBtn = e.target.closest('.quiz__restart-btn');

      if (lessonCard) {
        this.showLessonDetail(lessonCard.dataset.lessonId);
      } else if (backBtn) {
        this.showLessonsView();
      } else if (backToLessonBtn) {
        this.renderLessonDetail();
      } else if (startCheckBtn) {
        this.startCheck();
      } else if (optionBtn && !optionBtn.disabled) {
        this.handleOptionClick(optionBtn);
      } else if (multiSubmitBtn) {
        this.handleMultiSelectSubmit();
      } else if (textSubmitBtn) {
        this.handleTextInputSubmit();
      } else if (nextBtn) {
        this.showNextQuestion();
      } else if (retryBtn) {
        this.startCheck();
      } else if (finishBtn) {
        this.showLessonsView();
      }
    });
  },

  /**
   * Toggle the three view containers
   */
  switchView(view) {
    document.getElementById('loading-view').style.display = 'none';
    document.getElementById('lessons-view').style.display = view === 'lessons' ? 'block' : 'none';
    document.getElementById('lesson-detail-view').style.display = view === 'detail' ? 'block' : 'none';
    document.getElementById('check-view').style.display = view === 'check' ? 'block' : 'none';
    window.scrollTo({ top: 0 });
  },

  /**
   * Show the lessons index grouped by subject
   */
  showLessonsView() {
    this.switchView('lessons');
    const container = document.getElementById('lessons-grid');
    const progress = Storage.loadProgress();

    if (this.lessons.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">🎬</div>
          <h2 class="empty-state__title">No lessons yet</h2>
          <p>Lessons will appear here once they're added.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.SUBJECT_ORDER.map(subject => {
      const subjectLessons = this.lessons.filter(l => l.subject === subject);
      if (subjectLessons.length === 0) return '';

      const doneCount = subjectLessons.filter(
        l => progress.lessons && progress.lessons[l.id] && progress.lessons[l.id].completed
      ).length;

      return `
        <section class="lessons-subject">
          <h2 class="lessons-subject__title">
            <span>${this.SUBJECT_ICONS[subject] || '📚'}</span>
            <span>${subject}</span>
            <span class="lessons-subject__progress">${doneCount} of ${subjectLessons.length} done</span>
          </h2>
          <div class="lessons-grid">
            ${subjectLessons.map((lesson, i) => this.renderLessonCard(lesson, i + 1, progress)).join('')}
          </div>
        </section>
      `;
    }).join('');
  },

  /**
   * Render a single lesson card
   */
  renderLessonCard(lesson, number, progress) {
    const record = progress.lessons ? progress.lessons[lesson.id] : null;
    const done = record && record.completed;
    const stars = done ? '⭐'.repeat(record.stars || 0) : '';

    return `
      <button class="lesson-card ${done ? 'lesson-card--done' : ''}" data-lesson-id="${lesson.id}"
              aria-label="${lesson.title}${done ? ', completed' : ''}">
        <span class="lesson-card__icon">${lesson.icon}</span>
        <span class="lesson-card__info">
          <span class="lesson-card__number">Lesson ${number}</span>
          <span class="lesson-card__title">${lesson.title}</span>
        </span>
        <span class="lesson-card__status">${done ? (stars || '✅') : '▶️'}</span>
      </button>
    `;
  },

  /**
   * Load and show a lesson's detail view
   */
  async showLessonDetail(lessonId) {
    const indexEntry = this.lessons.find(l => l.id === lessonId);
    if (!indexEntry) return;

    try {
      const response = await fetch('quizzes/lessons/' + indexEntry.file + '?v=' + Date.now());
      if (!response.ok) throw new Error('HTTP ' + response.status);
      this.currentLesson = await response.json();
    } catch (error) {
      console.error('Failed to load lesson:', error);
      const detailView = document.getElementById('lesson-detail-view');
      this.switchView('detail');
      detailView.innerHTML = `
        <button class="back-btn back-to-lessons-btn"><span>←</span><span>Back to Lessons</span></button>
        <div class="empty-state">
          <div class="empty-state__icon">😕</div>
          <h2 class="empty-state__title">Lesson couldn't load</h2>
          <p>Check your connection and try again.</p>
        </div>
      `;
      return;
    }

    this.renderLessonDetail();
  },

  /**
   * Render the lesson detail (video + steps + check button)
   */
  renderLessonDetail() {
    const lesson = this.currentLesson;
    const detailView = document.getElementById('lesson-detail-view');
    this.switchView('detail');

    const record = Storage.getLessonProgress(lesson.id);
    const watchUrl = lesson.video.youtubeId
      ? `https://www.youtube.com/watch?v=${lesson.video.youtubeId}`
      : (lesson.video.url || '#');

    const videoHtml = lesson.video.linkOnly || !lesson.video.youtubeId
      ? `
        <div class="lesson-video">
          <div class="lesson-video__fallback">
            <span style="font-size:3rem;">🎬</span>
            <p>This video opens on YouTube</p>
            <a class="btn btn--accent" href="${watchUrl}" target="_blank" rel="noopener">
              ▶️ Watch "${lesson.video.title}"
            </a>
          </div>
        </div>
      `
      : `
        <div class="lesson-video">
          <iframe
            src="https://www.youtube-nocookie.com/embed/${lesson.video.youtubeId}?rel=0"
            title="${lesson.video.title}"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowfullscreen
            playsinline
            loading="lazy"></iframe>
        </div>
      `;

    detailView.innerHTML = `
      <button class="back-btn back-to-lessons-btn"><span>←</span><span>Back to Lessons</span></button>

      <article class="lesson-detail">
        <header class="lesson-detail__header">
          <span class="lesson-detail__icon">${lesson.icon || '🎬'}</span>
          <div>
            <h1 class="lesson-detail__title">${lesson.title}</h1>
            <p class="lesson-detail__subject">${lesson.subject} • Term ${lesson.term}</p>
          </div>
        </header>

        ${videoHtml}

        <div class="lesson-video__meta">
          <span>📺 ${lesson.video.title} — ${lesson.video.channel}${lesson.video.duration ? ' (' + lesson.video.duration + ')' : ''}</span>
          <a class="lesson-video__link" href="${watchUrl}" target="_blank" rel="noopener">Open on YouTube ↗</a>
        </div>

        <section class="lesson-steps">
          <h2 class="lesson-steps__title">📒 What to remember</h2>
          <ol class="lesson-steps__list">
            ${lesson.steps.map(step => `<li class="lesson-steps__item">${step}</li>`).join('')}
          </ol>
        </section>

        <div class="lesson-detail__actions">
          <button class="btn btn--primary btn--large lesson-check-btn">
            ${record && record.completed ? '🔁 Try the check again!' : '🙋 Did you get it? Take the check!'}
          </button>
        </div>
      </article>
    `;
  },

  /**
   * Start the "Did you get it?" check
   */
  startCheck() {
    const section = this.currentLesson.check.sections[0];
    this.currentSection = section;
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.answers = [];

    this.switchView('check');
    this.showQuestion();
  },

  /**
   * Show the current check question
   */
  showQuestion() {
    const checkView = document.getElementById('check-view');
    const question = this.currentSection.questions[this.currentQuestionIndex];
    const totalQuestions = this.currentSection.questions.length;

    checkView.innerHTML = `
      <button class="back-btn back-to-lesson-btn">
        <span>←</span>
        <span>Back to Lesson</span>
      </button>

      <div class="quiz">
        <header class="quiz__header">
          <h2 class="quiz__title">🙋 Did you get it?</h2>
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

          ${question.hint ? `<p class="quiz__hint">💡 Hint: ${question.hint}</p>` : ''}
        </article>

        <div class="quiz__feedback" style="display: none;"></div>

        <div class="quiz__actions" style="display: none;">
          <button class="btn btn--primary quiz__next-btn">Next Question →</button>
        </div>
      </div>
    `;

    if (question.type === 'text-input') {
      const inputEl = checkView.querySelector('.quiz__input');
      if (inputEl) {
        inputEl.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' && !inputEl.disabled) this.handleTextInputSubmit();
        });
        inputEl.focus();
      }
    }
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
   * Handle multiple-choice option click
   */
  handleOptionClick(optionBtn) {
    const question = this.currentSection.questions[this.currentQuestionIndex];
    const selectedValue = optionBtn.dataset.value;
    const isCorrect = selectedValue === String(question.correct);

    document.querySelectorAll('#check-view .quiz__option').forEach(btn => {
      btn.disabled = true;
      if (btn.dataset.value === String(question.correct)) {
        btn.classList.add('quiz__option--correct');
      } else if (btn === optionBtn && !isCorrect) {
        btn.classList.add('quiz__option--incorrect');
      }
    });

    if (isCorrect) {
      this.score++;
      Feedback.playSound('correct');
      this.showFeedback(true, 'Great job! That\'s correct! 🎉');
    } else {
      Feedback.playSound('incorrect');
      this.showFeedback(false, `Not quite. The correct answer is: ${question.correct}`);
    }

    this.answers.push({ questionId: question.id, correct: isCorrect });
    this.showActionsBar();
  },

  /**
   * Handle multi-select submit
   */
  handleMultiSelectSubmit() {
    const question = this.currentSection.questions[this.currentQuestionIndex];
    const checked = [...document.querySelectorAll('#check-view .quiz__checkbox-option input:checked')]
      .map(cb => cb.value);
    const correct = question.correct;
    const isCorrect = correct.length === checked.length &&
      correct.every(v => checked.includes(v));

    document.querySelectorAll('#check-view .quiz__checkbox-option input').forEach(cb => cb.disabled = true);
    document.querySelector('#check-view .quiz__submit-multi').disabled = true;

    document.querySelectorAll('#check-view .quiz__checkbox-option').forEach(label => {
      const val = label.querySelector('input').value;
      if (correct.includes(val)) label.classList.add('quiz__checkbox-option--correct');
      else if (checked.includes(val)) label.classList.add('quiz__checkbox-option--incorrect');
    });

    if (isCorrect) { this.score++; Feedback.playSound('correct'); }
    else { Feedback.playSound('incorrect'); }

    const msg = isCorrect
      ? 'Great job! All correct! 🎉'
      : `The correct answers are: ${correct.join(', ')}`;
    this.showFeedback(isCorrect, msg);
    this.answers.push({ questionId: question.id, correct: isCorrect });
    this.showActionsBar();
  },

  /**
   * Handle text-input submit (case-insensitive)
   */
  handleTextInputSubmit() {
    const question = this.currentSection.questions[this.currentQuestionIndex];
    const input = document.querySelector('#check-view .quiz__input');
    const userAnswer = input.value.trim().toLowerCase();
    const acceptable = (question.acceptableAnswers || [question.correct])
      .map(a => String(a).toLowerCase());
    const isCorrect = acceptable.includes(userAnswer);

    input.disabled = true;
    document.querySelector('#check-view .quiz__submit-text').disabled = true;

    if (isCorrect) { this.score++; Feedback.playSound('correct'); }
    else { Feedback.playSound('incorrect'); }

    const msg = isCorrect ? 'Perfect! ✅' : `The answer is: ${question.correct}`;
    this.showFeedback(isCorrect, msg);
    this.answers.push({ questionId: question.id, correct: isCorrect });
    this.showActionsBar();
  },

  /**
   * Show feedback message
   */
  showFeedback(isCorrect, message) {
    const feedbackDiv = document.querySelector('#check-view .quiz__feedback');
    feedbackDiv.style.display = 'block';
    feedbackDiv.className = `quiz__feedback quiz__feedback--${isCorrect ? 'correct' : 'incorrect'}`;
    feedbackDiv.innerHTML = `<p>${message}</p>`;
  },

  /**
   * Show next/finish actions
   */
  showActionsBar() {
    const actionsDiv = document.querySelector('#check-view .quiz__actions');
    actionsDiv.style.display = 'flex';
    if (this.currentQuestionIndex >= this.currentSection.questions.length - 1) {
      actionsDiv.innerHTML = `<button class="btn btn--primary quiz__finish-btn--results">See Results →</button>`;
      actionsDiv.querySelector('.quiz__finish-btn--results').addEventListener('click', () => this.showResults());
    }
  },

  /**
   * Advance to next question
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
   * Show check results, save completion, celebrate
   */
  showResults() {
    const checkView = document.getElementById('check-view');
    const totalQuestions = this.currentSection.questions.length;
    const percentage = Math.round((this.score / totalQuestions) * 100);
    const stars = percentage >= 90 ? 3 : percentage >= 70 ? 2 : percentage >= 50 ? 1 : 0;

    const progress = Storage.markLessonComplete(this.currentLesson.id, {
      score: percentage,
      stars: stars
    });

    // Refresh header star count
    const starCount = document.getElementById('star-count');
    if (starCount) starCount.textContent = progress.totalStars || 0;

    if (percentage >= 70) {
      Feedback.showCelebration(percentage, stars);
    }

    checkView.innerHTML = `
      <div class="quiz-results">
        <div class="quiz-results__header">
          <h2 class="quiz-results__title">
            ${percentage >= 90 ? '🌟 Amazing!' : percentage >= 70 ? '🎉 Great Job!' : percentage >= 50 ? '👍 Good Try!' : '💪 Keep Practicing!'}
          </h2>
        </div>

        <div class="quiz-results__score">
          <div class="quiz-results__percentage">${percentage}%</div>
          <p class="quiz-results__text">You got ${this.score} out of ${totalQuestions} right!</p>
          <div class="quiz-results__stars">${'⭐'.repeat(stars)}${'☆'.repeat(3 - stars)}</div>
        </div>

        <div class="quiz-results__actions">
          <button class="btn btn--outline quiz__restart-btn">🔁 Try Again</button>
          <button class="btn btn--secondary back-to-lesson-btn">📺 Watch Again</button>
          <button class="btn btn--primary quiz__finish-btn">✅ Back to Lessons</button>
        </div>
      </div>
    `;
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => LessonsApp.init());

window.LessonsApp = LessonsApp;
