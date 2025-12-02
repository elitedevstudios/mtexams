/* ==========================================================================
   Feedback Module - Morgan's Quiz Platform
   Handles animations, sounds, and celebrations
   ========================================================================== */

const Feedback = {
  settings: {
    soundEnabled: true,
    animationsEnabled: true
  },

  /**
   * Initialize feedback module with settings
   * @param {Object} settings - User settings
   */
  init(settings = {}) {
    this.settings = { ...this.settings, ...settings };
  },

  /**
   * Show confetti animation
   * @param {number} count - Number of confetti pieces
   */
  showConfetti(count = 50) {
    if (!this.settings.animationsEnabled) return;

    const container = document.createElement('div');
    container.className = 'confetti-container';
    document.body.appendChild(container);

    const colors = [
      'oklch(65% 0.2 250)',   // Blue
      'oklch(75% 0.18 150)',  // Green
      'oklch(80% 0.2 80)',    // Yellow
      'oklch(85% 0.15 320)',  // Purple
      'oklch(70% 0.2 25)'     // Red
    ];

    for (let i = 0; i < count; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.cssText = `
        left: ${Math.random() * 100}%;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        animation-delay: ${Math.random() * 0.5}s;
        animation-duration: ${2 + Math.random() * 2}s;
      `;
      container.appendChild(confetti);
    }

    // Clean up after animation
    setTimeout(() => container.remove(), 4000);
  },

  /**
   * Show star burst animation at a position
   * @param {number} x - X position
   * @param {number} y - Y position
   */
  showStarBurst(x, y) {
    if (!this.settings.animationsEnabled) return;

    const container = document.createElement('div');
    container.className = 'star-burst';
    document.body.appendChild(container);

    const starCount = 8;
    for (let i = 0; i < starCount; i++) {
      const star = document.createElement('div');
      star.className = 'star-burst__star';
      star.textContent = '⭐';
      
      const angle = (i / starCount) * 360;
      const distance = 100;
      const radians = angle * (Math.PI / 180);
      
      star.style.cssText = `
        left: ${x}px;
        top: ${y}px;
        --x: ${Math.cos(radians) * distance}px;
        --y: ${Math.sin(radians) * distance}px;
      `;
      container.appendChild(star);
    }

    setTimeout(() => container.remove(), 1200);
  },

  /**
   * Show floating emoji
   * @param {string} emoji - Emoji to show
   * @param {number} x - X position
   * @param {number} y - Y position
   */
  showFloatingEmoji(emoji, x, y) {
    if (!this.settings.animationsEnabled) return;

    const emojiEl = document.createElement('div');
    emojiEl.className = 'emoji-float';
    emojiEl.textContent = emoji;
    emojiEl.style.left = `${x}px`;
    emojiEl.style.top = `${y}px`;
    document.body.appendChild(emojiEl);

    setTimeout(() => emojiEl.remove(), 2000);
  },

  /**
   * Show correct answer feedback
   * @param {HTMLElement} element - The option element
   */
  showCorrect(element) {
    element.classList.add('option--correct');
    
    // Get position for star burst
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    this.showFloatingEmoji('🎉', x, y);
    this.playSound('correct');
  },

  /**
   * Show incorrect answer feedback
   * @param {HTMLElement} element - The option element
   */
  showIncorrect(element) {
    element.classList.add('option--incorrect');
    this.playSound('incorrect');
  },

  /**
   * Show celebration for completing a quiz
   * @param {number} score - Score percentage
   * @param {number} stars - Stars earned
   */
  showCelebration(score, stars) {
    this.showConfetti(stars * 30);
    
    setTimeout(() => {
      this.playSound('complete');
    }, 300);
  },

  /**
   * Play a sound effect
   * @param {string} soundType - Type of sound: 'correct', 'incorrect', 'complete', 'click'
   */
  playSound(soundType) {
    if (!this.settings.soundEnabled) return;

    // Using Web Audio API for simple sounds
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    switch (soundType) {
      case 'correct':
        // Happy ascending tone
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.4);
        break;

      case 'incorrect':
        // Gentle descending tone
        oscillator.frequency.setValueAtTime(349.23, audioContext.currentTime); // F4
        oscillator.frequency.setValueAtTime(293.66, audioContext.currentTime + 0.15); // D4
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.3);
        break;

      case 'complete':
        // Victory fanfare
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, i) => {
          const osc = audioContext.createOscillator();
          const gain = audioContext.createGain();
          osc.connect(gain);
          gain.connect(audioContext.destination);
          osc.frequency.setValueAtTime(freq, audioContext.currentTime + i * 0.15);
          gain.gain.setValueAtTime(0.3, audioContext.currentTime + i * 0.15);
          gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.15 + 0.3);
          osc.start(audioContext.currentTime + i * 0.15);
          osc.stop(audioContext.currentTime + i * 0.15 + 0.3);
        });
        break;

      case 'click':
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.05);
        break;
    }
  },

  /**
   * Show feedback message
   * @param {string} type - 'correct', 'incorrect', or 'hint'
   * @param {string} message - Message to display
   * @param {HTMLElement} container - Where to append the message
   */
  showMessage(type, message, container) {
    // Remove existing feedback
    const existing = container.querySelector('.feedback');
    if (existing) existing.remove();

    const icons = {
      correct: '✅',
      incorrect: '💪',
      hint: '💡'
    };

    const feedback = document.createElement('div');
    feedback.className = `feedback feedback--${type}`;
    feedback.innerHTML = `
      <span class="feedback__icon">${icons[type]}</span>
      <span class="feedback__text">${message}</span>
    `;
    container.appendChild(feedback);

    // Auto-remove after delay for correct answers
    if (type === 'correct') {
      setTimeout(() => feedback.remove(), 2000);
    }
  },

  /**
   * Encouragement messages for correct answers
   */
  correctMessages: [
    "Amazing job! 🌟",
    "You're so smart! 🧠",
    "Fantastic! ⭐",
    "Well done! 🎉",
    "Super! 🚀",
    "Brilliant! 💫",
    "You got it! 👏",
    "Excellent! 🏆",
    "Perfect! 💯",
    "Wonderful! 🌈"
  ],

  /**
   * Encouragement messages for incorrect answers
   */
  incorrectMessages: [
    "Good try! Let's try again! 💪",
    "Almost there! You can do it! 🌟",
    "Keep going! You're learning! 📚",
    "That's okay! Try once more! 💫",
    "Don't give up! 🚀",
    "Nice effort! Let's try again! 💪"
  ],

  /**
   * Get a random encouragement message
   * @param {boolean} isCorrect - Whether the answer was correct
   * @returns {string} Random message
   */
  getRandomMessage(isCorrect) {
    const messages = isCorrect ? this.correctMessages : this.incorrectMessages;
    return messages[Math.floor(Math.random() * messages.length)];
  },

  /**
   * Calculate stars based on score
   * @param {number} score - Score percentage (0-100)
   * @returns {number} Stars earned (0-3)
   */
  calculateStars(score) {
    if (score >= 90) return 3;
    if (score >= 70) return 2;
    if (score > 0) return 1;
    return 0;
  },

  /**
   * Get message based on score
   * @param {number} score - Score percentage
   * @returns {string} Appropriate message
   */
  getScoreMessage(score) {
    if (score >= 90) return "Outstanding! You're a superstar! 🌟";
    if (score >= 80) return "Excellent work! Keep it up! 🎉";
    if (score >= 70) return "Great job! You're doing well! 👏";
    if (score >= 60) return "Good effort! Practice makes perfect! 💪";
    return "Nice try! Let's practice some more! 📚";
  }
};

// Export for use in other modules
window.Feedback = Feedback;
