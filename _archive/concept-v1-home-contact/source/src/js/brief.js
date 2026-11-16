// "Plan a study": a two-question brief in the hero. Pattern adapted from the
// 21st.dev Questionnaire component (uiable): one question at a time, real
// radio/checkbox inputs, progress, validation before moving on.
import { briefNeeds, briefMarkets, services, offices } from '../content/data.mjs';
import { refreshClocks } from './clocks.js';
import { replay } from './util.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function listJoin(items) {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

export function initBrief() {
  const form = document.querySelector('[data-brief]');
  if (!form) return;

  const steps = [...form.querySelectorAll('[data-step]')];
  const progress = form.querySelector('[data-brief-progress]');
  const bar = form.querySelector('[data-brief-bar]');
  const needInputs = [...form.querySelectorAll('input[name="need"]')];
  const marketInputs = [...form.querySelectorAll('input[name="markets"]')];
  let step = 1;

  const setError = (n, on) => {
    const err = steps[n - 1].querySelector('[data-brief-error]');
    if (err) err.hidden = !on;
    form.classList.toggle('is-invalid', on);
  };

  const show = (n) => {
    steps.forEach((s) => {
      const on = Number(s.dataset.step) === n;
      s.hidden = !on;
      if (on) replay(s, 'is-entering');
    });
    step = n;
    progress.textContent = n === 3 ? 'Your brief is ready' : `Question ${n} of 2`;
    bar.style.width = n === 1 ? '50%' : '100%';
    setError(1, false);
    setError(2, false);
  };

  const goNext = () => {
    if (!needInputs.some((i) => i.checked)) {
      setError(1, true);
      needInputs[0].focus();
      return;
    }
    show(2);
    marketInputs[0].focus({ preventScroll: true });
  };

  const renderResult = (needId, marketIds) => {
    const need = briefNeeds.find((n) => n.id === needId);
    const markets = marketIds.map((id) => briefMarkets.find((m) => m.id === id));
    const officeList = markets.map((m) => m.office && offices.find((o) => o.id === m.office)).filter(Boolean);
    const out = (k) => form.querySelector(`[data-out="${k}"]`);

    out('need').textContent = need.label;
    out('markets').textContent = listJoin(markets.map((m) => m.label));
    out('services').innerHTML = need.services
      .map((id) => services.find((s) => s.id === id))
      .map((s) => `<li><a href="/expertise/#${s.id}">${esc(s.title)}</a></li>`)
      .join('');
    const officeRows = officeList.map((o) => `<li><span>${esc(o.cityShort || o.city)}</span><time data-clock="${o.tz}">--:--</time></li>`);
    if (markets.some((m) => !m.office)) officeRows.push('<li><span>Field partner network, elsewhere</span></li>');
    out('offices').innerHTML = officeRows.join('');
    refreshClocks(out('offices'));

    const params = new URLSearchParams({ need: need.id, markets: marketIds.join(',') });
    form.querySelector('[data-brief-send]').href = `/contact/?${params}#contact-form`;
  };

  form.querySelector('[data-brief-next]').addEventListener('click', goNext);
  form.querySelector('[data-brief-prev]').addEventListener('click', () => {
    show(1);
    (needInputs.find((i) => i.checked) || needInputs[0]).focus({ preventScroll: true });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (step === 1) {
      goNext();
      return;
    }
    const chosen = marketInputs.filter((i) => i.checked).map((i) => i.value);
    if (!chosen.length) {
      setError(2, true);
      marketInputs[0].focus();
      return;
    }
    renderResult(needInputs.find((i) => i.checked).value, chosen);
    show(3);
    steps[2].focus({ preventScroll: true });
  });

  form.querySelector('[data-brief-restart]').addEventListener('click', () => {
    form.reset();
    show(1);
    needInputs[0].focus({ preventScroll: true });
  });

  form.addEventListener('change', () => {
    if (form.classList.contains('is-invalid')) setError(step, false);
  });

  // Number keys pick an answer on question 1 while focus is in the card
  form.addEventListener('keydown', (e) => {
    if (step !== 1 || e.altKey || e.ctrlKey || e.metaKey) return;
    const n = Number.parseInt(e.key, 10);
    if (n >= 1 && n <= needInputs.length) {
      e.preventDefault();
      needInputs[n - 1].checked = true;
      needInputs[n - 1].focus();
      setError(1, false);
    }
  });
}
