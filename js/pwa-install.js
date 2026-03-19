(() => {
  const STORAGE_KEY = 'pwa-install-dismissed';

  // Don't show if already dismissed or installed
  if (localStorage.getItem(STORAGE_KEY)) return;
  if (window.matchMedia('(display-mode: standalone)').matches) return;

  let deferredPrompt = null;

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
      localStorage.setItem(STORAGE_KEY, '1');
    });

    banner.querySelector('.pwa-banner__btn-dismiss').addEventListener('click', () => {
      hideBanner(banner);
      localStorage.setItem(STORAGE_KEY, '1');
    });

    return banner;
  }

  function showBanner(banner) {
    document.body.appendChild(banner);
    // Trigger animation on next frame
    requestAnimationFrame(() => requestAnimationFrame(() => banner.classList.add('pwa-banner--visible')));
  }

  function hideBanner(banner) {
    banner.classList.remove('pwa-banner--visible');
    banner.addEventListener('transitionend', () => banner.remove(), { once: true });
  }

  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    const banner = createBanner();
    // Small delay so the page feels settled before the prompt appears
    setTimeout(() => showBanner(banner), 2500);
  });
})();
