import fs from 'node:fs/promises';
import { chromium } from 'playwright-core';

const executablePath =
  process.env.CHROME_PATH ||
  '/home/bruno/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome';
const base = process.env.BASE_URL || 'http://127.0.0.1:4173';
const out = '/tmp/virall-shots2';
await fs.mkdir(out, { recursive: true });

const browser = await chromium.launch({ executablePath, headless: true, args: ['--no-sandbox'] });
const errors = [];
const failed = [];

function watch(page, name) {
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`[${name}] console: ${message.text()}`);
  });
  page.on('pageerror', (error) => errors.push(`[${name}] pageerror: ${error.message}`));
  page.on('requestfailed', (request) =>
    failed.push(`[${name}] ${request.url()} ${request.failure()?.errorText}`),
  );
}

async function scrollThrough(page) {
  const height = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < height; y += 650) {
    await page.evaluate((value) => window.scrollTo(0, value), y);
    await page.waitForTimeout(90);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
}

async function shot(name, route, options = {}) {
  const { width = 1440, height = 900, colorScheme = 'dark', mobile = false } = options;
  const context = await browser.newContext({
    viewport: { width, height },
    colorScheme,
    isMobile: mobile,
    hasTouch: mobile,
    deviceScaleFactor: mobile ? 2 : 1,
  });
  const page = await context.newPage();
  watch(page, name);
  await page.goto(`${base}${route}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(700);
  await scrollThrough(page);
  await page.screenshot({ path: `${out}/${name}.png`, fullPage: true });
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  if (overflow > 1) errors.push(`[${name}] horizontal overflow: ${overflow}px`);
  console.log(`shot ${name}${overflow > 1 ? ` OVERFLOW ${overflow}` : ''}`);
  await context.close();
}

await shot('overview-dark', '/');
await shot('overview-light', '/', { colorScheme: 'light' });
await shot('overview-mobile', '/', { width: 390, height: 844, mobile: true });
await shot('explore-samples', '/explore?tab=samples');
await shot('explore-species-default', '/explore?tab=species');
await shot('explore-species-nonviral', '/explore?tab=species&species=Streptococcus%20thermophilus');
await shot('explore-genomes', '/explore?tab=genomes&genome=Colneyvirus_1');
await shot('explore-taxonomy', '/explore?tab=taxonomy');
await shot('explore-mobile', '/explore?tab=samples', { width: 390, height: 844, mobile: true });
await shot('validation', '/validation');
await shot('validation-mobile', '/validation', { width: 390, height: 844, mobile: true });
await shot('about', '/about');
await shot('qr', '/qr');

// Theme toggle interaction.
{
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, colorScheme: 'dark' });
  const page = await context.newPage();
  watch(page, 'theme-toggle');
  await page.goto(`${base}/`, { waitUntil: 'networkidle' });
  const before = await page.evaluate(() => document.documentElement.classList.contains('dark'));
  await page.getByRole('button', { name: /switch to light mode/i }).click();
  const after = await page.evaluate(() => ({
    dark: document.documentElement.classList.contains('dark'),
    stored: localStorage.getItem('virall-theme'),
  }));
  if (!before || after.dark || after.stored !== 'light') {
    errors.push(`[theme-toggle] unexpected state before=${before} after=${JSON.stringify(after)}`);
  }
  await context.close();
}

await browser.close();

console.log('\nConsole errors:', errors.length);
for (const error of errors) console.log(' -', error);
console.log('\nFailed requests:', failed.length);
for (const item of failed) console.log(' -', item);
