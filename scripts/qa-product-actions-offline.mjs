// Real product cards and current styles in Chromium, with in-memory API fixtures only.
import assert from 'node:assert/strict';
import { readFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { build } from 'esbuild';
import postcss from 'postcss';
import tailwindcss from 'tailwindcss';
import tailwindConfig from '../tailwind.config.js';
import { chromium } from 'playwright';

const project = fileURLToPath(new URL('../', import.meta.url));
const downloadSource = await readFile(path.join(project, 'src/services/freeDownloads.ts'), 'utf8');
const freeStart = downloadSource.indexOf('export function isProductFree');
const freeClassifier = downloadSource.slice(freeStart, downloadSource.indexOf('\n/**', freeStart));
const mocks = {
  '@/context/CartContext': 'export const useCart = () => ({ addItem: product => window.cartAdds.push(product) });',
  '@/hooks/useCurrency': 'export const useCurrencyFormatter = () => amount => "৳" + amount.toLocaleString("en-US");',
  '@/components/discovery/WishlistButton': `import React from 'react'; export const WishlistButton = () => <button type="button" aria-label="Add to wishlist" style={{borderRadius:'50%',display:'grid',placeItems:'center'}}>♡</button>;`,
  '@/services/freeDownloads': `${freeClassifier}\nexport const claimFreeDownload = product => new Promise((resolve, reject) => window.downloadRequests.push({ product, resolve, reject }));`,
};
const bundle = await build({
  absWorkingDir: project, tsconfig: 'tsconfig.app.json',
  stdin: { resolveDir: project, loader: 'tsx', contents: `
    import React from 'react';
    import { createRoot } from 'react-dom/client';
    import { MemoryRouter, useLocation } from 'react-router-dom';
    import { ProductCard } from '@/components/cards/ProductCard';
    const base = { shortDescription: 'Practical resources for your next creative project.', descriptor: 'Practical resources for your next creative project.', featured: false, newProduct: false, thumbnail: '', images: [], icon: 'Package', accent: 'brand', deliveryType: 'instant-download', productType: 'digital_download' };
    const products = [
      { ...base, id: 'free-theme', name: 'Starter WordPress theme', slug: 'starter-theme', category: 'WordPress Themes', price: 499, compareAtPrice: 799 },
      { ...base, id: 'paid-toolkit', name: 'Creator productivity toolkit', slug: 'creator-toolkit', category: 'Software', price: 1499, compareAtPrice: 1999, reviewStats: { averageRating: 4.8, reviewCount: 24 } },
      { ...base, id: 'paid-course', name: 'AI Motion Masterclass', slug: 'ai-motion-masterclass', category: 'Courses', price: 2999, compareAtPrice: 4999 },
      { ...base, id: 'free-course', name: 'Creative essentials mini course', slug: 'creative-essentials', category: 'Courses', price: 0 },
    ];
    window.cartAdds = [];
    window.downloadRequests = [];
    window.openedDownloads = [];
    window.open = (...args) => { window.openedDownloads.push(args); return null; };
    const root = createRoot(document.getElementById('root'));
    let generation = 0;
    function Location() { const location = useLocation(); return <output id="location" hidden>{location.pathname + location.search}</output>; }
    window.mountCards = (ids = products.map(product => product.id)) => root.render(
      <MemoryRouter key={++generation}>
        <Location />
        <div className="qa-grid">{products.filter(product => ids.includes(product.id)).map(product => <ProductCard key={product.id} product={product} />)}</div>
      </MemoryRouter>
    );
    window.mountCards();
  ` },
  bundle: true, write: false, format: 'iife', jsx: 'automatic',
  plugins: [{ name: 'offline-product-fixtures', setup(plugin) {
    plugin.onResolve({ filter: /^@\// }, args => args.path in mocks ? { path: args.path, namespace: 'fixtures' } : undefined);
    plugin.onLoad({ filter: /.*/, namespace: 'fixtures' }, args => ({ contents: mocks[args.path], loader: 'tsx', resolveDir: project }));
    plugin.onLoad({ filter: /\.css$/ }, () => ({ contents: '', loader: 'js' }));
  } }],
});

const indexCss = (await readFile(path.join(project, 'src/index.css'), 'utf8')).replace(/@import\s+url\([^)]*\);/g, '');
const utilityCss = (await postcss([tailwindcss({ ...tailwindConfig, content: [path.join(project, 'src/components/cards/ProductCard.tsx'), path.join(project, 'src/components/ui/PriceDisplay.tsx')] })]).process(indexCss, { from: path.join(project, 'src/index.css') })).css;
const catalogCss = await readFile(path.join(project, 'src/catalog-redesign.css'), 'utf8');
const testFrameCss = `
  body { margin:0; background:#f8f9fc; font-family:Arial,sans-serif; }
  #root { max-width:1280px; margin:auto; padding:32px; }
  .qa-grid { display:grid; grid-template-columns:repeat(var(--columns,4),minmax(0,1fr)); gap:22px; align-items:stretch; }
  #root[data-catalog] .qa-grid { margin-left:277px; }
  @media(max-width:600px) { #root { padding:20px; } .qa-grid { gap:20px; } }
`;

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  const unexpectedRequests = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', route => {
    if (route.request().url() === 'http://product-actions.test/') return route.fulfill({ contentType: 'text/html', body: '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><main id="root"></main></body></html>' });
    unexpectedRequests.push(route.request().url());
    return route.abort();
  });
  await page.goto('http://product-actions.test/');
  await page.addStyleTag({ content: utilityCss + '\n' + catalogCss + '\n' + testFrameCss });
  await page.addScriptTag({ content: bundle.outputFiles[0].text });

  const free = () => page.getByRole('button', { name: 'Download: Starter WordPress theme', exact: true });
  await free().waitFor();
  assert.equal(await free().innerText(), 'Download');
  assert.equal(await page.getByRole('button', { name: 'Add to cart: Creator productivity toolkit', exact: true }).innerText(), 'Add to cart');
  assert.equal(await page.getByRole('link', { name: 'Buy now: AI Motion Masterclass', exact: true }).getAttribute('href'), '/course/ai-motion');
  assert.equal(await page.getByRole('button', { name: 'Download: Creative essentials mini course', exact: true }).innerText(), 'Download');
  console.log('PASS explicit free/paid/course actions and the existing free-category classification');

  await page.getByRole('button', { name: 'Add to cart: Creator productivity toolkit', exact: true }).click();
  await page.getByRole('button', { name: 'Added to cart: Creator productivity toolkit', exact: true }).waitFor();
  assert.equal(await page.evaluate(() => window.cartAdds[0].id), 'paid-toolkit');
  assert.equal(await page.evaluate(() => window.cartAdds.length), 1);
  await page.getByRole('link', { name: 'Buy now: AI Motion Masterclass', exact: true }).click();
  await page.waitForFunction(() => document.querySelector('#location').textContent === '/course/ai-motion');
  console.log('PASS paid add-to-cart feedback and course purchase navigation');

  await free().evaluate(button => { button.click(); button.click(); });
  await page.getByRole('button', { name: 'Preparing download: Starter WordPress theme', exact: true }).waitFor();
  assert.equal(await page.getByRole('button', { name: 'Preparing download: Starter WordPress theme', exact: true }).isDisabled(), true);
  assert.equal(await page.evaluate(() => window.downloadRequests.length), 1);
  await page.evaluate(() => window.downloadRequests[0].resolve({ success: true, url: 'https://downloads.example.test/starter.zip' }));
  const readyLink = page.getByRole('link', { name: 'Download file: Starter WordPress theme', exact: true });
  await readyLink.waitFor();
  assert.equal(await readyLink.getAttribute('href'), 'https://downloads.example.test/starter.zip');
  assert.deepEqual(await page.evaluate(() => window.openedDownloads[0]), ['https://downloads.example.test/starter.zip', '_blank', 'noopener,noreferrer']);
  console.log('PASS pending download blocks duplicate calls and ready link survives a blocked popup');

  await page.evaluate(() => window.mountCards());
  await free().waitFor();
  await free().click();
  await page.waitForFunction(() => window.downloadRequests.length === 2);
  await page.evaluate(() => window.downloadRequests[1].resolve({ success: false, error: 'Expected test failure' }));
  await page.getByRole('alert').waitFor();
  assert.equal(await free().isEnabled(), true);
  await free().click();
  await page.waitForFunction(() => window.downloadRequests.length === 3);
  await page.evaluate(() => window.downloadRequests[2].resolve({ success: true, url: 'javascript:alert(1)' }));
  await page.getByRole('alert').waitFor();
  assert.equal(await page.evaluate(() => window.openedDownloads.length), 1);
  assert.equal(await free().isEnabled(), true);
  await free().click();
  await page.waitForFunction(() => window.downloadRequests.length === 4);
  await page.evaluate(() => window.downloadRequests[3].resolve({ success: true, url: 'https://downloads.example.test/retry.zip' }));
  await readyLink.waitFor();
  assert.equal(await readyLink.getAttribute('href'), 'https://downloads.example.test/retry.zip');
  console.log('PASS failed downloads retry and unsafe download URLs are rejected');

  await page.evaluate(() => window.mountCards());
  await free().waitFor();
  await free().click();
  await page.waitForFunction(() => window.downloadRequests.length === 5);
  await page.evaluate(() => window.mountCards(['paid-toolkit']));
  await page.waitForFunction(() => document.querySelectorAll('.market-resource-card').length === 1);
  await page.getByRole('button', { name: 'Add to cart: Creator productivity toolkit', exact: true }).waitFor();
  await page.evaluate(() => window.downloadRequests[4].resolve({ success: true, url: 'https://downloads.example.test/stale.zip' }));
  await page.waitForTimeout(30);
  assert.equal(await page.evaluate(() => window.openedDownloads.length), 2);
  console.log('PASS late download completion after unmount cannot open a stale file');

  await page.evaluate(() => window.mountCards());
  await free().waitFor();
  await mkdir(path.join(project, 'design-assets'), { recursive: true });
  for (const { width, columns, catalog } of [
    { width: 1440, columns: 4, catalog: false },
    { width: 1100, columns: 3, catalog: true },
    { width: 390, columns: 1, catalog: false },
    { width: 320, columns: 1, catalog: false },
  ]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.evaluate(({ columns, catalog }) => {
      const frame = document.querySelector('#root');
      frame.style.setProperty('--columns', String(columns));
      frame.toggleAttribute('data-catalog', catalog);
    }, { columns, catalog });
    const dimensions = await page.evaluate(() => ({
      viewport: innerWidth, page: document.documentElement.scrollWidth,
      controls: [...document.querySelectorAll('.market-resource-card__action')].map(button => {
        const buttonRect = button.getBoundingClientRect();
        const cardRect = button.closest('.market-resource-card').getBoundingClientRect();
        return { height: buttonRect.height, inside: buttonRect.left >= cardRect.left && buttonRect.right <= cardRect.right, noTextOverflow: button.scrollWidth <= button.clientWidth };
      }),
    }));
    assert.ok(dimensions.page <= dimensions.viewport, `No page overflow at ${width}px`);
    assert.equal(dimensions.controls.length, 4);
    assert.ok(dimensions.controls.every(control => control.inside && control.height >= 44 && control.noTextOverflow), `Readable, contained actions at ${width}px`);
    if (width === 1440 || width === 390) {
      await page.mouse.move(0, 0);
      await page.waitForTimeout(250);
      await page.screenshot({ path: path.join(project, `design-assets/product-actions-${width === 1440 ? 'desktop' : 'mobile'}.png`), fullPage: true });
    }
  }
  assert.deepEqual(errors, []);
  assert.deepEqual(unexpectedRequests, []);
  console.log('PASS 1440/1100/390/320px action layout; desktop/mobile screenshots saved. No server or external requests.');
} finally {
  await browser.close();
}
