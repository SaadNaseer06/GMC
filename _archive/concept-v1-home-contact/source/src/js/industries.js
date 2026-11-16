// Industry detail panel on the home page. Each carousel card opens a native
// <dialog> with the full write-up from the content data, so the homepage
// concept carries the industries content without a separate page.
// /#industry-<id> (mega menu, footer, other pages) opens it directly.
import { industries } from '../content/data.mjs';

export function initIndustryDialog() {
  const dialog = document.querySelector('[data-ind-dialog]');
  if (!dialog) return;
  const cards = [...document.querySelectorAll('[data-industry]')];
  const media = dialog.querySelector('[data-ind-media]');
  const title = dialog.querySelector('[data-ind-title]');
  const text = dialog.querySelector('[data-ind-text]');
  const tags = dialog.querySelector('[data-ind-tags]');
  const cta = dialog.querySelector('[data-ind-cta]');
  const ctaLabel = cta.firstChild;

  const fill = (ind, card) => {
    title.textContent = ind.title;
    text.textContent = ind.body;
    tags.replaceChildren(...ind.highlights.map((h) => Object.assign(document.createElement('li'), { textContent: h })));
    cta.href = `/contact/?industry=${ind.id}#contact-form`;
    ctaLabel.textContent = 'Discuss a project ';
    // reuse the card's photograph (already loaded, same responsive sources)
    const img = card?.querySelector('img');
    media.replaceChildren();
    if (img) {
      const copy = img.cloneNode();
      copy.loading = 'eager';
      copy.sizes = '(min-width: 760px) 720px, 100vw';
      media.append(copy);
    }
  };

  const open = (id) => {
    const ind = industries.find((i) => i.id === id);
    if (!ind) return;
    fill(ind, cards.find((c) => c.dataset.industry === id));
    if (!dialog.open) dialog.showModal();
    window.__lenis?.stop();
  };

  cards.forEach((card) => card.addEventListener('click', () => open(card.dataset.industry)));
  dialog.querySelectorAll('[data-ind-close]').forEach((b) => b.addEventListener('click', () => dialog.close()));
  // A click on the backdrop (outside the panel) closes it
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => {
    window.__lenis?.start();
    if (window.location.hash.startsWith('#industry-')) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  });

  const fromHash = () => {
    const match = window.location.hash.match(/^#industry-([\w-]+)$/);
    if (!match) return;
    const card = cards.find((c) => c.dataset.industry === match[1]);
    if (!card) return;
    // bring the card into view in the carousel, then open its panel
    const track = card.closest('[data-track]');
    if (track) track.scrollTo({ left: card.parentElement.offsetLeft - track.offsetLeft, behavior: 'auto' });
    setTimeout(() => open(match[1]), 450);
  };
  window.addEventListener('hashchange', fromHash);
  if (document.documentElement.classList.contains('has-loader')) {
    document.addEventListener('loader:exit', fromHash, { once: true });
  } else {
    fromHash();
  }
}
