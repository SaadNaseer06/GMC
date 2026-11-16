// Turns the client's original photographs (source-images/live) into graded,
// responsive WebP files in static/img, plus logo, favicon and share image.
// Usage: npm run images
import sharp from 'sharp';
import { mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const SRC = 'source-images/live';
const BRAND = 'source-images/brand';
const OUT = 'static/img';
mkdirSync(OUT, { recursive: true });

// name -> source file. Every photo gets the same grade so the set reads as one.
const photos = {
  'car-clinic-hall': '2023_09_Automotive-Research.png',
  'car-clinic-row': '2023_09_5-scaled.jpg',
  'ux-desk': '2023_09_1-1-scaled.jpg',
  'analytics-laptop': '2023_09_2-1-scaled.jpg',
  'wireframes-tablet': '2023_09_3-1-scaled.jpg',
  'workshop-wall': '2023_09_6-scaled.jpg',
  'brand-dashboard': '2023_09_carlos-muza-hpjSkU2UYSU-unsplash.jpg',
  'taste-test': '2023_09_product-testing.jpg',
  'discussion': '2023_09_11-scaled.jpg',
  'notebook': '2023_09_12-scaled.jpg',
  'pencils': '2023_09_13-scaled.jpg',
  'ideas': '2023_09_opportunities-scaled.jpg',
  'tech-laptop': '2023_09_1-2-scaled.jpg',
  'shopper': '2023_09_fod.jpg',
  'gym': '2023_09_4-1-scaled.jpg',
  'tobacco-leaf': '2023_09_5-1-scaled.jpg',
  'healthcare-lab': '2023_09_6-1-scaled.jpg',
  'finance-phone': '2023_09_7-1-scaled.jpg',
  'hospitality': '2023_09_Hospitality.jpg',
  'community': '2023_09_social-scaled.jpg',
  'public-sector': '2023_09_Government-Public-sector.jpg',
  'restaurant': '2023_09_11-1-scaled.jpg',
  // Photos from the live home and About page (why-choose-us rows, banner, team)
  'jigsaw-map': '2023_09_section2-scaled.jpg',
  'city-window': '2023_09_section3-scaled.jpg',
  'desk-clock': '2023_09_opportunities2-scaled.jpg',
  'lens': '2023_09_magnifying-glass-magnifies-metal-bottle-laboratory-generated-by-ai-scaled.jpg',
  'team-screen': '2023_09_concentrated-colleagues-office-using-computer-1024x683.jpg',
  'crystal': '2023_09_banner-2-1024x683.jpg',
};

// ONLY=a,b processes just those photos and merges them into the manifest
const only = process.env.ONLY ? new Set(process.env.ONLY.split(',')) : null;

const WIDTHS = [640, 1024, 1600];
const FULL_BLEED = new Set(['jigsaw-map', 'city-window', 'desk-clock', 'lens']);
const manifest = {};

for (const [name, file] of Object.entries(photos)) {
  if (only && !only.has(name)) continue;
  const input = join(SRC, file);
  if (!existsSync(input)) { console.warn('missing', input); continue; }
  const meta = await sharp(input).metadata();
  // Full-bleed photos (hero slides, banners) also get a 2400px file
  const max = FULL_BLEED.has(name) ? 2400 : 1600;
  const sizes = FULL_BLEED.has(name) ? [...WIDTHS, 2400] : WIDTHS;
  const widths = sizes.filter((w) => w < meta.width).concat(meta.width < max ? [meta.width] : []);
  const unique = [...new Set(widths.map((w) => Math.min(w, max)))].sort((a, b) => a - b);
  manifest[name] = { w: meta.width, h: meta.height, widths: unique };
  for (const w of unique) {
    await sharp(input)
      .resize({ width: w, withoutEnlargement: true })
      .modulate({ saturation: 0.86, brightness: 1.0 })
      .linear(1.04, -4) // a touch more contrast so the set sits together
      .webp({ quality: 74, effort: 5 })
      .toFile(join(OUT, `${name}-${w}.webp`));
  }
  console.log(name.padEnd(18), `${meta.width}x${meta.height}`, '->', unique.join(', '));
}

if (only) {
  const fs = await import('node:fs');
  const prev = JSON.parse(fs.readFileSync('src/data/images.json', 'utf8'));
  fs.writeFileSync('src/data/images.json', JSON.stringify({ ...prev, ...manifest }, null, 2));
  console.log('merged into src/data/images.json');
  process.exit(0);
}

// The lean home hero shows this photo across most of the viewport, so it gets
// one larger file for wide and high-density screens. It is referenced by hand
// in lean/index.html and left out of the manifest.
await sharp(join(SRC, photos.discussion))
  .resize({ width: 2400, withoutEnlargement: true })
  .modulate({ saturation: 0.86, brightness: 1.0 })
  .linear(1.04, -4)
  .webp({ quality: 70, effort: 5 })
  .toFile(join(OUT, 'discussion-2400.webp'));

// Logos: the client's PNG (light lettering, for dark grounds) and the ink version
await sharp(join(BRAND, 'gmc-logo-light.png')).png().toFile(join(OUT, 'gmc-logo-light.png'));
await sharp(join(BRAND, 'gmc-logo-ink.png')).png().toFile(join(OUT, 'gmc-logo-ink.png'));

// High-resolution logo for the header, footer and loader. The only source is
// a 196x140 PNG, but the artwork is two flat colours, so a 3x upscale with
// sharpened edge alpha and colours snapped back to the brand values stays
// crisp at display size. Replace with a vector logo when GMC supplies one.
{
  const SCALE = 3;
  const TEAL = [40, 182, 174];
  const LIGHT = [228, 228, 232];
  const trimmed = await sharp(join(BRAND, 'gmc-logo-light.png')).trim({ threshold: 1 }).png().toBuffer();
  const { width, height } = await sharp(trimmed).metadata();
  const { data, info } = await sharp(trimmed)
    .resize({ width: width * SCALE, height: height * SCALE, kernel: 'lanczos3' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const smooth = (lo, hi, x) => {
    const t = Math.min(1, Math.max(0, (x - lo) / (hi - lo)));
    return t * t * (3 - 2 * t);
  };
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3] / 255;
    const [r, g] = [data[i], data[i + 1]];
    const colour = g - r > 60 ? TEAL : LIGHT;
    data[i] = colour[0];
    data[i + 1] = colour[1];
    data[i + 2] = colour[2];
    // Blend 55% toward a crisp edge: sharper than a plain upscale while the
    // small wordmark keeps its counters open
    data[i + 3] = Math.round((a + (smooth(0.28, 0.72, a) - a) * 0.55) * 255);
  }
  // Two-colour art compresses best as a palette PNG (about 5x smaller than WebP)
  const palette = { palette: true, colours: 64, effort: 10, compressionLevel: 9 };
  const hiPng = await sharp(data, { raw: info }).png().toBuffer();
  await sharp(hiPng).png(palette).toFile(join(OUT, `gmc-logo-${info.width}.png`));
  // Header and footer size, sharp at up to 2x density
  await sharp(hiPng).resize({ width: 300, kernel: 'lanczos3' }).png(palette).toFile(join(OUT, 'gmc-logo-300.png'));
  console.log(`logo ${info.width}x${info.height} (from ${width}x${height}), plus 300w`);
}

// Favicon: the GMC lettering (top part of the lockup) centred on a petrol tile
const PETROL = { r: 11, g: 46, b: 50, alpha: 1 };
const markArea = await sharp(join(BRAND, 'gmc-logo-light.png'))
  .extract({ left: 0, top: 0, width: 196, height: 96 })
  .png()
  .toBuffer();
const mark = await sharp(markArea).trim().png().toBuffer();
for (const [size, file] of [[32, 'favicon-32.png'], [180, 'apple-touch-icon.png'], [512, 'icon-512.png']]) {
  const inner = Math.round(size * 0.78);
  const resized = await sharp(mark).resize({ width: inner, height: inner, fit: 'inside' }).toBuffer();
  const radius = Math.round(size * 0.22);
  const tile = Buffer.from(`<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${radius}" fill="rgb(11,46,50)"/></svg>`);
  await sharp(tile).composite([{ input: resized, gravity: 'center' }]).png().toFile(join(OUT, file));
}

// Share image (1200x630)
const logoBig = await sharp(join(BRAND, 'gmc-logo-light.png')).resize({ height: 220 }).toBuffer();
const share = Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="rgb(11,46,50)"/>
  <rect x="80" y="520" width="96" height="6" fill="#2AB7AE"/>
  <text x="80" y="420" fill="#F2F7F6" font-family="Segoe UI, Arial, sans-serif" font-size="54" font-weight="600">Marketing research across the Gulf,</text>
  <text x="80" y="486" fill="#F2F7F6" font-family="Segoe UI, Arial, sans-serif" font-size="54" font-weight="600">Egypt, Pakistan and the USA</text>
</svg>`);
await sharp(share).composite([{ input: logoBig, left: 72, top: 64 }]).jpeg({ quality: 86 }).toFile(join(OUT, 'share.jpg'));

await import('node:fs').then((fs) => fs.writeFileSync('src/data/images.json', JSON.stringify(manifest, null, 2)));
console.log('logos, favicons, share image and src/data/images.json written');
