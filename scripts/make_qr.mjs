import fs from 'node:fs/promises';
import QRCode from 'qrcode';

const url = process.argv[2] || process.env.SITE_URL || 'https://virall-explorer.pages.dev';
const outDir = new URL('../public/qr/', import.meta.url);
await fs.mkdir(outDir, { recursive: true });

const options = {
  errorCorrectionLevel: 'H',
  margin: 4,
  color: { dark: '#0B1F3AFF', light: '#FFFFFFFF' },
};

const pngPath = new URL('virall-qr.png', outDir);
const svgPath = new URL('virall-qr.svg', outDir);

await QRCode.toFile(pngPath.pathname, url, { ...options, width: 1200 });
const svg = await QRCode.toString(url, { ...options, type: 'svg', width: 1200 });
await fs.writeFile(svgPath, svg);

console.log(`QR target: ${url}`);
console.log(`Wrote ${pngPath.pathname}`);
console.log(`Wrote ${svgPath.pathname}`);
