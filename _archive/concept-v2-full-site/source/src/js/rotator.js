import { reducedMotion, replay } from './util.js';

// Cycles the hero phrases from the live site. It runs two full rounds, pauses
// while the pointer is over the headline, and stops on the first phrase so
// the hero settles (WCAG 2.2.2). Reduced motion shows one phrase, no rotation.
export function initRotator() {
  const el = document.querySelector('[data-rotator]');
  if (!el) return;
  const items = [...el.querySelectorAll('.rotator__item')];
  const title = el.closest('h1');
  const INTERVAL = 3600;
  const MAX_STEPS = items.length * 2;

  // Phones and reduced motion: one phrase, no rotation, no reserved space
  if (reducedMotion.matches || !window.matchMedia('(min-width: 640px)').matches) {
    items.forEach((item, i) => item.classList.toggle('is-active', i === 0));
    el.classList.add('is-static');
    return;
  }

  el.style.setProperty('--rotate-ms', `${INTERVAL}ms`);
  let index = 0;
  let steps = 0;
  let timer = null;
  let onScreen = true;
  let hovering = false;
  // Hold the first phrase while the intro loader is up
  let waiting = document.documentElement.classList.contains('has-loader');
  if (waiting) {
    document.addEventListener('loader:exit', () => {
      waiting = false;
      setTimeout(start, 900);
    }, { once: true });
  }

  const advance = () => {
    const current = items[index];
    index = (index + 1) % items.length;
    current.classList.remove('is-active');
    current.classList.add('is-leaving');
    setTimeout(() => current.classList.remove('is-leaving'), 460);
    items[index].classList.add('is-active');
    steps += 1;
    if (steps >= MAX_STEPS) {
      stop();
      el.classList.remove('is-running');
      el.classList.add('is-done');
      return;
    }
    replay(el, 'is-running');
  };

  const stop = () => {
    clearInterval(timer);
    timer = null;
  };

  const start = () => {
    if (waiting || timer || steps >= MAX_STEPS || !onScreen || hovering || document.hidden) return;
    replay(el, 'is-running');
    timer = setInterval(advance, INTERVAL);
  };

  title.addEventListener('pointerenter', () => { hovering = true; stop(); el.classList.remove('is-running'); });
  title.addEventListener('pointerleave', () => { hovering = false; start(); });
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    if (onScreen) start();
    else stop();
  }).observe(el);
}
