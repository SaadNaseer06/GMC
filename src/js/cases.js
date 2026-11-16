// Case studies page: filter the stories by the kind of research they used.
// Deep links (#car-clinics) always land on their case, even under a filter.
import { reducedMotion, scrollPaddingTop, replay } from './util.js';

export function initCaseFilter() {
  const bar = document.querySelector('[data-case-filters]');
  const list = document.querySelector('[data-case-list]');
  if (!bar || !list) return;

  const chips = [...bar.querySelectorAll('[data-case-filter]')];
  const cases = [...list.querySelectorAll('[data-case]')];
  const count = bar.querySelector('[data-case-count]');

  const apply = (filter, { scroll = false } = {}) => {
    const visible = cases.filter((c) => filter === 'all' || c.dataset.groups.split(' ').includes(filter));
    const shown = visible.length;
    cases.forEach((c) => {
      const on = visible.includes(c);
      const changed = c.hidden === on;
      c.hidden = !on;
      c.classList.toggle('is-last', c === visible[shown - 1]);
      if (on && changed) replay(c, 'is-entering');
    });
    chips.forEach((chip) => {
      const on = chip.dataset.caseFilter === filter;
      chip.classList.toggle('is-active', on);
      chip.setAttribute('aria-pressed', String(on));
    });
    count.textContent = filter === 'all'
      ? `Showing all ${cases.length} case studies`
      : `Showing ${shown} of ${cases.length} case studies`;
    window.__lenis?.resize?.();
    if (scroll) {
      const top = list.getBoundingClientRect().top + window.scrollY - scrollPaddingTop();
      if (window.scrollY > top) {
        const smooth = !reducedMotion.matches;
        if (window.__lenis && smooth) window.__lenis.scrollTo(top, { duration: 0.8 });
        else window.scrollTo({ top, behavior: smooth ? 'smooth' : 'auto' });
      }
    }
  };

  chips.forEach((chip) => chip.addEventListener('click', () => apply(chip.dataset.caseFilter, { scroll: true })));

  // A link to a case that the current filter hides clears the filter first
  const reveal = () => {
    const target = cases.find((c) => `#${c.id}` === location.hash);
    if (target?.hidden) apply('all');
  };
  window.addEventListener('hashchange', reveal);
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (a && cases.some((c) => `#${c.id}` === a.getAttribute('href') && c.hidden)) apply('all');
  }, true);
  reveal();
}
