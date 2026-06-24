/**
 * modal-a11y.js
 * Keyboard accessibility for the first-time name modal (WCAG 2.1.1):
 *  - Escape closes the modal (app works fine without a name)
 *  - Tab / Shift+Tab are trapped inside the modal while it is open
 *
 * Self-contained and timing-agnostic: it reads the modal's live display
 * state on each keydown, so it does not need to coordinate with the inline
 * script that opens the modal.
 */
(function () {
  'use strict';

  const modal = document.getElementById('name-modal');
  if (!modal) return;

  // The modal is shown by setting display:flex and hidden with display:none.
  // (It is position:fixed, so offsetParent is always null — don't rely on it.)
  const isOpen = () => getComputedStyle(modal).display !== 'none';

  function focusableItems() {
    return Array.from(
      modal.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0);
  }

  document.addEventListener('keydown', function (e) {
    if (!isOpen()) return;

    if (e.key === 'Escape') {
      modal.style.display = 'none';
      return;
    }

    if (e.key !== 'Tab') return;

    const items = focusableItems();
    if (items.length === 0) return;

    const first = items[0];
    const last = items[items.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
})();
