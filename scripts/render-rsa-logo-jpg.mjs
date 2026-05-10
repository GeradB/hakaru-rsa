/**
 * One-off: RSA menu logo (rsa.org.nz) on #042c46 (.c-menu background) → public JPEG
 */
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

// From rsa.org.nz compiled CSS: .c-menu{background-color:#042c46}
const MENU_BG = { r: 4, g: 44, b: 70 };
const svgPath = path.join(root, 'public', 'rsa-logo-source.svg');
const outPath = path.join(root, 'public', 'rsa-nzrssa-logo-menu-bg.jpg');

const svgBuf = fs.readFileSync(svgPath);
// Rasterise SVG wider for sharper JPEG; preserves aspect (~3.07:1)
const targetW = 900;
const logoPng = await sharp(svgBuf).resize(targetW).png().toBuffer();
const meta = await sharp(logoPng).metadata();
const lw = meta.width || 900;
const lh = meta.height || 292;
const padX = 64;
const padY = 48;
const canvasW = lw + padX * 2;
const canvasH = lh + padY * 2;

await sharp({
  create: {
    width: canvasW,
    height: canvasH,
    channels: 3,
    background: MENU_BG,
  },
})
  .composite([{ input: logoPng, left: padX, top: padY }])
  .jpeg({ quality: 92, mozjpeg: true })
  .toFile(outPath);

console.log('Wrote', outPath, `${canvasW}x${canvasH}`);
