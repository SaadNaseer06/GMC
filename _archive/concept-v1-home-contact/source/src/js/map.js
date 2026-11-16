import { onVisible } from './util.js';

// Draws the office route once in view; pins, labels and office cards
// highlight each other on hover and keyboard focus.
export function initMap() {
  document.querySelectorAll('[data-map]').forEach((map) => {
    const section = map.closest('section') || document;
    onVisible(map, () => map.classList.add('is-drawn'), { threshold: 0.3 });

    const parts = (id) => [
      map.querySelector(`.map__pin[data-office="${id}"]`),
      map.querySelector(`.map__label[data-office="${id}"]`),
      section.querySelector(`.office[data-office="${id}"]`),
    ].filter(Boolean);

    const set = (id, on) => parts(id).forEach((el) => el.classList.toggle('is-active', on));

    section.querySelectorAll('.office[data-office], .map__label[data-office]').forEach((el) => {
      const id = el.dataset.office;
      el.addEventListener('pointerenter', () => set(id, true));
      el.addEventListener('pointerleave', () => set(id, false));
      el.addEventListener('focusin', () => set(id, true));
      el.addEventListener('focusout', () => set(id, false));
    });
  });
}
