/**
 * Parent Dashboard — progress reports behind a simple password gate.
 *
 * NOTE: the password is a soft gate to keep the child out of the parent
 * view. Everything lives in localStorage on this device — it is NOT
 * account security. Default password: Password123 (changeable below).
 */
const ParentDashboard = {
  DEFAULT_PASSWORD: 'Password123',
  SESSION_KEY: 'parentDashboardUnlocked',

  init() {
    if (sessionStorage.getItem(this.SESSION_KEY) === '1') {
      this.renderDashboard();
    } else {
      this.renderGate();
    }
  },

  getPassword() {
    const settings = Storage.loadSettings();
    return settings.parentPassword || this.DEFAULT_PASSWORD;
  },

  setPassword(newPassword) {
    const settings = Storage.loadSettings();
    settings.parentPassword = newPassword;
    Storage.saveSettings(settings);
  },

  /* ---------- Password gate ---------- */

  renderGate() {
    const el = document.getElementById('dashboard-content');
    el.innerHTML = `
      <div class="parent-gate card">
        <div class="parent-gate__icon">🔒</div>
        <h1 class="parent-gate__title">Parents Only</h1>
        <p class="parent-gate__text">Enter the parent password to see progress reports.</p>
        <form id="gate-form" class="parent-gate__form">
          <input type="password" id="gate-password" class="parent-gate__input"
                 placeholder="Password" autocomplete="current-password" required>
          <button type="submit" class="btn btn--primary">Unlock</button>
        </form>
        <p class="parent-gate__error" id="gate-error" hidden>That's not it — try again.</p>
      </div>
    `;

    document.getElementById('gate-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const entered = document.getElementById('gate-password').value;
      if (entered === this.getPassword()) {
        sessionStorage.setItem(this.SESSION_KEY, '1');
        this.renderDashboard();
      } else {
        document.getElementById('gate-error').hidden = false;
        document.getElementById('gate-password').value = '';
        document.getElementById('gate-password').focus();
      }
    });
    document.getElementById('gate-password').focus();
  },

  /* ---------- Dashboard ---------- */

  renderDashboard() {
    const progress = Storage.loadProgress();
    const name = progress.name || 'your child';

    const quizEntries = Object.entries(progress.quizzes || {});
    const coreQuizzes = quizEntries.filter(([k]) => !k.startsWith('workbook-'));
    const workbookQuizzes = quizEntries.filter(([k]) => k.startsWith('workbook-'));
    const lessons = Object.entries(progress.lessons || {});
    const attendance = progress.attendance || [];

    const avg = (rows) => rows.length
      ? Math.round(rows.reduce((s, [, r]) => s + (r.bestScore ?? r.score ?? 0), 0) / rows.length)
      : 0;

    const el = document.getElementById('dashboard-content');
    el.innerHTML = `
      <div class="parent-dash">
        <header class="parent-dash__header">
          <h1>Progress Report — ${this.escape(this.cap(name))}</h1>
          <div class="parent-dash__header-actions">
            <button class="btn btn--secondary" id="print-report-btn">Print Report 🖨️</button>
            <button class="btn btn--outline" id="lock-btn">Lock 🔒</button>
          </div>
        </header>

        <section class="parent-dash__cards">
          ${this.statCard('⭐', progress.totalStars || 0, 'Total Stars')}
          ${this.statCard('📅', attendance.length, 'Days Attended')}
          ${this.statCard('🔥', Storage.getAttendanceStreak ? Storage.getAttendanceStreak() : (progress.streak || 0), 'Attendance Streak')}
          ${this.statCard('🎬', `${lessons.length} / 54`, 'Lessons Done')}
          ${this.statCard('📝', coreQuizzes.length, 'Quizzes Taken')}
          ${this.statCard('📖', workbookQuizzes.length, 'Workbook Topics')}
        </section>

        <section class="parent-dash__section">
          <h2>Quizzes & Tests <span class="parent-dash__avg">avg best score: ${avg(coreQuizzes)}%</span></h2>
          ${this.resultsTable(coreQuizzes, 'No quizzes completed yet.')}
        </section>

        <section class="parent-dash__section">
          <h2>Workbook Practice <span class="parent-dash__avg">avg best score: ${avg(workbookQuizzes)}%</span></h2>
          ${this.resultsTable(workbookQuizzes, 'No workbook topics completed yet.', true)}
        </section>

        <section class="parent-dash__section">
          <h2>Lessons <span class="parent-dash__avg">avg check score: ${avg(lessons)}%</span></h2>
          ${this.resultsTable(lessons, 'No lessons completed yet.')}
        </section>

        <section class="parent-dash__section">
          <h2>Attendance (last 30 days)</h2>
          ${this.attendanceStrip(attendance)}
        </section>

        <section class="parent-dash__section parent-dash__settings">
          <h2>Change Parent Password</h2>
          <form id="password-form" class="parent-dash__password-form">
            <input type="password" id="new-password" placeholder="New password (min 6 characters)"
                   minlength="6" autocomplete="new-password" required>
            <button type="submit" class="btn btn--secondary">Save Password</button>
          </form>
          <p class="parent-dash__hint" id="password-saved" hidden>✅ Password updated.</p>
          <p class="parent-dash__hint">This is a simple on-device lock to keep little fingers out —
            data never leaves this device.</p>
        </section>
      </div>
    `;

    document.getElementById('print-report-btn').addEventListener('click', () => window.print());
    document.getElementById('lock-btn').addEventListener('click', () => {
      sessionStorage.removeItem(this.SESSION_KEY);
      this.renderGate();
    });
    document.getElementById('password-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.setPassword(document.getElementById('new-password').value);
      document.getElementById('new-password').value = '';
      document.getElementById('password-saved').hidden = false;
    });
  },

  statCard(icon, value, label) {
    return `
      <div class="parent-dash__card card">
        <span class="parent-dash__card-icon">${icon}</span>
        <span class="parent-dash__card-value">${value}</span>
        <span class="parent-dash__card-label">${label}</span>
      </div>
    `;
  },

  resultsTable(rows, emptyMessage, isWorkbook = false) {
    if (!rows.length) return `<p class="parent-dash__empty">${emptyMessage}</p>`;
    const sorted = [...rows].sort((a, b) => new Date(b[1].date || 0) - new Date(a[1].date || 0));
    return `
      <div class="parent-dash__table-wrap">
        <table class="parent-dash__table">
          <thead>
            <tr><th>Activity</th><th>Best Score</th><th>Stars</th><th>Tries</th><th>Last Done</th></tr>
          </thead>
          <tbody>
            ${sorted.map(([key, r]) => `
              <tr>
                <td>${this.escape(this.prettyName(key, isWorkbook))}</td>
                <td>${r.bestScore ?? r.score ?? 0}%</td>
                <td>${'⭐'.repeat(r.stars || 0) || '—'}</td>
                <td>${r.attempts || 1}</td>
                <td>${r.date ? new Date(r.date).toLocaleDateString() : '—'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  attendanceStrip(attendance) {
    const days = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      days.push({ iso, present: attendance.includes(iso), label: d.getDate() });
    }
    return `
      <div class="parent-dash__attendance">
        ${days.map(d => `
          <span class="parent-dash__day ${d.present ? 'parent-dash__day--present' : ''}"
                title="${d.iso}${d.present ? ' — present' : ''}">${d.present ? '⭐' : d.label}</span>
        `).join('')}
      </div>
    `;
  },

  /** "workbook-nsc-practice-symmetry-what-is-symmetry" → readable label */
  prettyName(key, isWorkbook) {
    let k = isWorkbook ? key.replace(/^workbook-/, '') : key;
    return k.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  },

  cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); },

  escape(s) {
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }
};

document.addEventListener('DOMContentLoaded', () => ParentDashboard.init());
