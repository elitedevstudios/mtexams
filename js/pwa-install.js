(() => {
  const BANNER_KEY = 'pwa-banner-dismissed'; // sessionStorage — resets each visit

  // Already installed — nothing to do
  if (window.matchMedia('(display-mode: standalone)').matches) return;

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
  let deferredPrompt = null;

  // ── Nav install button ──────────────────────────────────────────────────────

  function injectNavButton() {
    const nav = document.querySelector('.app-nav');
    if (!nav || nav.querySelector('.nav-install-btn')) return;

    const btn = document.createElement('button');
    btn.className = 'nav-install-btn';
    btn.setAttribute('title', 'Add to Home Screen');
    btn.setAttribute('aria-label', 'Install Learning Adventure');
    btn.textContent = '📲';

    btn.addEventListener('click', () => {
      if (isIOS) {
        showIOSModal();
      } else if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(() => { deferredPrompt = null; });
      }
    });

    nav.appendChild(btn);
  }

  // ── iOS instruction modal ───────────────────────────────────────────────────

  function showIOSModal() {
    if (document.querySelector('.pwa-ios-modal')) return;
    const overlay = document.createElement('div');
    overlay.className = 'pwa-ios-modal';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'How to install Learning Adventure');
    overlay.innerHTML = `
      <div class="pwa-ios-modal__box">
        <p class="pwa-ios-modal__title">📲 Add to Home Screen</p>
        <p class="pwa-ios-modal__step">1. Tap the <strong>Share</strong> button&nbsp;⎙ at the bottom of Safari</p>
        <p class="pwa-ios-modal__step">2. Scroll down and tap <strong>"Add to Home Screen"</strong></p>
        <button class="pwa-ios-modal__close">Got it!</button>
      </div>
    `;
    overlay.addEventListener('click', e => {
      if (e.target === overlay || e.target.classList.contains('pwa-ios-modal__close')) {
        overlay.remove();
      }
    });
    document.body.appendChild(overlay);
  }

  // ── One-time banner (session only) ─────────────────────────────────────────

  function createBanner() {
    const banner = document.createElement('div');
    banner.className = 'pwa-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Install Learning Adventure');
    banner.innerHTML = `
      <div class="pwa-banner__header">
        <img class="pwa-banner__icon" src="/assets/icons/icon-192.png" alt="Learning Adventure icon">
        <div>
          <p class="pwa-banner__title">Add to your device!</p>
          <p class="pwa-banner__subtitle">Save Learning Adventure to your home screen for quick access — even offline.</p>
        </div>
      </div>
      <div class="pwa-banner__actions">
        <button class="pwa-banner__btn-install">Add to Home Screen</button>
        <button class="pwa-banner__btn-dismiss">Not now</button>
      </div>
    `;

    banner.querySelector('.pwa-banner__btn-install').addEventListener('click', async () => {
      hideBanner(banner);
      if (deferredPrompt) {
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        deferredPrompt = null;
      }
      sessionStorage.setItem(BANNER_KEY, '1');
    });

    banner.querySelector('.pwa-banner__btn-dismiss').addEventListener('click', () => {
      hideBanner(banner);
      sessionStorage.setItem(BANNER_KEY, '1');
    });

    return banner;
  }

  function showBanner(banner) {
    document.body.appendChild(banner);
    requestAnimationFrame(() => requestAnimationFrame(() => banner.classList.add('pwa-banner--visible')));
  }

  function hideBanner(banner) {
    banner.classList.remove('pwa-banner--visible');
    banner.addEventListener('transitionend', () => banner.remove(), { once: true });
  }

  // ── Entry points ────────────────────────────────────────────────────────────

  // Android / Chrome: wait for browser install signal
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    injectNavButton();
    if (!sessionStorage.getItem(BANNER_KEY)) {
      const banner = createBanner();
      setTimeout(() => showBanner(banner), 2500);
    }
  });

  // iOS Safari: no beforeinstallprompt — inject nav button immediately
  if (isIOS) {
    injectNavButton();
  }
})();
