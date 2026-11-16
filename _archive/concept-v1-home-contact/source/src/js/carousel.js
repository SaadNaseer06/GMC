import { reducedMotion } from './util.js';

// Native scroll-snap track with buttons, a progress bar and mouse drag.
export function initCarousel() {
  document.querySelectorAll('[data-carousel]').forEach((root) => {
    const track = root.querySelector('[data-track]');
    const prev = root.querySelector('[data-prev]');
    const next = root.querySelector('[data-next]');
    const bar = root.querySelector('[data-progress]');
    const behavior = reducedMotion.matches ? 'auto' : 'smooth';

    const step = () => {
      const card = track.querySelector('li');
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return card ? card.getBoundingClientRect().width + gap : track.clientWidth * 0.8;
    };

    const update = () => {
      const max = track.scrollWidth - track.clientWidth;
      const pos = max > 0 ? track.scrollLeft / max : 0;
      const size = Math.min(1, track.clientWidth / track.scrollWidth);
      bar.style.setProperty('--pos', pos.toFixed(4));
      bar.style.setProperty('--size', size.toFixed(4));
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= max - 2;
    };

    prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior }));
    next.addEventListener('click', () => track.scrollBy({ left: step(), behavior }));

    let frame;
    track.addEventListener('scroll', () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    }, { passive: true });
    new ResizeObserver(update).observe(track);

    // Drag to scroll with a mouse; touch and trackpads scroll natively
    let down = false;
    let moved = false;
    let startX = 0;
    let startLeft = 0;
    track.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true;
      moved = false;
      startX = e.clientX;
      startLeft = track.scrollLeft;
    });
    window.addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 6) {
        moved = true;
        track.classList.add('is-dragging');
      }
      if (moved) track.scrollLeft = startLeft - dx;
    });
    window.addEventListener('pointerup', () => {
      if (!down) return;
      down = false;
      if (!moved) return;
      track.classList.remove('is-dragging');
      const s = step();
      track.scrollTo({ left: Math.round(track.scrollLeft / s) * s, behavior });
      setTimeout(() => { moved = false; }, 0);
    });
    track.addEventListener('click', (e) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);
    track.addEventListener('dragstart', (e) => e.preventDefault());

    update();
  });
}
