// Styles and fonts load from a <link> in partials/head.html, so the page never
// paints unstyled while this script is still on its way.
import { initClocks } from './clocks.js';
import { initHeader } from './header.js';
import { initMotion } from './motion.js';
import { initLoader } from './loader.js';
import { initRotator } from './rotator.js';
import { initBrief } from './brief.js';
import { initTimeZones } from './timezones.js';
import { initExplorer } from './explorer.js';
import { initCarousel } from './carousel.js';
import { initMap } from './map.js';
import { initCounters } from './counters.js';
import { initTestimonials } from './testimonials.js';
import { initForm } from './form.js';
import { initMarquee } from './marquee.js';
import { initScrollSpy } from './scrollspy.js';
import { initIndustryDialog } from './industries.js';
import { initCaseFilter } from './cases.js';
import { initHeroSlides, initReveals, initParallax, initResearchFilter, initScrubText, initOffices, initResearchList } from './v3.js';

// Each module checks for its own markup, so one entry serves every page.
// A failure in one module is logged and never stops the others.
const modules = [
  initClocks, initHeader, initMotion, initLoader, initRotator, initBrief, initTimeZones, initExplorer,
  initCarousel, initMap, initCounters, initTestimonials, initForm, initMarquee, initScrollSpy, initIndustryDialog, initCaseFilter,
  initHeroSlides, initReveals, initParallax, initResearchFilter, initScrubText, initOffices, initResearchList,
];

for (const init of modules) {
  try {
    init();
  } catch (err) {
    console.error(`[gmc] ${init.name} failed`, err);
  }
}
