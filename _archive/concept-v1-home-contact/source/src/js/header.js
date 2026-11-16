import { finePointer, desktop } from './util.js';

export function initHeader() {
  const header = document.querySelector('[data-header]');
  if (!header) return;
  const root = document.documentElement;
  const scrim = header.querySelector('[data-scrim]');

  /* ---------- compact / hide on scroll ---------- */
  let lastY = window.scrollY;
  let ticking = false;
  const setVisible = () => {
    const compact = header.classList.contains('is-compact');
    const hidden = header.classList.contains('is-hidden') && !header.classList.contains('is-open');
    root.style.setProperty('--header-visible', hidden ? '0px' : compact ? 'var(--nav-h-compact)' : 'var(--header-h)');
  };
  const onScroll = () => {
    const y = Math.max(0, window.scrollY);
    const dy = y - lastY;
    header.classList.toggle('is-compact', y > 8);
    if (openMega || header.classList.contains('is-open')) {
      header.classList.remove('is-hidden');
    } else if (y > 240 && dy > 6) {
      header.classList.add('is-hidden');
    } else if (dy < -6 || y <= 240) {
      header.classList.remove('is-hidden');
    }
    lastY = y;
    setVisible();
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onScroll);
    }
  }, { passive: true });
  header.addEventListener('focusin', () => {
    header.classList.remove('is-hidden');
    setVisible();
  });

  /* ---------- mega menus ---------- */
  const triggers = [...header.querySelectorAll('.nav__trigger')];
  let openMega = null;
  let hoverTimer;

  const panelOf = (btn) => document.getElementById(btn.getAttribute('aria-controls'));

  function closeMega({ focus = false } = {}) {
    if (!openMega) return;
    const btn = openMega;
    btn.setAttribute('aria-expanded', 'false');
    panelOf(btn).hidden = true;
    scrim.hidden = true;
    openMega = null;
    if (focus) btn.focus();
  }

  function openMenu(btn) {
    if (openMega === btn) return;
    closeMega();
    btn.setAttribute('aria-expanded', 'true');
    const panel = panelOf(btn);
    panel.hidden = false;
    panel.classList.remove('is-entering');
    void panel.offsetWidth;
    panel.classList.add('is-entering');
    scrim.hidden = false;
    openMega = btn;
    header.classList.remove('is-hidden');
    setVisible();
  }

  triggers.forEach((btn) => {
    const item = btn.closest('.nav__item');
    btn.addEventListener('click', () => (openMega === btn ? closeMega() : openMenu(btn)));
    item.addEventListener('pointerenter', (e) => {
      if (e.pointerType !== 'mouse' || !finePointer.matches) return;
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(() => openMenu(btn), openMega ? 0 : 120);
    });
    item.addEventListener('pointerleave', (e) => {
      if (e.pointerType !== 'mouse') return;
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(() => { if (openMega === btn) closeMega(); }, 220);
    });
    item.addEventListener('focusout', (e) => {
      if (openMega === btn && !item.contains(e.relatedTarget)) closeMega();
    });
  });

  scrim.addEventListener('click', () => closeMega());
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (openMega) closeMega({ focus: true });
    if (header.classList.contains('is-open')) closeMobile({ focus: true });
  });
  document.addEventListener('click', (e) => {
    if (openMega && !openMega.closest('.nav__item').contains(e.target)) closeMega();
  });

  /* ---------- mobile menu ---------- */
  const toggle = header.querySelector('.menu-toggle');
  const mobile = document.getElementById('mobile-nav');

  function openMobile() {
    mobile.hidden = false;
    header.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');
    document.body.classList.add('is-locked');
    window.__lenis?.stop();
  }

  function closeMobile({ focus = false } = {}) {
    mobile.hidden = true;
    header.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    document.body.classList.remove('is-locked');
    window.__lenis?.start();
    if (focus) toggle.focus();
  }

  toggle.addEventListener('click', () => (header.classList.contains('is-open') ? closeMobile() : openMobile()));

  mobile.querySelectorAll('.mnav__toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const sub = document.getElementById(btn.getAttribute('aria-controls'));
      const open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      sub.hidden = !open;
    });
  });

  mobile.addEventListener('click', (e) => {
    if (e.target.closest('a')) closeMobile();
  });

  desktop.addEventListener('change', (e) => {
    if (e.matches) closeMobile();
    else closeMega();
  });

  onScroll();
}
