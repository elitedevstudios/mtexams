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
    const att = this.attendanceStats(attendance);

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
          ${this.statCard('✅', `${att.rate}%`, 'Attendance Rate')}
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
          <h2>Attendance (last 30 school days)
            <span class="parent-dash__avg">${att.rate}% — ${att.present} of ${att.expected} school days since ${new Date(Storage.SCHOOL.start + 'T00:00:00').toLocaleDateString()}</span>
          </h2>
          ${this.attendanceStrip(attendance)}
        </section>

        <section class="parent-dash__section parent-dash__settings">
          <h2>Backup &amp; Restore</h2>
          <p class="parent-dash__hint">Save all of ${this.escape(this.cap(name))}'s progress to a file,
            or restore it from a backup. Data stays on this device — a backup lets you move it to
            another device or set up progress in one step.</p>
          <div class="parent-dash__backup-actions">
            <button class="btn btn--secondary" id="export-backup-btn">Download Backup ⬇️</button>
            <button class="btn btn--outline" id="import-backup-btn">Restore from File ⬆️</button>
            <input type="file" id="import-backup-input" accept=".json,application/json" hidden>
          </div>
          <p class="parent-dash__hint" id="backup-status" role="status" aria-live="polite" hidden></p>
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

    document.getElementById('export-backup-btn').addEventListener('click', () => this.exportBackup());
    const importInput = document.getElementById('import-backup-input');
    document.getElementById('import-backup-btn').addEventListener('click', () => importInput.click());
    importInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) this.importBackup(e.target.files[0]);
      e.target.value = ''; // allow re-selecting the same file
    });
  },

  /** Download all progress + settings as a JSON backup file. */
  exportBackup() {
    const backup = {
      app: 'Learning Adventure',
      type: 'progress-backup',
      version: 1,
      exportedAt: new Date().toISOString(),
      progress: Storage.loadProgress(),
      settings: Storage.loadSettings()
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `learning-adventure-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  },

  /** Restore progress (and settings) from a backup file, then re-render. */
  importBackup(file) {
    const status = document.getElementById('backup-status');
    const show = (msg) => { status.hidden = false; status.textContent = msg; };
    const reader = new FileReader();
    reader.onerror = () => show('⚠️ Could not read that file.');
    reader.onload = () => {
      let data;
      try {
        data = JSON.parse(reader.result);
      } catch {
        return show('⚠️ That file is not valid JSON.');
      }
      // Accept either a full backup ({progress, settings}) or a bare progress object
      const progress = data.progress || (data.attendance || data.quizzes ? data : null);
      if (!progress || typeof progress !== 'object' ||
          !('attendance' in progress || 'quizzes' in progress || 'lessons' in progress)) {
        return show('⚠️ This does not look like a Learning Adventure backup.');
      }
      Storage.saveProgress(progress);
      if (data.settings && typeof data.settings === 'object') Storage.saveSettings(data.settings);
      show('✅ Backup restored! Updating report…');
      setTimeout(() => this.renderDashboard(), 700);
    };
    reader.readAsText(file);
  },

  /**
   * Attendance rate = present school-days ÷ expected school-days. School days come from
   * the shared calendar (Storage.SCHOOL): weekdays in the term, minus holidays/breaks.
   * Capped at 100%.
   * @returns {{ rate: number, present: number, expected: number }}
   */
  attendanceStats(attendance) {
    const schoolDays = Storage.schoolDaysBetween(Storage.SCHOOL.start, Storage.getTodayString());
    const set = new Set(schoolDays);
    const present = attendance.filter(iso => set.has(iso)).length;
    const expected = schoolDays.length;
    const rate = expected ? Math.min(100, Math.round((present / expected) * 100)) : 0;
    return { rate, present, expected };
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
    const present = new Set(attendance);
    // Last 30 school days on or before today (weekends + holidays skipped), so the strip
    // stays meaningful outside term time.
    const schoolDays = Storage.schoolDaysBetween(Storage.SCHOOL.start, Storage.getTodayString());
    const days = schoolDays.slice(-30).map(iso => ({
      iso,
      present: present.has(iso),
      label: Number(iso.slice(8, 10))
    }));
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
