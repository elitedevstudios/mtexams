/* ==========================================================================
   Storage Module - Learning Adventure Quiz Platform
   Handles saving and loading progress from localStorage
   ========================================================================== */

const Storage = {
  KEYS: {
    PROGRESS: 'learningAdventureProgress',
    SETTINGS: 'learningAdventureSettings'
  },

  /**
   * School calendar for attendance. Attendance is tracked across school days only:
   * Monday–Friday within [start, end], excluding the no-school days below.
   * `noSchool` combines the Immaculate Conception 2025–26 calendar (breaks, records
   * days) with Jamaican public holidays (e.g. Ash Wednesday). Edit here if the term
   * dates or holidays change.
   */
  SCHOOL: {
    start: '2026-01-05',
    end: '2026-06-05',
    noSchool: [
      '2026-01-09', // Records Day
      '2026-02-02', // No school
      '2026-02-13', '2026-02-16', '2026-02-17', // Winter Break
      '2026-02-18', // Ash Wednesday (Jamaican public holiday)
      '2026-03-13', // Records Day
      '2026-04-02', '2026-04-03', '2026-04-06', '2026-04-07',
      '2026-04-08', '2026-04-09', '2026-04-10', // Easter Vacation (incl. Good Friday, Easter Monday)
      '2026-05-25'  // Memorial Day
    ]
  },

  /** True if the ISO date (YYYY-MM-DD) is a school day: a weekday in range, not a no-school day. */
  isSchoolDay(iso) {
    if (iso < this.SCHOOL.start || iso > this.SCHOOL.end) return false;
    if (this.SCHOOL.noSchool.includes(iso)) return false;
    const [y, m, d] = iso.split('-').map(Number);
    const dow = new Date(y, m - 1, d).getDay();
    return dow >= 1 && dow <= 5; // Mon–Fri
  },

  /** Array of ISO school days in [startIso, endIso] (clamped to the school year). */
  schoolDaysBetween(startIso, endIso) {
    const from = startIso > this.SCHOOL.start ? startIso : this.SCHOOL.start;
    const to = endIso < this.SCHOOL.end ? endIso : this.SCHOOL.end;
    const days = [];
    if (from > to) return days;
    const [sy, sm, sd] = from.split('-').map(Number);
    const [ey, em, ed] = to.split('-').map(Number);
    const cur = new Date(sy, sm - 1, sd);
    const last = new Date(ey, em - 1, ed);
    while (cur <= last) {
      const iso = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`;
      if (this.isSchoolDay(iso)) days.push(iso);
      cur.setDate(cur.getDate() + 1);
    }
    return days;
  },

  /** Most recent school day on or before the given ISO date (clamped to the school year end). */
  latestSchoolDayOnOrBefore(iso) {
    const cap = iso < this.SCHOOL.end ? iso : this.SCHOOL.end;
    if (cap < this.SCHOOL.start) return null;
    const [y, m, d] = cap.split('-').map(Number);
    const cur = new Date(y, m - 1, d);
    for (let guard = 0; guard < 400; guard++) {
      const s = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`;
      if (s < this.SCHOOL.start) return null;
      if (this.isSchoolDay(s)) return s;
      cur.setDate(cur.getDate() - 1);
    }
    return null;
  },

  /**
   * Get the default progress structure
   * @returns {Object} Default progress object
   */
  getDefaultProgress() {
    return {
      name: '',
      quizzes: {},
      lessons: {},
      attendance: [],
      totalStars: 0,
      streak: 0,
      lastPlayed: null,
      achievements: []
    };
  },

  /**
   * Get the default settings structure
   * @returns {Object} Default settings object
   */
  getDefaultSettings() {
    return {
      soundEnabled: true,
      animationsEnabled: true,
      fontSize: 'normal'
    };
  },

  /**
   * Load progress from localStorage
   * @returns {Object} Progress data
   */
  loadProgress() {
    try {
      const data = localStorage.getItem(this.KEYS.PROGRESS);
      if (data) {
        return { ...this.getDefaultProgress(), ...JSON.parse(data) };
      }
    } catch (error) {
      console.warn('Failed to load progress:', error);
    }
    return this.getDefaultProgress();
  },

  /**
   * Save progress to localStorage
   * @param {Object} progress - Progress data to save
   */
  saveProgress(progress) {
    try {
      localStorage.setItem(this.KEYS.PROGRESS, JSON.stringify(progress));
    } catch (error) {
      console.warn('Failed to save progress:', error);
    }
  },

  /**
   * Save user's name
   * @param {string} name - The user's name
   */
  saveName(name) {
    const progress = this.loadProgress();
    progress.name = name;
    this.saveProgress(progress);
    return progress;
  },

  /**
   * Get user's name
   * @returns {string} The user's name or empty string
   */
  getName() {
    const progress = this.loadProgress();
    return progress.name || '';
  },

  /**
   * Check if this is a first-time user (no name set)
   * @returns {boolean} True if first-time user
   */
  isFirstTimeUser() {
    const progress = this.loadProgress();
    return !progress.name || progress.name.trim() === '';
  },

  /**
   * Update a specific quiz result
   * @param {string} quizId - The quiz identifier
   * @param {Object} result - Quiz result data
   */
  saveQuizResult(quizId, result) {
    const progress = this.loadProgress();
    
    const existingQuiz = progress.quizzes[quizId] || { attempts: 0, bestScore: 0 };
    
    progress.quizzes[quizId] = {
      completed: true,
      score: result.score,
      bestScore: Math.max(existingQuiz.bestScore || 0, result.score),
      date: new Date().toISOString(),
      attempts: (existingQuiz.attempts || 0) + 1,
      stars: result.stars,
      timeSpent: result.timeSpent || 0
    };

    // Update total stars across quizzes + lessons (use best score for star calculation)
    progress.totalStars = this.calculateTotalStars(progress.quizzes) +
      this.calculateTotalStars(progress.lessons || {});
    
    // Update streak
    progress.streak = this.updateStreak(progress);
    progress.lastPlayed = new Date().toISOString();

    this.saveProgress(progress);
    return progress;
  },

  /**
   * Calculate total stars from all quizzes
   * @param {Object} quizzes - All quiz results
   * @returns {number} Total stars earned
   */
  calculateTotalStars(quizzes) {
    return Object.values(quizzes).reduce((total, quiz) => {
      return total + (quiz.stars || 0);
    }, 0);
  },

  /**
   * Update the daily streak
   * @param {Object} progress - Current progress
   * @returns {number} Updated streak count
   */
  updateStreak(progress) {
    if (!progress.lastPlayed) {
      return 1;
    }

    const lastPlayed = new Date(progress.lastPlayed);
    const today = new Date();
    const daysDiff = Math.floor((today - lastPlayed) / (1000 * 60 * 60 * 24));

    if (daysDiff === 0) {
      // Same day, keep streak
      return progress.streak || 1;
    } else if (daysDiff === 1) {
      // Consecutive day, increment streak
      return (progress.streak || 0) + 1;
    } else {
      // Streak broken, reset
      return 1;
    }
  },

  /**
   * Load settings from localStorage
   * @returns {Object} Settings data
   */
  loadSettings() {
    try {
      const data = localStorage.getItem(this.KEYS.SETTINGS);
      if (data) {
        return { ...this.getDefaultSettings(), ...JSON.parse(data) };
      }
    } catch (error) {
      console.warn('Failed to load settings:', error);
    }
    return this.getDefaultSettings();
  },

  /**
   * Save settings to localStorage
   * @param {Object} settings - Settings to save
   */
  saveSettings(settings) {
    try {
      localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.warn('Failed to save settings:', error);
    }
  },

  /**
   * Get quiz history for a specific quiz
   * @param {string} quizId - The quiz identifier
   * @returns {Object|null} Quiz history or null
   */
  getQuizHistory(quizId) {
    const progress = this.loadProgress();
    return progress.quizzes[quizId] || null;
  },

  /**
   * Clear all progress (with confirmation)
   */
  clearProgress() {
    localStorage.removeItem(this.KEYS.PROGRESS);
  },

  /**
   * Check if it's the user's first time
   * @returns {boolean} True if first time
   */
  isFirstTime() {
    return !localStorage.getItem(this.KEYS.PROGRESS);
  },

  /**
   * Add an achievement
   * @param {string} achievementId - Achievement identifier
   */
  addAchievement(achievementId) {
    const progress = this.loadProgress();
    if (!progress.achievements.includes(achievementId)) {
      progress.achievements.push(achievementId);
      this.saveProgress(progress);
      return true; // New achievement
    }
    return false; // Already had it
  },

  /**
   * Mark a lesson as complete and record the check score
   * Stars only increase totalStars by the delta vs. the previous best
   * @param {string} lessonId - The lesson identifier
   * @param {Object} result - { score, stars }
   * @returns {Object} Updated progress
   */
  markLessonComplete(lessonId, result) {
    const progress = this.loadProgress();

    const existing = progress.lessons[lessonId] || { attempts: 0, bestScore: 0, stars: 0 };
    const bestStars = Math.max(existing.stars || 0, result.stars || 0);

    progress.lessons[lessonId] = {
      completed: true,
      score: result.score,
      bestScore: Math.max(existing.bestScore || 0, result.score),
      stars: bestStars,
      attempts: (existing.attempts || 0) + 1,
      date: new Date().toISOString()
    };

    // Recompute total stars across quizzes + lessons (best-stars only, no double-count)
    progress.totalStars = this.calculateTotalStars(progress.quizzes) +
      this.calculateTotalStars(progress.lessons);

    progress.streak = this.updateStreak(progress);
    progress.lastPlayed = new Date().toISOString();

    this.saveProgress(progress);
    return progress;
  },

  /**
   * Get progress for a single lesson
   * @param {string} lessonId - The lesson identifier
   * @returns {Object|null} Lesson progress or null
   */
  getLessonProgress(lessonId) {
    const progress = this.loadProgress();
    return progress.lessons[lessonId] || null;
  },

  /**
   * Get today's date as a local YYYY-MM-DD string
   * @returns {string} Local date string
   */
  getTodayString() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  },

  /**
   * Register today's attendance (idempotent per day)
   * @returns {Object} { alreadyCheckedIn, streak, today }
   */
  checkInToday() {
    const progress = this.loadProgress();
    const today = this.getTodayString();

    if (progress.attendance.includes(today)) {
      return { alreadyCheckedIn: true, streak: this.getAttendanceStreak(), today };
    }

    progress.attendance.push(today);
    progress.attendance.sort();
    this.saveProgress(progress);

    return { alreadyCheckedIn: false, streak: this.getAttendanceStreak(), today };
  },

  /**
   * Check whether today's attendance is already registered
   * @returns {boolean}
   */
  isCheckedInToday() {
    const progress = this.loadProgress();
    return progress.attendance.includes(this.getTodayString());
  },

  /**
   * Get attendance dates for a given month
   * @param {string} month - 'YYYY-MM'
   * @returns {string[]} Array of YYYY-MM-DD strings in that month
   */
  getAttendance(month) {
    const progress = this.loadProgress();
    return progress.attendance.filter(date => date.startsWith(month));
  },

  /**
   * Count consecutive SCHOOL days present, ending at the most recent school day on or
   * before today. Weekends and no-school days (holidays/breaks) do not break the streak;
   * a missing school day does. During summer this counts the run ending on the last day
   * of the school year.
   * @returns {number} Current attendance streak (in school days)
   */
  getAttendanceStreak() {
    const progress = this.loadProgress();
    const present = new Set(progress.attendance || []);
    if (present.size === 0) return 0;

    let day = this.latestSchoolDayOnOrBefore(this.getTodayString());
    if (!day) return 0;

    let streak = 0;
    for (let guard = 0; guard < 400 && day; guard++) {
      if (!present.has(day)) break;
      streak++;
      // step to the previous school day
      const [y, m, d] = day.split('-').map(Number);
      const cur = new Date(y, m - 1, d);
      cur.setDate(cur.getDate() - 1);
      const prevIso = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`;
      day = this.latestSchoolDayOnOrBefore(prevIso);
    }
    return streak;
  }
};

// Export for use in other modules
window.Storage = Storage;
