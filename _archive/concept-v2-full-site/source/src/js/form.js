// Contact form: inline validation, brief pre-fill from the hero card, and
// submission. Set data-endpoint on the form (partials/form.html) to POST JSON
// to your form backend; without one, the message opens in the visitor's email
// app addressed to GMC, and the page says so plainly.
import { briefNeeds, briefMarkets, services, industries } from '../content/data.mjs';
import { listJoin } from './brief.js';

const EMAIL = 'info@ghausia-research.ae';

const rules = {
  name: (v) => (v.trim() ? '' : 'Enter your name'),
  email: (v) => {
    if (!v.trim()) return 'Enter your email address';
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Enter an email address like name@company.com';
  },
  website: (v) => {
    if (!v.trim()) return '';
    return /^(https?:\/\/)?[\w-]+(\.[\w-]+)+([/?#].*)?$/i.test(v.trim()) ? '' : 'Enter a web address like company.com';
  },
  message: (v) => (v.trim().length >= 10 ? '' : 'Tell us a little about what you need (at least 10 characters)'),
};

export function initForm() {
  const form = document.querySelector('[data-form]');
  if (!form) return;
  const status = form.querySelector('[data-form-status]');
  const submit = form.querySelector('[data-form-submit]');
  const iconOk = form.querySelector('[data-icon-ok]')?.innerHTML || '';
  const iconWarn = form.querySelector('[data-icon-warn]')?.innerHTML || '';
  const touched = new Set();

  const field = (name) => form.elements.namedItem(name);

  const check = (name) => {
    const input = field(name);
    const message = rules[name](input.value);
    const error = document.getElementById(`${input.id}-error`);
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (error) {
      error.textContent = message;
      error.hidden = !message;
    }
    return !message;
  };

  Object.keys(rules).forEach((name) => {
    const input = field(name);
    input.addEventListener('blur', () => {
      if (input.value.trim() || touched.has(name)) {
        touched.add(name);
        check(name);
      }
    });
    input.addEventListener('input', () => {
      if (touched.has(name)) check(name);
    });
  });

  /* ---------- brief from the hero card ---------- */
  const params = new URLSearchParams(window.location.search);
  const need = briefNeeds.find((n) => n.id === params.get('need'));
  const markets = (params.get('markets') || '')
    .split(',')
    .map((id) => briefMarkets.find((m) => m.id === id))
    .filter(Boolean);
  const briefBox = form.querySelector('[data-form-brief]');
  let briefText = '';
  if (need && briefBox) {
    const where = markets.length ? listJoin(markets.map((m) => m.inText)) : '';
    briefText = `To understand: ${need.label}${markets.length ? `. Markets: ${listJoin(markets.map((m) => m.label))}` : ''}`;
    briefBox.querySelector('[data-form-brief-text]').textContent = briefText;
    briefBox.hidden = false;
    const message = field('message');
    if (!message.value) {
      message.value = `Hello GMC, we would like to understand ${need.label.charAt(0).toLowerCase()}${need.label.slice(1)}${where ? ` in ${where}` : ''}. `;
    }
    const topic = field('topic');
    if (topic && !topic.value) topic.value = need.services[0];
    briefBox.querySelector('[data-form-brief-clear]').addEventListener('click', () => {
      briefBox.hidden = true;
      briefText = '';
    });
  }

  /* ---------- from the home page: a research type or an industry ---------- */
  // "Talk to us about <service>" sends ?topic=<id>; the industry panel sends ?industry=<id>
  const service = services.find((x) => x.id === params.get('topic'));
  const industry = industries.find((x) => x.id === params.get('industry'));
  const topicSelect = field('topic');
  if (service && topicSelect && !topicSelect.value) topicSelect.value = service.id;
  if (!need && briefBox && (service || industry)) {
    // lower-case the first letter only for ordinary words ("Car clinics"), not acronyms ("UI/UX", "NPS")
    const inSentence = (t) => (/^[A-Z][a-z]/.test(t) ? t.charAt(0).toLowerCase() + t.slice(1) : t);
    briefText = [industry && `Industry: ${industry.title}`, service && `Topic: ${service.title}`].filter(Boolean).join('. ');
    briefBox.querySelector('[data-form-brief-text]').textContent = briefText;
    briefBox.hidden = false;
    const message = field('message');
    if (!message.value) {
      message.value = service
        ? `Hello GMC, we would like to talk to you about ${inSentence(service.title)}. `
        : `Hello GMC, we would like to discuss a research project in ${industry.title}. `;
    }
    briefBox.querySelector('[data-form-brief-clear]').addEventListener('click', () => {
      briefBox.hidden = true;
      briefText = '';
    });
  }

  const say = (html, kind = 'ok') => {
    status.classList.toggle('is-error', kind === 'error');
    status.innerHTML = `${kind === 'error' ? iconWarn : iconOk}<p>${html}</p>`;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    Object.keys(rules).forEach((n) => touched.add(n));
    const results = Object.keys(rules).map((n) => [n, check(n)]);
    const firstBad = results.find(([, ok]) => !ok);
    if (firstBad) {
      field(firstBad[0]).focus();
      return;
    }

    const data = Object.fromEntries(new FormData(form));
    if (briefText) data.brief = briefText;
    const topic = field('topic');
    const topicLabel = topic && topic.value ? topic.options[topic.selectedIndex].text : '';
    const endpoint = form.dataset.endpoint;

    if (endpoint) {
      submit.disabled = true;
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(String(res.status));
        form.classList.add('is-sent');
        say(`Thank you, ${escapeHtml(data.name.trim())}. Your message has been sent and we will reply to ${escapeHtml(data.email.trim())}.`);
        status.setAttribute('tabindex', '-1');
        status.focus();
      } catch {
        say(`Your message could not be sent. Please try again, or email us at <a href="mailto:${EMAIL}">${EMAIL}</a>.`, 'error');
      } finally {
        submit.disabled = false;
      }
      return;
    }

    const details = [
      briefText && `Brief: ${briefText}`,
      topicLabel && `Topic: ${topicLabel}`,
      `Name: ${data.name.trim()}`,
      `Email: ${data.email.trim()}`,
      data.phone && `Phone: ${data.phone}`,
      data.company && `Company: ${data.company}`,
      data.website && `Website: ${data.website}`,
    ].filter(Boolean);
    const lines = [data.message.trim(), '', ...details];
    const subject = `Research enquiry${data.company ? ` from ${data.company}` : ''}${topicLabel ? `: ${topicLabel}` : ''}`;
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
    say(`Your email app should now open with this message addressed to ${EMAIL}. If it does not, email us directly at <a href="mailto:${EMAIL}">${EMAIL}</a>.`);
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}
