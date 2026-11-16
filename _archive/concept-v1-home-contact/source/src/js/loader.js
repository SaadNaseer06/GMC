// Intro loader (markup in partials/loader.html, styles in loader.css).
// Transparent logo silk-reveals once on dark petrol, holds, then the same
// soft edge sweeps the page in. Click, key or scroll skips to the exit.
export function initLoader() {
  const root = document.documentElement;
  const loader = document.querySelector('[data-loader]');
  if (!loader) return;
  if (!root.classList.contains('has-loader')) {
    loader.remove();
    return;
  }

  const REVEAL_MS = 2400; // silk-in duration + start delay
  const HOLD_MS = 900;
  const FAILSAFE_MS = 7000;

  const logo = loader.querySelector('.loader__logo');
  root.style.overflow = 'hidden';
  window.__lenis?.stop();

  let leaving = false;
  const timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));

  const exit = () => {
    if (leaving) return;
    leaving = true;
    timers.forEach(clearTimeout);
    loader.classList.add('is-ready', 'is-leaving');
    root.classList.remove('has-loader');
    root.style.overflow = '';
    window.__lenis?.start();
    document.dispatchEvent(new CustomEvent('loader:exit'));
    const done = () => loader.remove();
    loader.addEventListener('animationend', (e) => { if (e.target === loader) done(); });
    setTimeout(done, 1600);
  };

  // Start the reveal as soon as the logo has decoded
  if (logo.complete && logo.naturalWidth) loader.classList.add('is-ready');
  later(() => loader.classList.add('is-ready'), 700);

  const revealed = new Promise((resolve) => {
    logo.addEventListener('animationend', resolve, { once: true });
    later(resolve, REVEAL_MS + 400);
  });
  const pageLoaded = new Promise((resolve) => {
    if (document.readyState === 'complete') resolve();
    else window.addEventListener('load', resolve, { once: true });
  });

  Promise.all([revealed, pageLoaded]).then(() => { if (!leaving) later(exit, HOLD_MS); });
  later(exit, FAILSAFE_MS);

  ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach((type) => {
    window.addEventListener(type, exit, { once: true, passive: true });
  });
}
