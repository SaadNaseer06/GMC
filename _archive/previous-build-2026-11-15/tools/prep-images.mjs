import sharp from 'sharp';
const S = process.argv[2], O = process.argv[3];
const jobs = [
  ['11-scaled.jpg','discussion',1600,340],
  ['6-scaled.jpg','research-wall',1400,230],
  ['5-scaled.jpg','car-clinic',1400,230],
  ['1-1-scaled.jpg','ux-desk',1400,230],
  ['12-scaled.jpg','notebook',1400,230],
  ['3-1-scaled.jpg','tablet-guide',1400,230],
  ['2-1-scaled.jpg','analytics',1400,230],
];
for (const [src,name,w] of jobs) {
  for (const width of [w, 800]) {
    const out = `${O}/${name}-${width}.webp`;
    const info = await sharp(`${S}/${src}`).resize({ width }).webp({ quality: 74 }).toFile(out);
    console.log(out, info.width+'x'+info.height, Math.round(info.size/1024)+'KB');
  }
}
// logo for light grounds: light-grey letters -> ink, teal kept
const { data, info } = await sharp(`${S}/original-png-logo.png`).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
for (let i = 0; i < data.length; i += 4) {
  const r = data[i], g = data[i+1], b = data[i+2];
  const sat = Math.max(r,g,b) - Math.min(r,g,b);
  if (sat < 40) { data[i] = 0x0f; data[i+1] = 0x1e; data[i+2] = 0x1d; }
}
await sharp(data, { raw: info }).png().toFile(`${O}/gmc-logo-ink.png`);
await sharp(`${S}/original-png-logo.png`).png().toFile(`${O}/gmc-logo-light.png`);
console.log('logos done');
