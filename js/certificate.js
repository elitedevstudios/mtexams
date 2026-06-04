/**
 * Certificate — printable achievement certificate
 * Certificate.show({ title, score, stars }) opens an overlay with a
 * print button. @media print rules (components.css) hide everything
 * except the certificate.
 */
const Certificate = {
  show({ title, score, stars }) {
    this.hide();

    // App's Storage module (js/storage.js) shadows the built-in — guard on the method
    const name = (typeof Storage.getName === 'function' && Storage.getName()) || 'Superstar';
    const date = new Date().toLocaleDateString('en-JM', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
    const starRow = '⭐'.repeat(stars) + '☆'.repeat(Math.max(0, 3 - stars));
    const praise = stars >= 3 ? 'Outstanding work!' : stars === 2 ? 'Great achievement!' : 'Well done!';

    const overlay = document.createElement('div');
    overlay.className = 'certificate-overlay';
    overlay.id = 'certificate-overlay';
    overlay.innerHTML = `
      <div class="certificate" role="dialog" aria-label="Achievement certificate">
        <div class="certificate__border">
          <div class="certificate__crest">🏆</div>
          <p class="certificate__brand">Learning Adventure</p>
          <h1 class="certificate__heading">Certificate of Achievement</h1>
          <p class="certificate__line">This certificate is proudly presented to</p>
          <p class="certificate__name">${this.escape(name)}</p>
          <p class="certificate__line">for completing</p>
          <p class="certificate__quiz">${this.escape(title)}</p>
          <p class="certificate__score">with a score of <strong>${score}%</strong></p>
          <div class="certificate__stars" aria-label="${stars} of 3 stars">${starRow}</div>
          <p class="certificate__praise">${praise}</p>
          <div class="certificate__footer">
            <span class="certificate__date">${date}</span>
            <span class="certificate__curriculum">Jamaica NSC · Grade 2</span>
          </div>
        </div>
      </div>
      <div class="certificate-overlay__actions">
        <button class="btn btn--primary" id="certificate-print">Print 🖨️</button>
        <button class="btn btn--outline" id="certificate-close">Close ✖️</button>
      </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById('certificate-print').addEventListener('click', () => window.print());
    document.getElementById('certificate-close').addEventListener('click', () => this.hide());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) this.hide(); });
  },

  hide() {
    document.getElementById('certificate-overlay')?.remove();
  },

  escape(s) {
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  },

  /** HTML for a "print certificate" results button */
  buttonHtml() {
    return '<button class="btn btn--secondary" id="certificate-btn">My Certificate 🏆</button>';
  }
};
