/**
 * TTS — read question prompts aloud (Web Speech API)
 * Zero dependencies. If speechSynthesis is unavailable the speaker
 * buttons stay hidden (CSS gate on <html class="tts-enabled">).
 */
const TTS = {
  supported: 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window,
  voice: null,
  speakingBtn: null,

  init() {
    if (!this.supported) return;
    document.documentElement.classList.add('tts-enabled');

    // Voices load async in some browsers
    this.pickVoice();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = () => this.pickVoice();
    }

    // One delegated listener covers every quiz page and re-rendered views
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.tts-btn');
      if (!btn) return;
      e.preventDefault();
      if (btn === this.speakingBtn) {
        this.stop();
        return;
      }
      const text = this.textFor(btn);
      if (text) this.speak(text, btn);
    });
  },

  /** Prefer a friendly English voice; fall back to browser default */
  pickVoice() {
    const voices = speechSynthesis.getVoices();
    if (!voices.length) return;
    this.voice =
      voices.find(v => /en[-_](JM|GB)/i.test(v.lang) && v.localService) ||
      voices.find(v => /^en[-_]/i.test(v.lang) && v.localService) ||
      voices.find(v => /^en[-_]/i.test(v.lang)) ||
      null;
  },

  /** Pull the prompt text from the question card the button sits in */
  textFor(btn) {
    const card = btn.closest('.question-card, .quiz__question, .interactive-question');
    const promptEl = card?.querySelector(
      '.question-card__prompt, .quiz__prompt, .interactive-question__prompt'
    );
    let text = promptEl ? promptEl.textContent : '';
    // Strip the speaker emoji and tidy blanks so they read naturally
    text = text.replace(/🔊/g, '').replace(/_{2,}/g, 'blank').trim();
    return text;
  },

  speak(text, btn) {
    this.stop();
    const u = new SpeechSynthesisUtterance(text);
    if (this.voice) u.voice = this.voice;
    u.rate = 0.9;   // a touch slower for young readers
    u.pitch = 1.05;
    u.onend = () => this.clearSpeaking();
    u.onerror = () => this.clearSpeaking();
    if (btn) {
      btn.classList.add('tts-btn--speaking');
      this.speakingBtn = btn;
    }
    speechSynthesis.speak(u);
  },

  stop() {
    speechSynthesis.cancel();
    this.clearSpeaking();
  },

  clearSpeaking() {
    if (this.speakingBtn) {
      this.speakingBtn.classList.remove('tts-btn--speaking');
      this.speakingBtn = null;
    }
  },

  /** HTML for a read-aloud button — drop next to any question prompt */
  buttonHtml() {
    return '<button class="tts-btn" type="button" aria-label="Read the question aloud" title="Read aloud">🔊</button>';
  }
};

TTS.init();
