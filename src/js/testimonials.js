import { reducedMotion } from './util.js';

// Tabbed testimonial slider. Tabs carry the company names and double as the
// progress indicator. Auto-rotation gives each quote time to be read (based on
// its length), pauses on hover, focus, off-screen and hidden tabs, has a
// visible pause button, and never starts with reduced motion.
export function initTestimonials() {
  document.querySelectorAll('[data-tslider]').forEach((root) => {
    const tabs = [...root.querySelectorAll('[role="tab"]')];
    const slides = tabs.map((t) => document.getElementById(t.getAttribute('aria-controls')));
    const tablist = root.querySelector('[role="tablist"]');
    const count = root.querySelector('[data-slide-count]');
    const toggle = root.querySelector('[data-toggle]');
    const durations = slides.map((s) => Math.max(8000, s.textContent.trim().split(/\s+/).length * 260));

    let index = 0;
    let timer = null;
    let userPaused = reducedMotion.matches;
    let hovering = false;
    let focusInside = false;
    let onScreen = false;

    slides.forEach((s) => { s.hidden = false; });

    const canPlay = () => !userPaused && !hovering && !focusInside && onScreen && !document.hidden;

    const sync = (restart = false) => {
      clearTimeout(timer);
      const play = canPlay();
      if (restart || !play) root.classList.remove('is-playing');
      if (play) {
        void root.offsetWidth;
        root.style.setProperty('--slide-ms', `${durations[index]}ms`);
        root.classList.add('is-playing');
        timer = setTimeout(() => show(index + 1), durations[index]);
      }
      root.classList.toggle('is-paused', userPaused);
      toggle.setAttribute('aria-label', userPaused ? 'Start automatic rotation' : 'Pause automatic rotation');
    };

    function show(i, { focus = false } = {}) {
      index = (i + tabs.length) % tabs.length;
      tabs.forEach((t, k) => {
        const on = k === index;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        slides[k].classList.toggle('is-active', on);
      });
      count.textContent = `${index + 1} / ${tabs.length}`;
      const tab = tabs[index];
      if (tablist.scrollWidth > tablist.clientWidth) {
        tablist.scrollTo({ left: tab.offsetLeft - 16, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
      }
      if (focus) tab.focus();
      sync(true);
    }

    tabs.forEach((tab, k) => {
      tab.addEventListener('click', () => show(k));
      tab.addEventListener('keydown', (e) => {
        const map = { ArrowRight: k + 1, ArrowLeft: k - 1, Home: 0, End: tabs.length - 1 };
        if (!(e.key in map)) return;
        e.preventDefault();
        show(map[e.key], { focus: true });
      });
    });

    root.querySelector('[data-prev]').addEventListener('click', () => show(index - 1));
    root.querySelector('[data-next]').addEventListener('click', () => show(index + 1));
    toggle.addEventListener('click', () => {
      userPaused = !userPaused;
      sync(true);
    });

    root.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { hovering = true; sync(); } });
    root.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') { hovering = false; sync(true); } });
    root.addEventListener('focusin', () => { focusInside = true; sync(); });
    root.addEventListener('focusout', (e) => {
      if (!root.contains(e.relatedTarget)) {
        focusInside = false;
        sync(true);
      }
    });
    document.addEventListener('visibilitychange', () => sync(true));
    new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      sync(true);
    }, { threshold: 0.35 }).observe(root);

    show(0);
  });
}
