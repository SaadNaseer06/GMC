import { onVisible, reducedMotion } from './util.js';

// Figures count up once when they come into view. The final value is in the
// HTML, so without JS (or with reduced motion) the number is simply shown.
// While the intro loader covers the page, counting waits for it to leave, so
// the hero's figures are seen counting rather than finishing unseen.
export function initCounters() {
  if (reducedMotion.matches) return;
  const els = [...document.querySelectorAll('[data-countup]')];
  if (!els.length) return;

  const run = (el, target) => {
    const start = performance.now();
    const duration = target > 100 ? 1600 : 1100;
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - p) ** 4;
      el.textContent = String(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(tick);
    };
    el.textContent = '0';
    requestAnimationFrame(tick);
  };

  const arm = () => {
    els.forEach((el) => {
      const target = Number(el.dataset.countup);
      if (!Number.isFinite(target)) return;
      onVisible(el, () => run(el, target), { threshold: 0.5 });
    });
  };

  els.forEach((el) => {
    window.addEventListener('beforeprint', () => { el.textContent = el.dataset.countup; });
  });

  if (document.documentElement.classList.contains('has-loader')) {
    // Hidden under the loader anyway: start from zero, count once it sweeps away
    els.forEach((el) => { el.textContent = '0'; });
    document.addEventListener('loader:exit', () => setTimeout(arm, 350), { once: true });
  } else {
    arm();
  }
}
