// Build-time HTML renderers. Called from the HTML pages with
// <!-- @render name args --> through tools/vite-plugin-site.mjs.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  site, offices, serviceGroups, services, industries, testimonials, clients, briefNeeds, briefMarkets,
} from './data.mjs';

const read = (p) => JSON.parse(readFileSync(resolve(process.cwd(), p), 'utf8'));
const images = read('src/data/images.json');
const map = read('src/data/map.json');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const byId = (list, id) => list.find((x) => x.id === id);
const groupName = (id) => byId(serviceGroups, id).name;
const servicesIn = (group) => services.filter((s) => s.group === group);

const groupIntro = {
  quant: 'Statistically robust numbers, from consumer panels and online surveys to long-running brand and loyalty trackers.',
  qual: 'The whys behind what people buy, say and do.',
  ux: 'Digital products that people find intuitive and easy to use.',
  testing: 'Concepts, products, packs, ads and new car models, tested with the people who will buy them.',
  strategy: 'Evidence for where to play next: segments, markets and competitors.',
};

/** Responsive <img> for a processed photo (see tools/prep-images.mjs). */
export function picture(name, { alt = '', sizes = '100vw', cls = '', loading = 'lazy', priority = false } = {}) {
  const m = images[name];
  if (!m) throw new Error(`No processed image "${name}"`);
  const srcset = m.widths.map((w) => `/img/${name}-${w}.webp ${w}w`).join(', ');
  const fallback = m.widths[Math.min(1, m.widths.length - 1)];
  return `<img${cls ? ` class="${cls}"` : ''} src="/img/${name}-${fallback}.webp" srcset="${srcset}" sizes="${sizes}" width="${m.w}" height="${m.h}" alt="${esc(alt)}" loading="${priority ? 'eager' : loading}" decoding="async"${priority ? ' fetchpriority="high"' : ''}>`;
}

const officeCity = (o) => o.cityShort || o.city;
const mapsUrl = (o) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.maps)}`;

/* ------------------------------------------------------------------ header */

export function clockBar() {
  return offices
    .map((o) => `<li class="clock"><span class="clock__city">${esc(officeCity(o))}</span><time class="clock__time" data-clock="${o.tz}">--:--</time></li>`)
    .join('');
}

function megaFeature({ href, image, alt, title, text }) {
  return `<a class="mega__feature" href="${href}">
    <span class="mega__feature-media">${picture(image, { alt, sizes: '320px' })}</span>
    <span class="mega__feature-title">${esc(title)}</span>
    <span class="mega__feature-text">${esc(text)}</span>
  </a>`;
}

export function megaExpertise() {
  const cols = serviceGroups.map((g) => `
    <div class="mega__group">
      <p class="mega__group-name">${esc(g.name)}</p>
      <ul class="mega__links">${servicesIn(g.id).map((s) => `
        <li><a href="/#service-${s.id}"><span class="mega__link-title">${esc(s.title)}</span><span class="mega__link-text">${esc(s.short)}</span></a></li>`).join('')}
      </ul>
    </div>`).join('');
  return `<div class="container mega__inner">
    <div class="mega__intro">
      <p class="mega__title">Expertise</p>
      <p class="mega__text">Fourteen types of research projects, designed and delivered end to end.</p>
      <a class="link-arrow" href="/#expertise">All expertise <i data-icon="arrow-right"></i></a>
    </div>
    <div class="mega__groups">${cols}</div>
    ${megaFeature({ href: '/#service-car-clinics', image: 'car-clinic-hall', alt: 'Cars arranged for a car clinic', title: 'Car clinics', text: 'Run in Dubai and KSA for Land Rover, BMW, Mercedes, Rolls-Royce and Isuzu.' })}
  </div>`;
}

export function megaIndustries() {
  return `<div class="container mega__inner">
    <div class="mega__intro">
      <p class="mega__title">Industries</p>
      <p class="mega__text">Ten sectors, from automotive and hospitality to ministries and social research.</p>
      <a class="link-arrow" href="/#industries">All industries <i data-icon="arrow-right"></i></a>
    </div>
    <ul class="mega__links mega__links--cols">${industries.map((i) => `
      <li><a href="/#industry-${i.id}"><span class="mega__link-title">${esc(i.title)}</span></a></li>`).join('')}
    </ul>
    ${megaFeature({ href: '/#industry-government-public-sector', image: 'hospitality', alt: 'Guests being served at a café', title: 'Public sector and hospitality', text: 'Ministries in KSA, the UAE and Qatar, plus Emirates, Etihad Airways and dnata.' })}
  </div>`;
}

export function mobileNav() {
  const section = (id, title, links, all) => `
    <div class="mnav__section">
      <button class="mnav__toggle" aria-expanded="false" aria-controls="mnav-${id}">${title}<i data-icon="plus"></i></button>
      <ul class="mnav__sub" id="mnav-${id}" hidden>
        ${links}
        <li><a class="mnav__all" href="${all.href}">${all.label}</a></li>
      </ul>
    </div>`;
  return `<nav class="mnav" aria-label="Main">
    ${section('expertise', 'Expertise', services.map((s) => `<li><a href="/#service-${s.id}">${esc(s.title)}</a></li>`).join(''), { href: '/#expertise', label: 'All expertise' })}
    ${section('industries', 'Industries', industries.map((i) => `<li><a href="/#industry-${i.id}">${esc(i.title)}</a></li>`).join(''), { href: '/#industries', label: 'All industries' })}
    <a class="mnav__link" href="/#about" data-nav="about">About</a>
    <a class="mnav__link" href="/#testimonials">Testimonials</a>
    <a class="mnav__link" href="/contact/" data-nav="contact">Contact</a>
    <div class="mnav__foot">
      <p class="mnav__label">Local time in our offices</p>
      <ul class="mnav__clocks">${clockBar()}</ul>
      <a class="btn btn--primary btn--lg btn--block" href="/contact/">Get in touch</a>
    </div>
  </nav>`;
}

/* -------------------------------------------------------------------- hero */

export function heroBrief() {
  const needs = briefNeeds.map((n, i) => `
      <label class="choice">
        <input type="radio" name="need" value="${n.id}">
        <span class="choice__mark" aria-hidden="true"></span>
        <span class="choice__label">${esc(n.label)}</span>
        <kbd class="choice__key" aria-hidden="true">${i + 1}</kbd>
      </label>`).join('');
  const markets = briefMarkets.map((m) => `
      <label class="choice choice--check">
        <input type="checkbox" name="markets" value="${m.id}">
        <span class="choice__mark" aria-hidden="true"><i data-icon="check"></i></span>
        <span class="choice__label">${esc(m.label)}</span>
      </label>`).join('');
  return `<form class="brief" data-brief novalidate aria-labelledby="brief-title">
  <div class="brief__head">
    <p class="brief__title" id="brief-title">Plan a study</p>
    <p class="brief__progress" data-brief-progress>Question 1 of 2</p>
  </div>
  <div class="brief__bar" aria-hidden="true"><span data-brief-bar></span></div>
  <fieldset class="brief__step" data-step="1">
    <legend class="brief__q">What do you want to understand?</legend>
    <p class="brief__hint">Choose the closest one. You can also press 1 to 5.</p>
    <div class="choices">${needs}
    </div>
    <p class="brief__error" data-brief-error role="alert" hidden><i data-icon="circle-alert"></i>Choose one option to continue</p>
    <div class="brief__actions"><button type="button" class="btn btn--primary" data-brief-next>Next <i data-icon="arrow-right"></i></button></div>
  </fieldset>
  <fieldset class="brief__step" data-step="2" hidden>
    <legend class="brief__q">Where are your customers?</legend>
    <p class="brief__hint">Choose all that apply.</p>
    <div class="choices choices--grid">${markets}
    </div>
    <p class="brief__error" data-brief-error role="alert" hidden><i data-icon="circle-alert"></i>Choose at least one market</p>
    <div class="brief__actions">
      <button type="button" class="btn btn--quiet" data-brief-prev><i data-icon="arrow-left"></i>Back</button>
      <button type="submit" class="btn btn--primary">See your brief</button>
    </div>
  </fieldset>
  <div class="brief__result" data-step="3" hidden tabindex="-1">
    <p class="brief__q">Your brief</p>
    <dl class="brief__summary">
      <div><dt>To understand</dt><dd data-out="need"></dd></div>
      <div><dt>Markets</dt><dd data-out="markets"></dd></div>
      <div><dt>Studies we would suggest</dt><dd><ul class="brief__chips" data-out="services"></ul></dd></div>
      <div><dt>Nearest offices</dt><dd><ul class="brief__offices" data-out="offices"></ul></dd></div>
    </dl>
    <div class="brief__actions">
      <button type="button" class="btn btn--quiet" data-brief-restart><i data-icon="rotate-ccw"></i>Start again</button>
      <a class="btn btn--primary" data-brief-send href="/contact/">Send this brief <i data-icon="arrow-right"></i></a>
    </div>
  </div>
</form>`;
}

export function clientsMarquee() {
  const items = clients.map((c) => `<li>${esc(c)}</li>`).join('');
  return `<div class="marquee" data-marquee>
    <p class="marquee__label">Brands and institutions we have worked with</p>
    <div class="marquee__viewport">
      <ul class="marquee__track">${items}</ul>
      <ul class="marquee__track" aria-hidden="true">${items}</ul>
    </div>
    <button class="marquee__toggle icon-btn icon-btn--small" type="button" data-marquee-toggle aria-label="Pause the list of brands"><i data-icon="pause" class="i-pause"></i><i data-icon="play" class="i-play"></i></button>
  </div>`;
}

/* ---------------------------------------------------------------- why GMC */

export function timeZoneWidget() {
  const zones = [
    ['Europe/London', 'London'], ['Europe/Amsterdam', 'Amsterdam'], ['Europe/Zurich', 'Zurich'], ['Europe/Lisbon', 'Lisbon'],
    ['America/New_York', 'New York'], ['America/Chicago', 'Houston'], ['Asia/Qatar', 'Doha'], ['Asia/Dubai', 'Dubai'],
    ['Asia/Riyadh', 'Riyadh'], ['Africa/Cairo', 'Cairo'], ['Asia/Karachi', 'Karachi'], ['Asia/Singapore', 'Singapore'],
  ];
  const rows = offices.map((o) => `
      <li class="tz__row" data-tz-office="${o.id}" data-tz-zone="${o.tz}">
        <span class="tz__name">${esc(officeCity(o))}</span>
        <span class="tz__track"></span>
        <time class="tz__time" data-clock="${o.tz}">--:--</time>
      </li>`).join('');
  return `<div class="tz" data-tz>
    <div class="tz__head">
      <label class="tz__label" for="tz-select">Compare with</label>
      <div class="select">
        <select id="tz-select" data-tz-select>
          <option value="auto">Your time zone</option>
          ${zones.map(([z, n]) => `<option value="${z}">${n}</option>`).join('')}
        </select>
        <i data-icon="chevron-down"></i>
      </div>
    </div>
    <div class="tz__chart">
      <div class="tz__axis" aria-hidden="true"><span>00</span><span>06</span><span>12</span><span>18</span><span>24</span></div>
      <ul class="tz__rows" data-tz-rows>
        <li class="tz__row tz__row--you" data-tz-office="you">
          <span class="tz__name" data-tz-you>You</span>
          <span class="tz__track"></span>
          <time class="tz__time" data-tz-you-time>--:--</time>
        </li>${rows}
      </ul>
      <span class="tz__now" data-tz-now aria-hidden="true"></span>
    </div>
    <p class="tz__summary" data-tz-summary aria-live="polite">Office hours shown as 09:00 to 18:00 local time.</p>
  </div>`;
}

/* ----------------------------------------------------------- expertise */

function servicesExplorerMarkup({ shortFilters = false, showGroupOnTab = true } = {}) {
  const shortNames = {
    all: 'All',
    quant: 'Quant',
    qual: 'Qual',
    ux: 'UX',
    testing: 'Testing',
    strategy: 'Strategy',
  };
  const filters = [{ id: 'all', name: 'All' }, ...serviceGroups].map((g, i) => {
    const count = g.id === 'all' ? services.length : servicesIn(g.id).length;
    const label = shortFilters ? (shortNames[g.id] || g.name) : g.name;
    return `<button type="button" class="chip${i === 0 ? ' is-active' : ''}" aria-pressed="${i === 0}" data-filter="${g.id}">${esc(label)}<span class="chip__count">${count}</span></button>`;
  }).join('');
  const list = services.map((s, i) => `
      <li class="explorer__item" id="service-${s.id}" data-group="${s.group}" role="presentation">
        <button type="button" class="explorer__tab" role="tab" id="xtab-${s.id}" aria-controls="xpanel-${s.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-service="${s.id}">
          <span class="explorer__name">${esc(s.title)}</span>
          ${showGroupOnTab ? `<span class="explorer__group">${esc(groupName(s.group))}</span>` : ''}
          <i data-icon="arrow-right" class="explorer__arrow"></i>
        </button>
      </li>`).join('');
  const panels = services.map((s, i) => `
      <article class="explorer__panel${i === 0 ? ' is-active' : ''}" role="tabpanel" id="xpanel-${s.id}" aria-labelledby="xtab-${s.id}" tabindex="0"${i === 0 ? '' : ' hidden'}>
        <div class="explorer__media">${picture(s.image, { alt: s.alt, sizes: '(min-width: 1024px) 560px, 100vw' })}</div>
        <div class="explorer__text">
          <p class="explorer__panel-group">${esc(groupName(s.group))}</p>
          <h3 class="explorer__title">${esc(s.title)}</h3>
          <p class="explorer__desc">${esc(s.body)}</p>
          <ul class="tags">${s.methods.map((m) => `<li>${esc(m)}</li>`).join('')}</ul>
          <a class="link-arrow" href="/contact/?topic=${s.id}#contact-form">Talk to us about ${esc(s.title.charAt(0).toLowerCase() + s.title.slice(1))} <i data-icon="arrow-right"></i></a>
        </div>
      </article>`).join('');
  return `<div class="explorer" data-explorer>
    <div class="explorer__filters" role="group" aria-label="Filter research types">${filters}</div>
    <div class="explorer__body">
      <ul class="explorer__list" role="tablist" aria-orientation="vertical" aria-label="Research types">${list}
      </ul>
      <div class="explorer__stage" data-stage>${panels}
      </div>
    </div>
  </div>`;
}

export function servicesExplorer() {
  return servicesExplorerMarkup();
}

/** Lean home: short filter labels, name-only tabs (group shown in the preview panel). */
export function servicesExplorerLean() {
  return servicesExplorerMarkup({ shortFilters: true, showGroupOnTab: false });
}

export function expertiseIndex() {
  return serviceGroups.map((g) => `
    <li><a href="#group-${g.id}"><span>${esc(g.name)}</span><span class="page-index__count">${servicesIn(g.id).length}</span></a></li>`).join('');
}

export function expertiseSubnav() {
  return serviceGroups.map((g) => `<li><a href="#group-${g.id}" data-spy-link="group-${g.id}">${esc(g.name)}</a></li>`).join('');
}

export function expertiseGroups() {
  return serviceGroups.map((g, gi) => {
    const list = servicesIn(g.id);
    const cards = list.map((s) => `
        <article class="service" id="${s.id}">
          <div class="service__media">${picture(s.image, { alt: s.alt, sizes: list.length === 1 ? '(min-width: 1024px) 720px, 100vw' : '(min-width: 1024px) 600px, 100vw' })}</div>
          <div class="service__body">
            <h3 class="service__title">${esc(s.title)}</h3>
            <p>${esc(s.body)}</p>
            <ul class="tags">${s.methods.map((m) => `<li>${esc(m)}</li>`).join('')}</ul>
          </div>
        </article>`).join('');
    return `
  <section class="section xgroup${gi % 2 ? ' xgroup--mist' : ''}" id="group-${g.id}" aria-labelledby="group-${g.id}-title" data-spy-section>
    <div class="container">
      <div class="xgroup__head">
        <h2 class="h2" id="group-${g.id}-title">${esc(g.name)}</h2>
        <p class="lead">${esc(groupIntro[g.id])}</p>
      </div>
      <div class="xgroup__grid" data-items="${list.length}">${cards}
      </div>
    </div>
  </section>`;
  }).join('');
}

/* ----------------------------------------------------------- industries */

export function industriesCarousel() {
  return `<div class="carousel" data-carousel>
    <ul class="carousel__track" data-track tabindex="0" aria-label="Industries, scroll sideways for more">${industries.map((ind) => `
      <li class="ind-card" id="industry-${ind.id}">
        <button type="button" class="ind-card__link" data-industry="${ind.id}" aria-haspopup="dialog">
          <span class="ind-card__media">${picture(ind.image, { alt: ind.alt, sizes: '(min-width: 1024px) 340px, 80vw' })}</span>
          <span class="ind-card__title">${esc(ind.title)}</span>
          <span class="ind-card__text">${esc(ind.summary)}</span>
          <span class="ind-card__more">Read more<i data-icon="arrow-up-right"></i></span>
        </button>
      </li>`).join('')}
    </ul>
    <div class="carousel__foot">
      <div class="carousel__progress" aria-hidden="true"><span data-progress></span></div>
      <div class="carousel__buttons">
        <button type="button" class="icon-btn" data-prev aria-label="Previous industries"><i data-icon="arrow-left"></i></button>
        <button type="button" class="icon-btn" data-next aria-label="Next industries"><i data-icon="arrow-right"></i></button>
      </div>
    </div>
  </div>
  <dialog class="ind-dialog" data-ind-dialog aria-labelledby="ind-dialog-title" data-lenis-prevent>
    <button type="button" class="ind-dialog__close icon-btn" data-ind-close aria-label="Close"><i data-icon="x"></i></button>
    <div class="ind-dialog__media" data-ind-media></div>
    <div class="ind-dialog__body">
      <p class="ind-dialog__eyebrow">Industry</p>
      <h3 class="ind-dialog__title" id="ind-dialog-title" data-ind-title></h3>
      <p class="ind-dialog__text" data-ind-text></p>
      <ul class="tags" data-ind-tags></ul>
      <div class="ind-dialog__actions">
        <a class="btn btn--primary" data-ind-cta href="/contact/">Discuss a project <i data-icon="arrow-right"></i></a>
        <button type="button" class="btn btn--quiet" data-ind-close>Close</button>
      </div>
    </div>
  </dialog>`;
}

export function industriesIndex() {
  return industries.map((i) => `<li><a href="#${i.id}" data-spy-link="${i.id}">${esc(i.title)}</a></li>`).join('');
}

export function industriesDetail() {
  return industries.map((ind, i) => `
      <article class="industry" id="${ind.id}" data-spy-section>
        <div class="industry__media">${picture(ind.image, { alt: ind.alt, sizes: '(min-width: 1024px) 760px, 100vw', loading: i < 2 ? 'eager' : 'lazy' })}</div>
        <div class="industry__body">
          <h2 class="industry__title">${esc(ind.title)}</h2>
          <p>${esc(ind.body)}</p>
          <ul class="tags">${ind.highlights.map((h) => `<li>${esc(h)}</li>`).join('')}</ul>
        </div>
      </article>`).join('');
}

export function industriesMosaic() {
  return ['car-clinic-row', 'healthcare-lab', 'restaurant'].map((n, i) => {
    const ind = industries.find((x) => x.image === n);
    return `<figure class="mosaic__item mosaic__item--${i + 1}">${picture(n, { alt: ind.alt, sizes: '(min-width: 1024px) 420px, 50vw', priority: i === 0 })}<figcaption>${esc(ind.title)}</figcaption></figure>`;
  }).join('');
}

/* -------------------------------------------------------------- offices */

export function officeMap() {
  const pin = Object.fromEntries(map.pins.map((p) => [p.id, p]));
  // Arcs follow the offices from west to east, as one route.
  const route = ['usa', 'egypt', 'ksa', 'uae', 'pakistan'];
  const arcs = route.slice(1).map((id, i) => {
    const a = pin[route[i]], b = pin[id];
    const dx = b.x - a.x;
    const lift = Math.max(3, Math.min(22, Math.abs(dx) * 0.22));
    const cx = (a.x + b.x) / 2, cy = Math.min(a.y, b.y) - lift;
    return `<path class="map__arc" d="M${a.x} ${a.y}Q${cx.toFixed(2)} ${cy.toFixed(2)} ${b.x} ${b.y}" pathLength="1"/>`;
  }).join('');
  const pins = offices.map((o) => {
    const p = pin[o.id];
    return `<g class="map__pin" data-office="${o.id}" transform="translate(${p.x} ${p.y})"><circle class="map__ring" r="2.2"/><circle class="map__dot" r=".85"/></g>`;
  }).join('');
  const labels = offices.map((o) => {
    const p = pin[o.id];
    return `<span class="map__label map__label--${o.id}" data-office="${o.id}" style="left:${((p.x / map.width) * 100).toFixed(2)}%;top:${((p.y / map.height) * 100).toFixed(2)}%"><span class="map__city">${esc(officeCity(o))}</span><time class="map__time" data-clock="${o.tz}">--:--</time></span>`;
  }).join('');
  return `<div class="map__canvas" style="aspect-ratio:${map.width} / ${map.height}">
      <img class="map__dots" src="/img/world-dots.svg" alt="" width="${map.width * 8}" height="${map.height * 8}" loading="lazy" decoding="async">
      <svg class="map__overlay" viewBox="0 0 ${map.width} ${map.height}" aria-hidden="true" focusable="false">${arcs}${pins}</svg>
      <div class="map__labels" aria-hidden="true">${labels}</div>
    </div>`;
}

export function officeList() {
  return offices.map((o) => `
    <li class="office" data-office="${o.id}">
      <p class="office__country">${esc(o.country)}</p>
      <p class="office__city">${esc(o.city)}</p>
      <p class="office__now"><i data-icon="clock"></i><time data-clock="${o.tz}">--:--</time><span class="office__suffix">local time</span></p>
      <address class="office__address">${o.address.map(esc).join('<br>')}</address>
      <a class="link-quiet" href="${mapsUrl(o)}" target="_blank" rel="noopener">Open in Maps<i data-icon="arrow-up-right"></i><span class="sr-only"> (opens in a new tab)</span></a>
    </li>`).join('');
}

export function clockList() {
  return offices.map((o) => `
    <li class="clocks-list__item"><span class="clocks-list__city">${esc(officeCity(o))}, ${esc(o.short)}</span><time class="clocks-list__time" data-clock="${o.tz}">--:--</time></li>`).join('');
}

/* ---------------------------------------------------------- testimonials */

export function testimonialsSlider() {
  const tabs = testimonials.map((t, i) => `
      <button type="button" class="tslider__tab" role="tab" id="ttab-${t.id}" aria-controls="tpanel-${t.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">
        <span class="tslider__org">${esc(t.org)}</span>
        <span class="tslider__fill" aria-hidden="true"></span>
      </button>`).join('');
  const slides = testimonials.map((t, i) => `
      <figure class="tslider__slide${i === 0 ? ' is-active' : ''}${t.quote.split(/\s+/).length > 64 ? ' tslider__slide--long' : ''}" role="tabpanel" id="tpanel-${t.id}" aria-labelledby="ttab-${t.id}" aria-roledescription="slide" aria-label="${i + 1} of ${testimonials.length}"${i === 0 ? '' : ' hidden'}>
        <blockquote class="tslider__quote"><p>${esc(t.quote)}</p></blockquote>
        <figcaption class="tslider__cite">
          <span class="tslider__name">${esc(t.name)}</span>
          <span class="tslider__role">${esc(t.role)}, ${esc(t.place)}</span>
        </figcaption>
      </figure>`).join('');
  return `<div class="tslider" data-tslider aria-roledescription="carousel" aria-label="Client testimonials">
    <div class="tslider__tabs" role="tablist" aria-label="Choose a testimonial">${tabs}
    </div>
    <div class="tslider__stage">${slides}
    </div>
    <div class="tslider__controls">
      <button type="button" class="icon-btn" data-prev aria-label="Previous testimonial"><i data-icon="arrow-left"></i></button>
      <button type="button" class="icon-btn" data-next aria-label="Next testimonial"><i data-icon="arrow-right"></i></button>
      <button type="button" class="icon-btn" data-toggle aria-label="Pause automatic rotation"><i data-icon="pause" class="i-pause"></i><i data-icon="play" class="i-play"></i></button>
      <p class="tslider__count" data-slide-count aria-hidden="true">1 / ${testimonials.length}</p>
    </div>
  </div>`;
}

/* ------------------------------------------------------------------ form */

export function topicOptions() {
  return serviceGroups.map((g) => `
        <optgroup label="${esc(g.name)}">${servicesIn(g.id).map((s) => `<option value="${s.id}">${esc(s.title)}</option>`).join('')}</optgroup>`).join('');
}

/* ---------------------------------------------------------------- footer */

export function footerColumns() {
  const col = (title, links) => `
      <div class="footer__col">
        <p class="footer__heading">${title}</p>
        <ul>${links.map(([href, label]) => `<li><a href="${href}">${esc(label)}</a></li>`).join('')}</ul>
      </div>`;
  const pick = (ids) => ids.map((id) => byId(services, id));
  return [
    col('Expertise', [
      ...pick(['quantitative-research', 'qualitative-research', 'ui-ux-research', 'brand-health-tracking', 'car-clinics', 'market-feasibility-entry-strategy'])
        .map((s) => [`/#service-${s.id}`, s.title.replace(', trend analysis and entry strategy', ' and entry strategy')]),
      ['/#expertise', 'All expertise'],
    ]),
    col('Industries', [
      ...['automotive', 'government-public-sector', 'hospitality', 'healthcare', 'finance-banking', 'qsr']
        .map((id) => byId(industries, id)).map((i) => [`/#industry-${i.id}`, i.title]),
      ['/#industries', 'All industries'],
    ]),
    col('Company', [['/#about', 'About GMC'], ['/#testimonials', 'Testimonials'], ['/contact/', 'Contact'], [site.linkedin, 'LinkedIn']]),
    `
      <div class="footer__col footer__col--offices">
        <p class="footer__heading">Offices</p>
        <ul class="footer__offices">${offices.map((o) => `<li><span class="footer__office-city">${esc(officeCity(o))}</span><span class="footer__office-country">${esc(o.country)}</span></li>`).join('')}</ul>
      </div>`,
  ].join('');
}

export const year = () => String(new Date().getFullYear());
