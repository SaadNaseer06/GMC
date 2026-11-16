# GMC website

Revamp of [ghausia-research.ae](https://ghausia-research.ae) as a fast static site. Content comes from the live site; layout and interaction take their cue from Kantar, Ipsos and NielsenIQ.

## Current scope: homepage concept for the client

Only **Home** (`/`) and **Contact** (`/contact/`) are built and linked. Everything in the navigation points into the home page:

- Expertise menu → `/#service-<id>` selects that research type in the explorer
- Industries menu and the carousel cards → open a detail panel with the full industry write-up (`/#industry-<id>` opens it directly)
- About → the intro section (`/#about`), Testimonials → `/#testimonials`
- "Talk to us about …" in the explorer and "Discuss a project" in the industry panel open the contact form with the topic or industry filled in (`/contact/?topic=<id>`, `/contact/?industry=<id>`)

The about/, expertise/ and industries/ pages and home-backup/ stay in the project (they open in development) but are left out of the build. To publish them again, add them back to `pages` in `vite.config.js` and point the links back at them.

Full-page images for sharing are in `mockups/` (home on desktop and phone, contact on desktop), captured with motion off so they show the settled design.

## Commands

```bash
npm install
npm run dev       # local site at http://localhost:5173
npm run build     # static output in dist/
npm run preview   # serve dist/ locally to check the build
npm run images    # re-export photos from source-images/ (WebP, 3 sizes)
npm run map       # regenerate the dotted office map
```

## Structure

| Path | What it holds |
| --- | --- |
| `index.html`, `about/`, `expertise/`, `industries/`, `contact/` | One folder per page, so URLs are clean (`/about/`). The home page uses the lean layout (`src/styles/lean.css`, scoped to `body.is-lean`) |
| `home-backup/` | The previous long home page (with the "Plan a study" card and time-zone chart), kept for reference at `/home-backup/` in development. Not part of the production build |
| `lean/` | Redirects the old `/lean/` preview address to `/`. Development only |
| `partials/` | Header, footer and shared sections, pulled in with `<!-- @include partials/x.html -->` |
| `src/content/data.mjs` | **All content**: services, industries, testimonials, offices, client names |
| `src/content/render.mjs` | Turns that data into HTML at build time (`<!-- @render name -->`) |
| `src/styles/` | Design tokens (`tokens.css`) and component styles |
| `src/js/` | One small module per interaction (see below) |
| `static/img/` | Processed images, logo, favicons, share image |
| `tools/` | Vite plugin, image pipeline, map generator |

To change a service, industry, testimonial or office address, edit `src/content/data.mjs`. Every page, the mega menus and the footer update from it.

## Interactions

- Intro loader: transparent GMC mark on dark petrol, drawn in once with a soft silk edge, held, then the same edge sweeps the page open. Shows on every page and every reload; skip with click, key or scroll; off for reduced motion. It uses the same high-resolution logo as the header (`static/img/gmc-logo-320.png` and `gmc-logo-640.png`), so it stays sharp on high-density screens. Markup in `partials/loader.html`, styles in `src/styles/loader.css`, timing in `src/js/loader.js`.
- Header: live local time for all five offices, mega menus (hover, click, Escape), hides on scroll down
- Home hero: the live site's rotating headline over a photograph, with the four key figures (17+ years, 500+ projects, 5 countries, ≈30% lower cost) counting up as the intro loader hands over
- Backup home only (`/home-backup/`): a two-question "Plan a study" card that builds a brief and pre-fills the contact form, and a chart of each office's working day against the visitor's own time zone (also used on the About page)
- Explorer: 14 research types with filters and a preview panel (arrow keys work)
- Industries carousel with drag, buttons and progress
- Dotted map with office pins, connected routes and live clocks
- Testimonials slider that pauses on hover/focus, with a visible pause button
- Contact form with inline validation

All motion respects `prefers-reduced-motion`.

## Deploying on Vercel

Import the project in Vercel; `vercel.json` sets the build (`npm run build`, output `dist`) and:

- caches the hashed `/assets/` files (JS, CSS, fonts) for a year and images for 30 days
- redirects `/contact` to `/contact/`
- sends a few security headers
- sends `X-Robots-Tag: noindex` while this is a client concept, so the copy of the live site's content is not indexed. **Remove that header at launch**, together with nothing else: `static/robots.txt` and `static/sitemap.xml` are already set up for ghausia-research.ae.

Lighthouse on the production build (home page): performance 98 mobile / 100 desktop, accessibility, best practices and SEO 100. The intro loader plays on every page load and covers the page for about 4 seconds; visitors feel that wait even though the page itself is ready sooner.

## Before going live

1. **Contact form backend.** Set `data-endpoint` on the form in `partials/form.html` to a URL that accepts a JSON POST (Formspree, a serverless function, or the existing WordPress form). Without it, the form opens the visitor's email app addressed to info@ghausia-research.ae and says so on the page.
2. **Redirects** from the old WordPress URLs:
   - `/about-us/` → `/about/`
   - `/experties/` and `/beta/experties/` → `/expertise/`
   - `/industries-2/` → `/industries/`
   - `/case-studies/`, `/insights/`, `/media-mentions/`, `/category/insights/*` → `/` (these held template placeholder content, not GMC content, and were not migrated)
3. **Hosting.** Upload `dist/` to any static host. Paths are root-relative, so serve it from the domain root.

## Content to confirm with GMC

- **Cost saving:** the live home page and meta description say approximately 30%, while the About page says 20%. The new site uses 30% throughout.
- **Testimonials:** spelling and grammar lightly corrected (for example "There insights" became "Their insights").
- **Client names** (Dunkin', Aldar, Emirates, Land Rover and others) are shown as plain text, as named on the live site. Check the client is happy to list them.
- **Office hours** in the time-zone chart are assumed to be 09:00–18:00 local time.
- **Logo:** the header and footer use GMC's high-resolution logo (`source-images/brand/gmc-logo-hires.png`, 1619px), exported as `static/img/gmc-logo-320.png` and `gmc-logo-640.png` (for high-density screens). An original vector file (`.svg`, `.ai`, `.eps`) is still worth asking GMC for, for print and very large uses.
- The live site's email link points to `Info@ghausia-Rresearch.ae` (a typo). The new site uses `info@ghausia-research.ae`.

## Credits

- Map and brief card patterns adapted from 21st.dev components: World Map (manuarora700) and Questionnaire (uiable)
- Icons: [lucide](https://lucide.dev) (ISC)
- Type: Schibsted Grotesk (SIL Open Font License)
- Photography: GMC's own images from the live site
