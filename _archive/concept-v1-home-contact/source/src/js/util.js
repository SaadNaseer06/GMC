export const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
export const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
export const desktop = window.matchMedia('(min-width: 1024px)');

/** Run cb once, the first time el is at least `threshold` visible. */
export function onVisible(el, cb, { threshold = 0.25, rootMargin = '0px' } = {}) {
  if (!('IntersectionObserver' in window)) {
    cb(el);
    return;
  }
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        io.disconnect();
        cb(el);
      }
    }
  }, { threshold, rootMargin });
  io.observe(el);
}

/** Restart a CSS animation by toggling a class across a reflow. */
export function replay(el, cls) {
  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
}

export function scrollPaddingTop() {
  return parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
}
