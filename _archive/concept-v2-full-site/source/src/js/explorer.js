import { desktop, finePointer, replay } from './util.js';

// Services explorer: a vertical tab list (hover, click or arrow keys) with a
// sticky preview panel. Filter chips narrow the list by group.
export function initExplorer() {
  const root = document.querySelector('[data-explorer]');
  if (!root) return;
  const tabs = [...root.querySelectorAll('[role="tab"]')];
  const panelOf = (tab) => document.getElementById(tab.getAttribute('aria-controls'));
  const list = root.querySelector('[role="tablist"]');
  let active = tabs.find((t) => t.getAttribute('aria-selected') === 'true') || tabs[0];
  let hoverTimer;

  const visibleTabs = () => tabs.filter((t) => !t.parentElement.classList.contains('is-filtered'));

  function select(tab, { focus = false } = {}) {
    if (focus) tab.focus();
    if (tab === active) return;
    active.setAttribute('aria-selected', 'false');
    active.tabIndex = -1;
    const oldPanel = panelOf(active);
    oldPanel.hidden = true;
    oldPanel.classList.remove('is-active', 'is-entering');

    tab.setAttribute('aria-selected', 'true');
    tab.tabIndex = 0;
    const panel = panelOf(tab);
    panel.hidden = false;
    panel.classList.add('is-active');
    replay(panel, 'is-entering');
    active = tab;

    // On small screens the list scrolls sideways: keep the chosen tab in view
    if (!desktop.matches) {
      const left = tab.offsetLeft - (list.clientWidth - tab.offsetWidth) / 2;
      list.scrollTo({ left, behavior: 'smooth' });
    }
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('pointerenter', (e) => {
      if (e.pointerType !== 'mouse' || !finePointer.matches || !desktop.matches) return;
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(() => select(tab), 80);
    });
    tab.addEventListener('pointerleave', () => clearTimeout(hoverTimer));
    tab.addEventListener('keydown', (e) => {
      const vis = visibleTabs();
      const i = vis.indexOf(tab);
      const keys = { ArrowDown: i + 1, ArrowRight: i + 1, ArrowUp: i - 1, ArrowLeft: i - 1, Home: 0, End: vis.length - 1 };
      if (!(e.key in keys)) return;
      e.preventDefault();
      const next = vis[(keys[e.key] + vis.length) % vis.length];
      select(next, { focus: true });
    });
  });

  root.querySelectorAll('[data-filter]').forEach((chip) => {
    chip.addEventListener('click', () => {
      const group = chip.dataset.filter;
      root.querySelectorAll('[data-filter]').forEach((c) => {
        const on = c === chip;
        c.classList.toggle('is-active', on);
        c.setAttribute('aria-pressed', String(on));
      });
      tabs.forEach((t) => {
        const li = t.parentElement;
        li.classList.toggle('is-filtered', group !== 'all' && li.dataset.group !== group);
      });
      const vis = visibleTabs();
      if (!vis.includes(active)) select(vis[0]);
      else replay(panelOf(active), 'is-entering');
    });
  });

  // /#service-<id> (mega menu, footer, other pages) selects that research type
  const fromHash = () => {
    const match = window.location.hash.match(/^#service-([\w-]+)$/);
    const tab = match && tabs.find((t) => t.dataset.service === match[1]);
    if (!tab) return;
    if (tab.parentElement.classList.contains('is-filtered')) root.querySelector('[data-filter="all"]')?.click();
    select(tab);
  };
  window.addEventListener('hashchange', fromHash);
  if (document.documentElement.classList.contains('has-loader')) {
    document.addEventListener('loader:exit', fromHash, { once: true });
  } else {
    fromHash();
  }
}
