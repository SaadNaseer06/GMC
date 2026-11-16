import { animate, inView, stagger } from "motion";

/* ---------- offices: one source for the hero desk and the footer ---------- */
// weekend = days of the week the office is closed (0 = Sunday)
const OFFICES = [
  { city: "Sharjah", country: "UAE", place: "Sharjah Research, Technology and Innovation Park", tz: "Asia/Dubai", weekend: [0, 6], hq: true },
  { city: "Riyadh", country: "KSA", place: "Al Olaya", tz: "Asia/Riyadh", weekend: [5, 6] },
  { city: "Cairo", country: "Egypt", place: "Sarayat El Maadi", tz: "Africa/Cairo", weekend: [5, 6] },
  { city: "Karachi", country: "Pakistan", place: "Gulshan-e-Azeem", tz: "Asia/Karachi", weekend: [0, 6] },
  { city: "Stafford", country: "USA", place: "Texas", tz: "America/Chicago", weekend: [0, 6] },
];

const DAYS = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

function localState(office, now = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: office.tz, weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
    }).formatToParts(now).map((p) => [p.type, p.value])
  );
  const hour = Number(parts.hour);
  const day = DAYS[parts.weekday];
  const open = !office.weekend.includes(day) && hour >= 9 && hour < 18;
  return { time: `${parts.hour}:${parts.minute}`, day: parts.weekday, open };
}

const desk = document.querySelector("[data-offices]");
const footer = document.querySelector("[data-footer-offices]");

function renderDesk() {
  if (!desk) return;
  desk.innerHTML = OFFICES.map((o) => {
    const s = localState(o);
    return `<li>
      <span class="dot${s.open ? " is-open" : ""}" aria-hidden="true"></span>
      <span class="desk-city">${o.city}<small>${o.country}${o.hq ? ", head office" : ""}</small></span>
      <span class="desk-time"><b>${s.time}</b><span>${s.open ? "In office" : "After hours"}</span></span>
      <span class="desk-place">${o.place}</span>
    </li>`;
  }).join("");
}

function renderFooter() {
  if (!footer) return;
  footer.innerHTML = OFFICES.map((o) => {
    const s = localState(o);
    return `<li><b><span class="dot${s.open ? " is-open" : ""}" aria-hidden="true"></span>${o.city}, ${o.country}</b><span>${o.place}</span></li>`;
  }).join("");
}

renderDesk();
renderFooter();
// refresh on the minute
setTimeout(function tick() {
  renderDesk();
  renderFooter();
  setTimeout(tick, 60_000 - (Date.now() % 60_000));
}, 60_000 - (Date.now() % 60_000));

/* ---------- header ---------- */
const header = document.querySelector("[data-header]");
const onScroll = () => header?.classList.toggle("is-scrolled", window.scrollY > 8);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

const menuBtn = document.querySelector("[data-menu]");
const mobileNav = document.getElementById("mobile-nav");
menuBtn?.addEventListener("click", () => {
  const open = menuBtn.getAttribute("aria-expanded") === "true";
  menuBtn.setAttribute("aria-expanded", String(!open));
  mobileNav.hidden = open;
});
mobileNav?.addEventListener("click", (e) => {
  if (e.target.closest("a")) {
    mobileNav.hidden = true;
    menuBtn.setAttribute("aria-expanded", "false");
  }
});

document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

/* ---------- motion: one hero entrance, quiet reveals ---------- */
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const ease = [0.2, 0.7, 0.2, 1];

if (!reduce) {
  document.documentElement.classList.add("js");

  animate(
    "[data-enter]",
    { opacity: [0, 1], transform: ["translateY(12px)", "translateY(0)"] },
    { duration: 0.6, ease, delay: stagger(0.12, { startDelay: 0.05 }) }
  );

  // the desk rows settle in after the panel
  animate(
    ".desk-list li",
    { opacity: [0, 1], transform: ["translateY(6px)", "translateY(0)"] },
    { duration: 0.4, ease, delay: stagger(0.06, { startDelay: 0.35 }) }
  );

  inView(
    "[data-reveal]",
    (el) => {
      animate(el, { opacity: [0, 1], transform: ["translateY(16px)", "translateY(0)"] }, { duration: 0.6, ease });
    },
    { margin: "0px 0px -10% 0px" }
  );
}
