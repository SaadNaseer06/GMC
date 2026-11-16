// Turns GMC's loader artwork (gmc_loader.gif, drawn on an off-white ground)
// into a transparent PNG for the dark loader: the light ground is removed, teal
// keeps its colour and soft glow, and the grey lettering becomes light grey so
// it reads on petrol. Usage: npm run loader-art
import sharp from 'sharp';

const SRC = 'source-images/brand/gmc_loader.gif';
const OUT = 'static/img/gmc-loader-logo.png';
const FRAME = 6; // fully revealed frame
const BG = 249; // the artwork's background value
const LIGHT = [218, 223, 224];

const crop = { left: 5, top: 70, width: 303, height: 250 };
const TEAL = [42, 183, 174];
const { data, info } = await sharp(SRC, { page: FRAME }).removeAlpha().extract(crop).median(3).raw().toBuffer({ resolveWithObject: true });
const out = Buffer.alloc(info.width * info.height * 4);
const greyAlpha = Buffer.alloc(info.width * info.height);
const isGrey = new Uint8Array(info.width * info.height);
const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

for (let i = 0, o = 0; i < data.length; i += 3, o += 4) {
  const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
  const depth = BG - Math.min(r, g, b); // how far the pixel is from the ground
  const teal = g - r > 25;
  let a;
  let rgb;
  if (teal) {
    // saturation decides coverage: solid teal stays solid, the haze becomes a soft glow
    rgb = TEAL;
    a = clamp((g - r - 34) / 70); // ink only; the light-ground haze reads as dirt on dark
  } else {
    // grey lettering is neutral (r = g = b); the haze around the mark is tinted.
    // Neutral ink is solid even where the artwork shades it lighter.
    const chroma = Math.max(r, g, b) - Math.min(r, g, b);
    rgb = LIGHT;
    a = chroma < 12 ? clamp((depth - 12) / 12) : 0;
  }
  if (a < 0.06) a = 0; // drop the paper texture and dither
  if (!teal) { greyAlpha[o / 4] = Math.round(a * 255); isGrey[o / 4] = 1; }
  out[o] = Math.round(rgb[0]);
  out[o + 1] = Math.round(rgb[1]);
  out[o + 2] = Math.round(rgb[2]);
  out[o + 3] = Math.round(a * 255);
}

// Remove isolated grey specks (haze) in the mark area with a median filter;
// the small text lines below MARK_END are left untouched.
const MARK_END = 150;
const cleaned = await sharp(greyAlpha, { raw: { width: info.width, height: info.height, channels: 1 } }).median(7).extractChannel(0).raw().toBuffer();
for (let p = 0; p < MARK_END * info.width; p++) if (isGrey[p]) out[p * 4 + 3] = cleaned[p];

await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } }).trim({ threshold: 0 }).png({ compressionLevel: 9 }).toFile(OUT);
const m = await sharp(OUT).metadata();
console.log(`${OUT} ${m.width}x${m.height}`);
