/* ==========================================================================
   Attendance Module - Learning Adventure
   Daily check-in: stamp today on a month calendar, track streak, celebrate
   ========================================================================== */

const Attendance = {
  MONTH_NAMES: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ],

  DAY_LABELS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],

  /**
   * Initialize: render the Home hero widget (if present) and header streak pill
   */
  init() {
    this.renderWidget();
    this.renderStreakPill();
  },

  /**
   * Render the check-in widget into #attendance-widget (Home page only)
   */
  renderWidget() {
    const container = document.getElementById('attendance-widget');
    if (!container) return;

    const checkedIn = Storage.isCheckedInToday();
    const streak = Storage.getAttendanceStreak();
    const name = Storage.getName() || 'superstar';

    container.innerHTML = `
      <section class="attendance" aria-label="Daily attendance">
        <div class="attendance__main">
          <div class="attendance__message">
            ${checkedIn
              ? `<span class="attendance__emoji">🎉</span>
                 <div>
                   <h2 class="attendance__title">You're checked in!</h2>
                   <p class="attendance__subtitle">Great job showing up today, ${name}!</p>
                 </div>`
              : `<span class="attendance__emoji">📋</span>
                 <div>
                   <h2 class="attendance__title">Ready for school?</h2>
                   <p class="attendance__subtitle">Tap the button to mark your attendance!</p>
                 </div>`}
          </div>
          <button class="btn btn--large ${checkedIn ? 'btn--outline attendance__btn--done' : 'btn--accent'} attendance__btn"
                  id="attendance-check-in" ${checkedIn ? 'disabled' : ''}>
            ${checkedIn ? '✅ Checked in today!' : '🙋 I\'m here!'}
          </button>
          ${streak > 0 ? `<p class="attendance__streak">🔥 ${streak} day${streak === 1 ? '' : 's'} in a row!</p>` : ''}
          <button class="attendance__toggle" id="attendance-toggle" aria-expanded="false">
            📅 See my calendar
          </button>
        </div>
        <div class="attendance__calendar-wrap" id="attendance-calendar-wrap" hidden>
          ${this.renderCalendar()}
        </div>
      </section>
    `;

    const checkInBtn = document.getElementById('attendance-check-in');
    if (checkInBtn && !checkedIn) {
      checkInBtn.addEventListener('click', () => this.handleCheckIn());
    }

    const toggleBtn = document.getElementById('attendance-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const wrap = document.getElementById('attendance-calendar-wrap');
        const isHidden = wrap.hasAttribute('hidden');
        if (isHidden) {
          wrap.removeAttribute('hidden');
        } else {
          wrap.setAttribute('hidden', '');
        }
        toggleBtn.setAttribute('aria-expanded', String(isHidden));
        toggleBtn.textContent = isHidden ? '📅 Hide my calendar' : '📅 See my calendar';
      });
    }
  },

  /**
   * Handle the "I'm here!" tap
   */
  handleCheckIn() {
    const result = Storage.checkInToday();
    if (!result.alreadyCheckedIn) {
      if (typeof Feedback !== 'undefined' && Feedback.showConfetti) {
        Feedback.showConfetti(40);
      }
      if (typeof Feedback !== 'undefined' && Feedback.playSound) {
        Feedback.playSound('correct');
      }
    }
    this.renderWidget();
    this.renderStreakPill();

    // Keep the calendar open after re-render so the new stamp is visible
    const wrap = document.getElementById('attendance-calendar-wrap');
    const toggleBtn = document.getElementById('attendance-toggle');
    if (wrap && toggleBtn) {
      wrap.removeAttribute('hidden');
      toggleBtn.setAttribute('aria-expanded', 'true');
      toggleBtn.textContent = '📅 Hide my calendar';
    }
  },

  /**
   * Render the current month calendar grid
   * @returns {string} Calendar HTML
   */
  renderCalendar() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
    const presentDays = new Set(
      Storage.getAttendance(monthKey).map(date => Number(date.slice(8, 10)))
    );

    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = now.getDate();

    let cells = this.DAY_LABELS.map(
      label => `<span class="attendance-calendar__label">${label}</span>`
    ).join('');

    for (let i = 0; i < firstDayOfWeek; i++) {
      cells += '<span class="attendance-day attendance-day--empty"></span>';
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isPresent = presentDays.has(day);
      const isToday = day === today;
      cells += `
        <span class="attendance-day
          ${isPresent ? 'attendance-day--present' : ''}
          ${isToday ? 'attendance-day--today' : ''}"
          ${isPresent ? 'title="Present!"' : ''}>
          ${isPresent ? '⭐' : day}
        </span>
      `;
    }

    return `
      <h3 class="attendance-calendar__title">${this.MONTH_NAMES[month]} ${year}</h3>
      <div class="attendance-calendar" role="img" aria-label="Attendance calendar for ${this.MONTH_NAMES[month]}">
        ${cells}
      </div>
    `;
  },

  /**
   * Render the header streak pill (all pages)
   */
  renderStreakPill() {
    const pill = document.getElementById('attendance-streak');
    if (!pill) return;

    const streak = Storage.getAttendanceStreak();
    if (streak > 0) {
      pill.textContent = `🔥 ${streak}`;
      pill.classList.add('attendance-streak--visible');
      pill.title = `${streak} day attendance streak`;
    } else {
      pill.classList.remove('attendance-streak--visible');
    }
  }
};

// Pages without the Home widget still get the streak pill
document.addEventListener('DOMContentLoaded', () => {
  Attendance.renderStreakPill();
});

window.Attendance = Attendance;
