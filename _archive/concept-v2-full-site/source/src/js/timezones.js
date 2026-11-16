// "Seamlessly serving clients across time zones": plots each office's
// 09:00-18:00 day on the visitor's own 24-hour axis and highlights the overlap
// with the visitor's 09:00-18:00. Offsets come from Intl, so DST is handled.
import { offices } from '../content/data.mjs';
import { timeIn } from './clocks.js';
import { listJoin } from './brief.js';

const OPEN = 9;
const CLOSE = 18;

function offsetMinutes(tz, date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric',
  }).formatToParts(date);
  const get = (type) => Number(parts.find((p) => p.type === type).value);
  const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour') % 24, get('minute'));
  const whole = new Date(date);
  whole.setSeconds(0, 0);
  return Math.round((asUtc - whole.getTime()) / 60000);
}

// Split an interval (hours, possibly outside 0-24) into pieces inside one day
function wrap(start, end) {
  const s = ((start % 24) + 24) % 24;
  const e = s + (end - start);
  return e <= 24 ? [[s, e]] : [[s, 24], [0, e - 24]];
}

function intersect(a, b) {
  const out = [];
  for (const [s1, e1] of a) {
    for (const [s2, e2] of b) {
      const s = Math.max(s1, s2);
      const e = Math.min(e1, e2);
      if (e > s) out.push([s, e]);
    }
  }
  return out;
}

const hours = (segs) => segs.reduce((sum, [s, e]) => sum + (e - s), 0);
const cityOf = (tz) => tz.split('/').pop().replace(/_/g, ' ');

export function initTimeZones() {
  const root = document.querySelector('[data-tz]');
  if (!root) return;
  // The lean home shows the summary sentence alone, so the selector, the
  // chart and its rows are all optional.
  const select = root.querySelector('[data-tz-select]');
  const nowLine = root.querySelector('[data-tz-now]');
  const summary = root.querySelector('[data-tz-summary]');
  const youName = root.querySelector('[data-tz-you]');
  const youTime = root.querySelector('[data-tz-you-time]');
  const chart = root.querySelector('.tz__chart');
  const youTrack = root.querySelector('[data-tz-office="you"] .tz__track');

  let detected = 'UTC';
  try {
    detected = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch { /* keep UTC */ }
  if (select) select.options[0].textContent = `Your time zone (${cityOf(detected)})`;

  const zone = () => (!select || select.value === 'auto' ? detected : select.value);

  const paint = (track, base, overlap) => {
    if (!track) return;
    track.innerHTML = '';
    for (const [s, e] of base) {
      const seg = document.createElement('span');
      seg.className = 'tz__seg';
      seg.style.left = `${(s / 24) * 100}%`;
      seg.style.width = `${((e - s) / 24) * 100}%`;
      track.append(seg);
    }
    for (const [s, e] of overlap) {
      const seg = document.createElement('span');
      seg.className = 'tz__seg tz__seg--overlap';
      seg.style.left = `${(s / 24) * 100}%`;
      seg.style.width = `${((e - s) / 24) * 100}%`;
      track.append(seg);
    }
  };

  const render = () => {
    const tz = zone();
    const now = new Date();
    const viewer = offsetMinutes(tz, now);
    const yourDay = [[OPEN, CLOSE]];
    if (youName) youName.textContent = !select || select.value === 'auto' ? 'You' : cityOf(tz);
    if (youTime) youTime.textContent = timeIn(tz, now);
    paint(youTrack, yourDay, []);

    const results = offices.map((o) => {
      const shift = (viewer - offsetMinutes(o.tz, now)) / 60;
      const day = wrap(OPEN + shift, CLOSE + shift);
      const overlap = intersect(day, yourDay);
      const h = hours(overlap);
      const row = root.querySelector(`[data-tz-office="${o.id}"]`);
      if (row) {
        paint(row.querySelector('.tz__track'), day, overlap);
        row.setAttribute('aria-label', `${o.cityShort || o.city}: ${h} working hours in common`);
      }
      return { office: o, h };
    });

    // Now line, positioned over the tracks
    if (nowLine && chart && youTrack) {
      const [hh, mm] = timeIn(tz, now).split(':').map(Number);
      const box = chart.getBoundingClientRect();
      const t = youTrack.getBoundingClientRect();
      nowLine.style.left = `${t.left - box.left + ((hh + mm / 60) / 24) * t.width}px`;
    }

    const best = Math.max(...results.map((r) => r.h));
    const top = results.filter((r) => r.h === best).map((r) => r.office.cityShort || r.office.city);
    const good = results.filter((r) => r.h >= 4 && r.h < best).map((r) => r.office.cityShort || r.office.city);
    const fmtH = (n) => (Number.isInteger(n) ? n : n.toFixed(1));
    let text = `Your 09:00 to 18:00 shares <strong>${fmtH(best)} working hours</strong> with ${listJoin(top)}`;
    text += good.length ? `, and at least 4 with ${listJoin(good)}.` : '.';
    if (best < 9) text += ' Outside those hours, we work to yours.';
    // Only touch the live region when the sentence changes
    if (summary.innerHTML !== text) summary.innerHTML = text;
  };

  select?.addEventListener('change', render);
  document.addEventListener('clocks:tick', render);
  if (chart) new ResizeObserver(() => render()).observe(chart);
  render();
}
