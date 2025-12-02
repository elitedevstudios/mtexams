/* ==========================================================================
   Storage Module - Morgan's Quiz Platform
   Handles saving and loading progress from localStorage
   ========================================================================== */

const Storage = {
  KEYS: {
    PROGRESS: 'morganQuizProgress',
    SETTINGS: 'morganQuizSettings'
  },

  /**
   * Get the default progress structure
   * @returns {Object} Default progress object
   */
  getDefaultProgress() {
    return {
      name: 'Morgan',
      quizzes: {},
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

    // Update total stars (use best score for star calculation)
    progress.totalStars = this.calculateTotalStars(progress.quizzes);
    
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
  }
};

// Export for use in other modules
window.Storage = Storage;
