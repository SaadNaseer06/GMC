// Highlights the in-page index link for the section being read
// (expertise sub-navigation, industries index).
export function initScrollSpy() {
  const links = [...document.querySelectorAll('[data-spy-link]')];
  if (!links.length || !('IntersectionObserver' in window)) return;
  const sections = links.map((l) => document.getElementById(l.dataset.spyLink)).filter(Boolean);
  const visible = new Set();

  const setActive = (id) => {
    links.forEach((l) => {
      const on = l.dataset.spyLink === id;
      l.classList.toggle('is-active', on);
      if (on) {
        l.setAttribute('aria-current', 'true');
        const list = l.closest('.subnav__list');
        if (list && list.scrollWidth > list.clientWidth) {
          list.scrollTo({ left: l.offsetLeft - 16, behavior: 'smooth' });
        }
      } else {
        l.removeAttribute('aria-current');
      }
    });
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
    const first = sections.find((s) => visible.has(s));
    if (first) setActive(first.id);
    else if (sections[0].getBoundingClientRect().top > window.innerHeight * 0.45) setActive(null);
  }, { rootMargin: '-35% 0px -55% 0px' });

  sections.forEach((s) => io.observe(s));

  // A jump back above the first section (e.g. "Back to top") crosses no
  // section, so the observer stays quiet: clear the highlight here.
  let frame;
  window.addEventListener('scroll', () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      if (sections[0].getBoundingClientRect().top > window.innerHeight * 0.45) setActive(null);
    });
  }, { passive: true });
}
