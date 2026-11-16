// Interactions for the live-site layout (version 3):
//   hero slideshow, banner parallax and word reveal, scroll reveals,
//   and the research-type filter on the home and expertise pages.
import { reducedMotion, finePointer, onVisible } from './util.js';

const afterLoader = (fn) => {
  if (document.documentElement.classList.contains('has-loader')) {
    document.addEventListener('loader:exit', fn, { once: true });
  } else {
    fn();
  }
};

/* ------------------------------------------------------------ slideshow */
export function initHeroSlides() {
  const hero = document.querySelector('[data-vhero]');
  if (!hero) return;
  const slides = [...hero.querySelectorAll('[data-slide]')];
  const dots = [...hero.querySelectorAll('[data-slide-to]')];
  const toggle = hero.querySelector('[data-slides-toggle]');
  const INTERVAL = 6500;
  let index = 0;
  let timer = null;
  let paused = reducedMotion.matches;
  let onScreen = true;

  hero.style.setProperty('--slide-ms', `${INTERVAL}ms`);

  const show = (n) => {
    index = (n + slides.length) % slides.length;
    slides.forEach((s, i) => s.classList.toggle('is-active', i === index));
    dots.forEach((d, i) => {
      d.classList.toggle('is-active', i === index);
      if (i === index) d.setAttribute('aria-current', 'true');
      else d.removeAttribute('aria-current');
    });
    // restart the progress bar on the active dot
    const bar = dots[index]?.querySelector('.vhero__dot-bar span');
    if (bar) {
      bar.style.animation = 'none';
      void bar.offsetWidth;
      bar.style.animation = '';
    }
  };

  const stop = () => {
    clearInterval(timer);
    timer = null;
  };
  const start = () => {
    stop();
    if (paused || !onScreen || document.hidden) return;
    timer = setInterval(() => show(index + 1), INTERVAL);
  };
  const setPaused = (p) => {
    paused = p;
    hero.classList.toggle('is-paused', p);
    toggle?.setAttribute('aria-label', p ? 'Play the slideshow' : 'Pause the slideshow');
    if (p) stop();
    else start();
  };

  dots.forEach((d) => d.addEventListener('click', () => {
    show(Number(d.dataset.slideTo));
    start();
  }));
  toggle?.addEventListener('click', () => setPaused(!paused));
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      if (onScreen) start();
      else stop();
    }).observe(hero);
  }

  hero.classList.toggle('is-paused', paused);
  if (paused) toggle?.setAttribute('aria-label', 'Play the slideshow');
  // Hold the first photo while the intro loader is up
  hero.classList.add('is-waiting');
  afterLoader(() => {
    hero.classList.remove('is-waiting');
    show(0);
    start();
  });
}

/* --------------------------------------------- banner, reveals, parallax */
export function initReveals() {
  const els = document.querySelectorAll('[data-reveal], [data-words]');
  if (!els.length) return;
  if (reducedMotion.matches || !('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-in'));
    return;
  }
  document.documentElement.classList.add('has-reveal');
  els.forEach((el) => onVisible(el, () => el.classList.add('is-in'), { threshold: 0.18 }));
}

export function initParallax() {
  const layers = [...document.querySelectorAll('[data-parallax]')];
  if (!layers.length || reducedMotion.matches) return;
  let frame = 0;
  const update = () => {
    frame = 0;
    const vh = window.innerHeight;
    layers.forEach((el) => {
      const box = el.parentElement.getBoundingClientRect();
      if (box.bottom < 0 || box.top > vh) return;
      // -1 when the band enters at the bottom, +1 when it leaves at the top
      const p = (box.top + box.height / 2 - vh / 2) / (vh / 2 + box.height / 2);
      el.style.transform = `translate3d(0, ${(p * 9).toFixed(2)}%, 0) scale(1.18)`;
    });
  };
  const queue = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', queue);
  update();
}

/* ---------------------------------------------------- research filter */
export function initResearchFilter() {
  document.querySelectorAll('.vfilter').forEach((group) => {
    const scope = group.closest('section');
    const list = scope?.querySelector('[data-vlist]');
    if (!list) return;
    const chips = [...group.querySelectorAll('[data-vfilter]')];
    const items = [...list.querySelectorAll('[data-vgroup]')];
    const status = scope.querySelector('[data-vcount]');
    chips.forEach((chip) => chip.addEventListener('click', () => {
      const f = chip.dataset.vfilter;
      let shown = 0;
      items.forEach((it) => {
        const on = f === 'all' || it.dataset.vgroup === f;
        const was = !it.hidden;
        it.hidden = !on;
        if (on) {
          shown += 1;
          if (!was && !reducedMotion.matches) {
            it.classList.remove('is-entering');
            void it.offsetWidth;
            it.classList.add('is-entering');
          }
        }
      });
      chips.forEach((c) => {
        const on = c === chip;
        c.classList.toggle('is-active', on);
        c.setAttribute('aria-pressed', String(on));
      });
      if (status) status.textContent = `Showing ${shown} of ${items.length} research types`;
      window.__lenis?.resize?.();
    }));
  });
}

/* ------------------------------------------- statement: scroll-lit words */
// Splits the text into words (keeping the teal <em> phrases) and lights them
// one by one as the block scrolls up through the viewport.
export function initScrubText() {
  const blocks = [...document.querySelectorAll('[data-scrub]')];
  if (!blocks.length) return;
  const words = new Map();
  blocks.forEach((block) => {
    const list = [];
    const wrap = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) {
              frag.append(part);
              return;
            }
            const span = document.createElement('span');
            span.className = 'sw';
            span.textContent = part;
            list.push(span);
            frag.append(span);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          wrap(child);
        }
      });
    };
    wrap(block);
    words.set(block, list);
    block.classList.add('is-scrub');
  });

  if (reducedMotion.matches) {
    words.forEach((list) => list.forEach((w) => w.classList.add('is-lit')));
    return;
  }
  let frame = 0;
  const update = () => {
    frame = 0;
    const vh = window.innerHeight;
    words.forEach((list, block) => {
      const r = block.getBoundingClientRect();
      // Starts as the block's top reaches 85% of the viewport; fully lit by
      // the time it sits in the upper third, so it reads in one pass
      const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height * 0.8 + vh * 0.15)));
      const lit = Math.round(p * list.length);
      list.forEach((w, i) => w.classList.toggle('is-lit', i < lit));
    });
  };
  const queue = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', queue);
  update();
}

/* --------------------------------------- offices: day/night and a tour */
const hourIn = (tz) => Number(new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: 'numeric', hourCycle: 'h23' }).format(new Date()));
const daypart = (h) => (h >= 5 && h < 12 ? 'morning' : h >= 12 && h < 17 ? 'afternoon' : h >= 17 && h < 21 ? 'evening' : 'night');

export function initOffices() {
  const cards = [...document.querySelectorAll('[data-office-card]')];
  if (!cards.length) return;

  // Sun or moon, and the part of the day, at each office
  const paint = () => cards.forEach((card) => {
    const h = hourIn(card.dataset.officeTz);
    // sun by day, sunset in the evening, moon at night
    card.dataset.phase = h >= 6 && h < 17 ? 'day' : h >= 17 && h < 20 ? 'dusk' : 'night';
    const when = card.querySelector('[data-daypart]');
    if (when) when.textContent = daypart(h);
  });
  paint();
  document.addEventListener('clocks:tick', paint);

  // While the map is on screen and nobody is pointing at it, it visits each
  // office in turn: the pin pulses and its label and card light up.
  const map = document.querySelector('[data-map-tour]');
  if (!map || reducedMotion.matches) return;
  const section = map.closest('section');
  const ids = cards.map((c) => c.dataset.office);
  const parts = (id) => section.querySelectorAll(`.map__pin[data-office="${id}"], .map__label[data-office="${id}"], [data-office-card][data-office="${id}"]`);
  let i = -1;
  let timer = null;
  let current = null;
  const clear = () => {
    if (current) parts(current).forEach((el) => el.classList.remove('is-active'));
    current = null;
  };
  const step = () => {
    clear();
    i = (i + 1) % ids.length;
    current = ids[i];
    parts(current).forEach((el) => el.classList.add('is-active'));
  };
  const start = () => {
    if (timer) return;
    step();
    timer = setInterval(step, 2600);
  };
  const stop = () => {
    clearInterval(timer);
    timer = null;
    clear();
  };
  let inView = false;
  let pointing = false;
  new IntersectionObserver(([e]) => {
    inView = e.isIntersecting;
    if (inView && !pointing) start();
    else stop();
  }, { threshold: 0.35 }).observe(map);
  section.addEventListener('pointerenter', () => { pointing = true; stop(); });
  section.addEventListener('pointerleave', () => { pointing = false; if (inView) start(); });
  section.addEventListener('focusin', () => { pointing = true; stop(); });
  section.addEventListener('focusout', () => { pointing = false; if (inView) start(); });
}

/* ------------------------------------- research index: open + hover peek */
export function initResearchList() {
  const wrap = document.querySelector('[data-rlist]');
  if (!wrap) return;
  const items = [...wrap.querySelectorAll('.vitem')];
  const peek = wrap.querySelector('.vpeek');

  const setOpen = (item, open) => {
    item.classList.toggle('is-open', open);
    item.querySelector('.vitem__head').setAttribute('aria-expanded', String(open));
    item.querySelector('.vitem__panel').inert = !open;
  };
  const openOnly = (item) => items.forEach((i) => setOpen(i, i === item));

  items.forEach((item) => {
    item.querySelector('.vitem__head').addEventListener('click', () => {
      if (item.classList.contains('is-open')) setOpen(item, false);
      else openOnly(item);
      peek?.classList.remove('is-on');
      window.__lenis?.resize?.();
    });
  });

  // Links to #service-<id> (the Expertise menu, old links) open that row
  const fromHash = () => {
    const m = location.hash.match(/^#service-(.+)$/);
    const item = m && items.find((i) => i.dataset.id === m[1]);
    if (item) openOnly(item);
  };
  window.addEventListener('hashchange', fromHash);
  fromHash();

  // Desktop: a photo of the hovered study follows the pointer
  if (!peek || !finePointer.matches || reducedMotion.matches) return;
  let frame = 0;
  let x = 0;
  let y = 0;
  wrap.addEventListener('pointermove', (e) => {
    const r = wrap.getBoundingClientRect();
    x = e.clientX - r.left;
    y = e.clientY - r.top;
    if (!frame) {
      frame = requestAnimationFrame(() => {
        frame = 0;
        peek.style.transform = `translate3d(${Math.round(x + 32)}px, ${Math.round(y)}px, 0) translateY(-50%)`;
      });
    }
  });
  items.forEach((item) => {
    const head = item.querySelector('.vitem__head');
    head.addEventListener('pointerenter', () => {
      if (item.classList.contains('is-open')) return;
      peek.querySelectorAll('[data-peek]').forEach((img) => img.classList.toggle('is-on', img.dataset.peek === item.dataset.id));
      peek.classList.add('is-on');
    });
    head.addEventListener('pointerleave', () => peek.classList.remove('is-on'));
  });
}
