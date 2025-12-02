/* ==========================================================================
   Quiz Engine - Morgan's Quiz Platform
   Core quiz logic, scoring, and state management
   ========================================================================== */

const QuizEngine = {
  // Current state
  state: {
    quiz: null,
    currentSectionIndex: 0,
    currentQuestionIndex: 0,
    answers: {},
    startTime: null,
    isComplete: false
  },

  /**
   * Initialize the quiz engine with quiz data
   * @param {Object} quizData - The quiz data object
   */
  init(quizData) {
    this.state = {
      quiz: quizData,
      currentSectionIndex: 0,
      currentQuestionIndex: 0,
      answers: {},
      startTime: Date.now(),
      isComplete: false
    };
    return this;
  },

  /**
   * Get the current section
   * @returns {Object} Current section
   */
  getCurrentSection() {
    return this.state.quiz.sections[this.state.currentSectionIndex];
  },

  /**
   * Get the current question
   * @returns {Object} Current question
   */
  getCurrentQuestion() {
    const section = this.getCurrentSection();
    return section.questions[this.state.currentQuestionIndex];
  },

  /**
   * Get total number of questions across all sections
   * @returns {number} Total questions
   */
  getTotalQuestions() {
    return this.state.quiz.sections.reduce((total, section) => {
      return total + section.questions.length;
    }, 0);
  },

  /**
   * Get current overall question number (1-indexed)
   * @returns {number} Current question number
   */
  getCurrentQuestionNumber() {
    let count = 0;
    for (let i = 0; i < this.state.currentSectionIndex; i++) {
      count += this.state.quiz.sections[i].questions.length;
    }
    return count + this.state.currentQuestionIndex + 1;
  },

  /**
   * Submit an answer for the current question
   * @param {*} answer - The answer value
   * @returns {Object} Result with isCorrect and feedback
   */
  submitAnswer(answer) {
    const question = this.getCurrentQuestion();
    const questionKey = `${this.state.currentSectionIndex}-${this.state.currentQuestionIndex}`;
    
    // Store the answer
    this.state.answers[questionKey] = {
      answer: answer,
      questionId: question.id,
      timestamp: Date.now()
    };

    // Check if correct based on question type
    let isCorrect = false;
    
    switch (question.type) {
      case 'multiple-choice':
      case 'circle-word':
      case 'circle-correct':
        isCorrect = answer === question.correct;
        break;

      case 'fill-blank':
      case 'text-input':
      case 'spelling':
        // Case-insensitive comparison, trim whitespace
        const normalizedAnswer = answer.toString().toLowerCase().trim();
        const normalizedCorrect = question.correct.toString().toLowerCase().trim();
        isCorrect = normalizedAnswer === normalizedCorrect;
        break;

      case 'matching':
        // For matching, answer should be an object { left: right }
        isCorrect = this.checkMatchingAnswer(answer, question.correct);
        break;

      case 'multi-select':
        // For questions where multiple answers can be selected
        isCorrect = this.checkMultiSelectAnswer(answer, question.correct);
        break;

      case 'tick-correct':
        isCorrect = answer === question.correct;
        break;

      case 'underline':
        // Check if the underlined word matches
        const answerLower = answer.toString().toLowerCase().trim();
        const correctLower = question.correct.toString().toLowerCase().trim();
        isCorrect = answerLower === correctLower;
        break;

      case 'writing':
        // Writing is manually graded or always accepted
        isCorrect = true; // Auto-accept for now
        break;

      default:
        isCorrect = answer === question.correct;
    }

    // Store correctness
    this.state.answers[questionKey].isCorrect = isCorrect;

    return {
      isCorrect,
      correctAnswer: question.correct,
      hint: question.hint || null,
      feedback: isCorrect ? Feedback.getRandomMessage(true) : Feedback.getRandomMessage(false)
    };
  },

  /**
   * Check matching question answer
   * @param {Object} answer - User's answer
   * @param {Object} correct - Correct mapping
   * @returns {boolean} Whether all matches are correct
   */
  checkMatchingAnswer(answer, correct) {
    const answerKeys = Object.keys(answer);
    const correctKeys = Object.keys(correct);
    
    if (answerKeys.length !== correctKeys.length) return false;
    
    return answerKeys.every(key => {
      return answer[key].toLowerCase() === correct[key].toLowerCase();
    });
  },

  /**
   * Check multi-select answer
   * @param {Array} answer - User's selected answers
   * @param {Array} correct - Correct answers
   * @returns {boolean} Whether selection is correct
   */
  checkMultiSelectAnswer(answer, correct) {
    if (!Array.isArray(answer) || !Array.isArray(correct)) return false;
    if (answer.length !== correct.length) return false;
    
    const sortedAnswer = [...answer].sort();
    const sortedCorrect = [...correct].sort();
    
    return sortedAnswer.every((val, idx) => val === sortedCorrect[idx]);
  },

  /**
   * Move to the next question
   * @returns {boolean} True if moved, false if at end
   */
  nextQuestion() {
    const section = this.getCurrentSection();
    
    if (this.state.currentQuestionIndex < section.questions.length - 1) {
      // More questions in current section
      this.state.currentQuestionIndex++;
      return true;
    } else if (this.state.currentSectionIndex < this.state.quiz.sections.length - 1) {
      // Move to next section
      this.state.currentSectionIndex++;
      this.state.currentQuestionIndex = 0;
      return true;
    } else {
      // Quiz complete
      this.state.isComplete = true;
      return false;
    }
  },

  /**
   * Move to the previous question
   * @returns {boolean} True if moved, false if at start
   */
  previousQuestion() {
    if (this.state.currentQuestionIndex > 0) {
      this.state.currentQuestionIndex--;
      return true;
    } else if (this.state.currentSectionIndex > 0) {
      this.state.currentSectionIndex--;
      const prevSection = this.getCurrentSection();
      this.state.currentQuestionIndex = prevSection.questions.length - 1;
      return true;
    }
    return false;
  },

  /**
   * Check if there's a next question
   * @returns {boolean} True if there's a next question
   */
  hasNextQuestion() {
    const section = this.getCurrentSection();
    return this.state.currentQuestionIndex < section.questions.length - 1 ||
           this.state.currentSectionIndex < this.state.quiz.sections.length - 1;
  },

  /**
   * Check if there's a previous question
   * @returns {boolean} True if there's a previous question
   */
  hasPreviousQuestion() {
    return this.state.currentQuestionIndex > 0 || this.state.currentSectionIndex > 0;
  },

  /**
   * Calculate the final score
   * @returns {Object} Score details
   */
  calculateScore() {
    const answers = Object.values(this.state.answers);
    const totalQuestions = this.getTotalQuestions();
    const correctAnswers = answers.filter(a => a.isCorrect).length;
    const incorrectAnswers = answers.filter(a => !a.isCorrect).length;
    const unanswered = totalQuestions - answers.length;
    
    const score = totalQuestions > 0 
      ? Math.round((correctAnswers / totalQuestions) * 100) 
      : 0;

    const stars = Feedback.calculateStars(score);
    const timeSpent = Math.round((Date.now() - this.state.startTime) / 1000);

    return {
      score,
      stars,
      correctAnswers,
      incorrectAnswers,
      unanswered,
      totalQuestions,
      timeSpent,
      message: Feedback.getScoreMessage(score)
    };
  },

  /**
   * Get progress percentage
   * @returns {number} Progress percentage
   */
  getProgress() {
    const answered = Object.keys(this.state.answers).length;
    const total = this.getTotalQuestions();
    return Math.round((answered / total) * 100);
  },

  /**
   * Get answer for a specific question
   * @param {number} sectionIndex - Section index
   * @param {number} questionIndex - Question index
   * @returns {*} The stored answer or null
   */
  getAnswer(sectionIndex, questionIndex) {
    const key = `${sectionIndex}-${questionIndex}`;
    return this.state.answers[key] || null;
  },

  /**
   * Check if current question has been answered
   * @returns {boolean} True if answered
   */
  isCurrentQuestionAnswered() {
    const key = `${this.state.currentSectionIndex}-${this.state.currentQuestionIndex}`;
    return this.state.answers.hasOwnProperty(key);
  },

  /**
   * Get section progress
   * @returns {Object} Section progress info
   */
  getSectionProgress() {
    const sections = this.state.quiz.sections.map((section, sectionIndex) => {
      const answered = section.questions.filter((_, qIndex) => {
        const key = `${sectionIndex}-${qIndex}`;
        return this.state.answers.hasOwnProperty(key);
      }).length;

      return {
        name: section.name,
        total: section.questions.length,
        answered,
        complete: answered === section.questions.length
      };
    });

    return {
      sections,
      currentSection: this.state.currentSectionIndex,
      totalSections: this.state.quiz.sections.length
    };
  },

  /**
   * Reset the quiz to start over
   */
  reset() {
    this.state.currentSectionIndex = 0;
    this.state.currentQuestionIndex = 0;
    this.state.answers = {};
    this.state.startTime = Date.now();
    this.state.isComplete = false;
  },

  /**
   * Jump to a specific section
   * @param {number} sectionIndex - Section to jump to
   */
  goToSection(sectionIndex) {
    if (sectionIndex >= 0 && sectionIndex < this.state.quiz.sections.length) {
      this.state.currentSectionIndex = sectionIndex;
      this.state.currentQuestionIndex = 0;
    }
  }
};

// Export for use in other modules
window.QuizEngine = QuizEngine;
