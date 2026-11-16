// Live local time for every [data-clock="Area/City"] element.
const formats = new Map();

function format(tz) {
  if (!formats.has(tz)) {
    // data-clock="local" shows the visitor's own time
    formats.set(tz, new Intl.DateTimeFormat('en-GB', { timeZone: tz === 'local' ? undefined : tz, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }));
  }
  return formats.get(tz);
}

export function timeIn(tz, date = new Date()) {
  return format(tz).format(date);
}

export function refreshClocks(root = document) {
  const now = new Date();
  root.querySelectorAll('[data-clock]').forEach((el) => {
    const t = timeIn(el.dataset.clock, now);
    if (el.textContent !== t) {
      el.textContent = t;
      el.setAttribute('datetime', t);
    }
  });
  document.dispatchEvent(new CustomEvent('clocks:tick', { detail: now }));
}

export function initClocks() {
  refreshClocks();
  // Line up with the start of the next minute, then tick once a minute
  const wait = 60000 - (Date.now() % 60000) + 50;
  setTimeout(() => {
    refreshClocks();
    setInterval(refreshClocks, 60000);
  }, wait);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) refreshClocks();
  });
}
