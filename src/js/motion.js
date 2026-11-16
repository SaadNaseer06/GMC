import Lenis from 'lenis';
import { gsap } from 'gsap';
import { reducedMotion, finePointer, onVisible, scrollPaddingTop } from './util.js';

// The ScrollTrigger plugin is only needed for scroll-linked moments (the
// process line on the Expertise page), so it loads on demand there instead of
// adding ~30 KB to every page.
let scrollTrigger = null;

// One orchestrated entrance per page, smooth wheel scrolling on desktop,
// and a few scroll moments that explain something (cost bars, process line).
export function initMotion() {
  const reduce = reducedMotion.matches;

  /* ---------- smooth scrolling (mouse and trackpad only) ---------- */
  let lenis = null;
  if (!reduce && finePointer.matches) {
    lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 0.95, autoRaf: false });
    lenis.on('scroll', () => scrollTrigger?.update());
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    window.__lenis = lenis;
  }

  /* ---------- in-page anchors honour the sticky header ---------- */
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href*="#"]');
    if (!link || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const url = new URL(link.href, window.location.href);
    if (url.pathname !== window.location.pathname || url.search !== window.location.search) return;
    const id = decodeURIComponent(url.hash.slice(1));
    const target = id === 'top' ? document.body : document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const offset = id === 'top' ? 0 : -scrollPaddingTop();
    // Lenis already subtracts the root's scroll-padding-top for element targets
    if (lenis) lenis.scrollTo(target, { duration: 1.1 });
    else window.scrollTo({ top: id === 'top' ? 0 : target.getBoundingClientRect().top + window.scrollY + offset, behavior: reduce ? 'auto' : 'smooth' });
    const oldURL = window.location.href;
    history.pushState(null, '', url.hash);
    // pushState does not fire hashchange; announce it so modules can react
    // (the explorer selects /#service-…, the industry panel opens /#industry-…)
    window.dispatchEvent(new HashChangeEvent('hashchange', { oldURL, newURL: window.location.href }));
    if (id !== 'top') {
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }
  });

  /* ---------- page entrance ---------- */
  const intro = gsap.utils.toArray('[data-hero-in]');
  const brief = document.querySelector('[data-hero-brief]');
  if (!reduce && intro.length) {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo(intro, { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, stagger: 0.09, clearProps: 'transform' });
    if (brief) tl.fromTo(brief, { y: 36, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, clearProps: 'transform' }, 0.2);
    // With the intro loader up, play the entrance as its edge sweeps away
    if (document.documentElement.classList.contains('has-loader')) {
      tl.pause();
      document.addEventListener('loader:exit', () => gsap.delayedCall(0.18, () => tl.play()), { once: true });
    }
  } else {
    gsap.set([...intro, brief].filter(Boolean), { opacity: 1 });
  }

  /* ---------- scroll moments ---------- */
  document.querySelectorAll('[data-cost]').forEach((el) => onVisible(el, () => el.classList.add('is-shown'), { threshold: 0.6 }));

  const steps = document.querySelector('.steps');
  if (steps && !reduce) {
    const line = document.createElement('span');
    line.className = 'steps__progress';
    line.setAttribute('aria-hidden', 'true');
    steps.prepend(line);
    import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
      gsap.registerPlugin(ScrollTrigger);
      scrollTrigger = ScrollTrigger;
      gsap.fromTo(line, { scaleX: 0 }, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: { trigger: steps, start: 'top 80%', end: 'bottom 55%', scrub: 0.6 },
      });
      if (document.readyState === 'complete') ScrollTrigger.refresh();
      else window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
    });
  }
  return lenis;
}
