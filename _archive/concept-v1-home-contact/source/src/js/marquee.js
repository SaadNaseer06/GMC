export function initMarquee() {
  document.querySelectorAll('[data-marquee]').forEach((root) => {
    const btn = root.querySelector('[data-marquee-toggle]');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const paused = root.classList.toggle('is-paused');
      btn.setAttribute('aria-label', paused ? 'Play the list of brands' : 'Pause the list of brands');
    });
  });
}
