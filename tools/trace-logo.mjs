// Traces GMC's 196x140 PNG logo into a vector SVG (static/img/gmc-logo.svg).
// Each brand colour is separated into its own layer, upscaled 10x and traced
// with potrace into smooth curves, so the logo stays sharp at any size.
// Replace with GMC's original vector artwork if they can supply it.
// Usage: npm run logo
import sharp from 'sharp';
import potrace from 'potrace';
import { writeFileSync } from 'node:fs';

const SRC = 'source-images/brand/gmc-logo-light.png';
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const SCALE = 10;
// Smoothing removes the wobble the tiny source leaves in every edge;
// a higher tolerance lets potrace fit long, clean curves.
// The big mark takes strong smoothing; the small wordmark lines only a little,
// or their letters lose shape. CUT is the gap between the swoosh and the text.
const BLUR_MARK = Number(arg('blur', 9));
const BLUR_TEXT = Number(arg('blur-text', 1.6));
const CUT = Number(arg('cut', 95)); // in source pixels
const TOL = Number(arg('tol', 1.6));
const OUT = arg('out', 'static/img/gmc-logo.svg');
const TEAL = '#28B6AE';
const LIGHT = '#E4E4E8';

const trimmed = await sharp(SRC).trim({ threshold: 1 }).png().toBuffer();
const { width, height } = await sharp(trimmed).metadata();
const W = width * SCALE;
const H = height * SCALE;
const { data } = await sharp(trimmed).resize({ width: W, height: H, kernel: 'lanczos3' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

// Two layers: the whole logo silhouette (painted light grey) and the teal
// parts painted on top, so smoothing can never open a seam between colours.
function layer(kind) {
  const out = Buffer.alloc(W * H);
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    const teal = data[i + 1] - data[i] > 60;
    const a = kind === 'all' || teal ? data[i + 3] : 0;
    out[p] = 255 - a; // black shape on white, as potrace expects
  }
  return out;
}

// Smooth each region by its own amount, then join them at the cut line
async function smoothed(kind) {
  const raw = { raw: { width: W, height: H, channels: 1 } };
  const src = layer(kind);
  const strong = await sharp(src, raw).blur(BLUR_MARK).extractChannel(0).raw().toBuffer();
  const light = await sharp(src, raw).blur(BLUR_TEXT).extractChannel(0).raw().toBuffer();
  const cut = CUT * SCALE * W;
  const joined = Buffer.concat([strong.subarray(0, cut), light.subarray(cut)]);
  return sharp(joined, raw).png().toBuffer();
}

const trace = (buf) => new Promise((resolve, reject) => {
  potrace.trace(buf, { threshold: 128, turdSize: 30, optCurve: true, optTolerance: TOL, alphaMax: 1.0 }, (err, svg) => {
    if (err) reject(err);
    else resolve(svg.match(/ d="([^"]+)"/)[1]);
  });
});

const [tealPath, lightPath] = await Promise.all([trace(await smoothed('teal')), trace(await smoothed('all'))]);
// Round coordinates and scale back to the source's units to keep the file small
const tidy = (d) => d.replace(/-?\d+(?:\.\d+)?/g, (n) => String(Math.round((Number(n) / SCALE) * 20) / 20));

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="GMC, Ghausia Marketing Research Consultancy">
<path fill="${LIGHT}" fill-rule="evenodd" d="${tidy(lightPath)}"/>
<path fill="${TEAL}" stroke="${TEAL}" stroke-width=".3" stroke-linejoin="round" fill-rule="evenodd" d="${tidy(tealPath)}"/>
</svg>
`;
writeFileSync(OUT, svg);
console.log(`${OUT} ${width}x${height} units, ${Math.round(svg.length / 1024)} KB`);
