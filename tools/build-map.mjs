// Generates the dotted world map used in the "five offices" section.
// Approach adapted from the 21st.dev "World Map" component (manuarora700):
// dots come from the dotted-map package, pins snap to the same grid, arcs are
// drawn on top. Here the dots are precomputed at build time into one SVG path
// (no runtime cost) and the pin coordinates are written to src/data/map.json.
// Usage: npm run map
import DottedMap from 'dotted-map';
import { writeFileSync } from 'node:fs';
import { offices } from '../src/content/data.mjs';

const map = new DottedMap({
  height: 64,
  grid: 'diagonal',
  projection: { name: 'robinson' },
  region: { lat: { min: -6, max: 64 }, lng: { min: -128, max: 100 } },
});

for (const o of offices) {
  map.addPin({ lat: o.lat, lng: o.lng, data: { id: o.id }, svgOptions: { color: '#2AB7AE', radius: 0.5 } });
}

const points = map.getPoints();
const pins = points.filter((p) => p.data && p.data.id);
const dots = points.filter((p) => !(p.data && p.data.id));

// Read the grid size from the SVG the library would produce
const svg = map.getSVG({ radius: 0.22, color: '#fff', shape: 'circle', backgroundColor: 'transparent' });
const vb = svg.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number);
const [, , width, height] = vb;

const r = (n) => Math.round(n * 100) / 100;
// One path, one dot per "M x y h0" segment, drawn with a round line cap
const d = dots.map((p) => `M${r(p.x)} ${r(p.y)}h0`).join('');

const out = {
  width,
  height,
  dotCount: dots.length,
  d,
  pins: pins.map((p) => ({ id: p.data.id, x: r(p.x), y: r(p.y) })),
};
writeFileSync('src/data/map.json', JSON.stringify({ ...out, d: undefined }));
// The dots ship as one cached file; pins and arcs are drawn inline over it.
writeFileSync(
  'static/img/world-dots.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"><path d="${d}" fill="none" stroke="#F2F7F6" stroke-opacity=".24" stroke-width=".46" stroke-linecap="round"/></svg>`,
);
console.log(`map ${width}x${height}, ${dots.length} dots, path ${Math.round(d.length / 1024)} KB`);
console.log(out.pins);
