// Runs the real catalog page in Chromium with in-memory catalog/settings adapters.
// Every browser request is fulfilled or aborted; no server or credentials are used.
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { chromium } from 'playwright';

const root = fileURLToPath(new URL('..', import.meta.url));
const origin = 'https://catalog.offline.test';
const products = Array.from({ length: 67 }, (_, index) => ({
  id: `resource-${index}`, slug: `resource-${index}`, name: `Resource ${String(index).padStart(2, '0')}`,
  shortDescription: 'A useful creative resource',
  category: ['WordPress Plugins', 'Software', 'Courses'][index % 3],
  price: index === 65 ? 499.5 : index === 66 ? 999.5 : index * 25,
  compareAtPrice: index % 5 === 0 ? index * 25 + 100 : undefined,
  deliveryType: ['instant-download', 'license-key', 'subscription', 'manual-delivery'][index % 4],
  featured: index % 4 === 0, newProduct: index > 60, tags: ['creative'],
}));

const mocks = {
  '@/components/layout/Layout': 'export function Layout({ children }) { return <main>{children}</main>; }',
  '@/components/cards/ProductCard': `import { Link } from 'react-router-dom';
    export function ProductCard({ product }) { return <article className="qa-product" data-id={product.id} data-price={product.price}><Link to={'/products/' + product.slug}>{product.name}</Link></article>; }`,
  '@/hooks/useCatalog': `const products = ${JSON.stringify(products)};
    export function usePublishedProducts() { return { data: products, loading: false, error: false, retry() {} }; }`,
  '@/context/SiteSettingsContext': `export function useSiteSettings() { return {
    siteSettings: { currency_code: 'BDT', currency_symbol: 'Tk' },
    seoSettings: { default_meta_description: 'Offline catalog', default_og_image_url: '' }
  }; }`,
  '@/lib/seo': 'export function applySeo() {}',
  '@/lib/tracking': 'export function trackSearch(term) { (window.__searches ||= []).push(term); }',
};
const bundle = await build({
  absWorkingDir: root, bundle: true, write: false, format: 'iife', platform: 'browser',
  tsconfig: 'tsconfig.app.json',
  define: { 'process.env.NODE_ENV': '"production"' }, loader: { '.css': 'empty' }, logLevel: 'silent',
  stdin: {
    sourcefile: 'catalog-offline-entry.tsx', resolveDir: root, loader: 'tsx',
    contents: `import { createRoot } from 'react-dom/client';
      import { BrowserRouter, Routes, Route } from 'react-router-dom';
      import { ProductsPage } from './src/pages/ProductsPage';
      createRoot(document.getElementById('root')).render(<BrowserRouter><Routes>
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/deals" element={<ProductsPage dealsOnly />} />
        <Route path="/products/:slug" element={<p>Offline product detail</p>} />
      </Routes></BrowserRouter>);`,
  },
  plugins: [{
    name: 'offline-catalog-adapters',
    setup(builder) {
      builder.onResolve({ filter: /^@\// }, ({ path }) => path in mocks ? { path, namespace: 'catalog-mock' } : undefined);
      builder.onLoad({ filter: /.*/, namespace: 'catalog-mock' }, ({ path }) => ({ contents: mocks[path], loader: 'jsx', resolveDir: root }));
    },
  }],
});
const html = `<!doctype html><html><body><div id="root"></div><script>${bundle.outputFiles[0].text.replace(/<\/script/gi, '<\\/script')}</script></body></html>`;

// Verify malformed shared links and route defaults directly, too.
const helperBundle = await build({ absWorkingDir: root, entryPoints: ['src/lib/catalogFilters.ts'], bundle: true, write: false, platform: 'node', format: 'esm', logLevel: 'silent' });
const { readCatalogQuery, updateCatalogQuery, catalogSearchTerms } = await import(`data:text/javascript;base64,${Buffer.from(helperBundle.outputFiles[0].text).toString('base64')}`);
const parsed = readCatalogQuery(new URLSearchParams('category=plugins,plugins,,software&type=subscription,bad,subscription&price=0,0,-1,3,9&sort=price-desc&page=3&q=WordPress'));
assert.deepEqual(parsed.categories, ['plugins', 'software']);
assert.deepEqual(parsed.types, ['subscription']);
assert.deepEqual(parsed.priceRanges, [0, 3]);
assert.equal(parsed.sort, 'price-desc');
assert.equal(parsed.page, 3);
assert.equal(parsed.search, 'WordPress');
assert.equal(readCatalogQuery(new URLSearchParams('deals=false'), { dealsOnly: true }).dealsOnly, false);
assert.deepEqual(readCatalogQuery(new URLSearchParams('category=all'), { category: 'courses' }).categories, []);
for (const page of ['-1', '0', 'Infinity', '1.5', '9007199254740993', 'abc']) assert.equal(readCatalogQuery(new URLSearchParams({ page })).page, 1);
const changed = updateCatalogQuery(new URLSearchParams('page=4&q=old&utm_source=test&type=subscription'), { search: 'new' });
assert.equal(changed.get('page'), null);
assert.equal(changed.get('q'), null);
assert.equal(changed.get('utm_source'), 'test');
assert.equal(changed.get('type'), 'subscription');
assert.deepEqual(catalogSearchTerms('  WORDPRESS   plugin  '), ['wordpress', 'plugin']);
assert.deepEqual(catalogSearchTerms('\uff37\uff4f\uff52\uff44\uff30\uff52\uff45\uff53\uff53'), ['wordpress']);
console.log('PASS malformed URL validation, route defaults, query reset and Unicode normalization');

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
const blockedRequests = [];
page.on('pageerror', (error) => errors.push(error.message));
await page.route('**/*', async (route) => {
  if (route.request().isNavigationRequest() && new URL(route.request().url()).origin === origin) {
    await route.fulfill({ status: 200, contentType: 'text/html', body: html });
  } else {
    blockedRequests.push(route.request().url());
    await route.abort();
  }
});
await page.addInitScript(() => {
  window.__scrollTargets = [];
  Element.prototype.scrollIntoView = function () { window.__scrollTargets.push(this.id); };
});
const params = () => new URL(page.url()).searchParams;
async function cardCount(expected) {
  await page.waitForFunction((count) => document.querySelectorAll('.qa-product').length === count, expected);
  assert.equal(await page.locator('.qa-product').count(), expected);
}
async function open(path) {
  await page.goto(origin + path, { waitUntil: 'load' });
  await page.locator('.catalog-toolbar').waitFor();
}
async function check(name, test) {
  await test();
  console.log(`PASS ${name}`);
}

try {
  await check('category/type filters create restorable Back and Forward history', async () => {
    await open('/products');
    await page.getByRole('button', { name: 'Software & Tools', exact: true }).click();
    assert.equal(params().get('category'), 'software');
    const type = page.getByRole('complementary').getByRole('button', { name: 'Subscription', exact: true });
    await type.click();
    assert.equal(params().get('type'), 'subscription');
    await page.goBack();
    await page.waitForFunction(() => !new URLSearchParams(location.search).has('type'));
    assert.equal(params().get('category'), 'software');
    assert.equal(await type.getAttribute('aria-pressed'), 'false');
    await page.goForward();
    await page.waitForFunction(() => new URLSearchParams(location.search).get('type') === 'subscription');
    assert.equal(await type.getAttribute('aria-pressed'), 'true');
  });

  await check('multi-word search persists through refresh and Enter explores results', async () => {
    await open('/products');
    const search = page.getByRole('searchbox', { name: 'Search products' });
    await search.fill('  SOFTWARE  resource ');
    assert.equal(params().get('search'), '  SOFTWARE  resource ');
    await cardCount(products.filter((item) => item.category === 'Software').length);
    await search.press('Enter');
    assert.ok((await page.evaluate(() => window.__scrollTargets)).includes('catalog-results'));
    await page.reload({ waitUntil: 'load' });
    assert.equal(await search.inputValue(), '  SOFTWARE  resource ');
    await cardCount(products.filter((item) => item.category === 'Software').length);
    await page.getByRole('button', { name: 'Clear search', exact: true }).click();
    assert.equal(params().get('search'), null);
    await cardCount(30);
  });

  await check('sort/page links restore after visiting a product and refreshing', async () => {
    await open('/products?sort=price-desc&page=2');
    assert.equal(await page.getByRole('combobox', { name: 'Sort products' }).inputValue(), 'price-desc');
    const expected = [...products].sort((a, b) => b.price - a.price).slice(30, 60).map((item) => item.id);
    assert.deepEqual(await page.locator('.qa-product').evaluateAll((cards) => cards.map((card) => card.dataset.id)), expected);
    await page.locator('.qa-product a').first().click();
    await page.getByText('Offline product detail').waitFor();
    await page.goBack();
    await page.locator('.catalog-toolbar').waitFor();
    assert.equal(params().get('page'), '2');
    assert.deepEqual(await page.locator('.qa-product').evaluateAll((cards) => cards.map((card) => card.dataset.id)), expected);
    await page.reload({ waitUntil: 'load' });
    assert.equal(params().get('sort'), 'price-desc');
    assert.equal(params().get('page'), '2');
    await page.getByRole('navigation', { name: 'Pagination', exact: true }).getByRole('button', { name: '3', exact: true }).click();
    assert.equal(params().get('page'), '3');
    await cardCount(7);
    await page.getByRole('combobox', { name: 'Sort products' }).selectOption('price-asc');
    assert.equal(params().get('page'), null);
  });

  await check('price ranges keep fractional prices and clamp excessive pages', async () => {
    await open('/products?sort=price-asc');
    const priceButtons = page.getByRole('heading', { name: 'Price Range', exact: true }).locator('..').getByRole('button');
    await priceButtons.nth(0).click();
    assert.equal(params().get('price'), '0');
    await cardCount(products.filter((item) => item.price < 500).length);
    assert.equal(await page.locator('.qa-product[data-id="resource-65"]').count(), 1);
    await page.reload({ waitUntil: 'load' });
    assert.equal(await priceButtons.nth(0).getAttribute('aria-pressed'), 'true');
    assert.equal(params().get('price'), '0');
    await open('/products?price=1&sort=price-asc&page=999');
    await page.waitForFunction(() => !new URLSearchParams(location.search).has('page'));
    assert.equal(params().get('price'), '1');
    assert.equal(await page.locator('.qa-product[data-id="resource-66"]').count(), 1);
    const prices = await page.locator('.qa-product').evaluateAll((cards) => cards.map((card) => Number(card.dataset.price)));
    assert.ok(prices.every((price) => price >= 500 && price < 1000));
    assert.deepEqual(prices, [...prices].sort((a, b) => a - b));
  });

  await check('/deals can disable offers and Clear All resets every filter', async () => {
    await open('/deals');
    await cardCount(products.filter((item) => item.compareAtPrice > item.price).length);
    await page.locator('.catalog-active-filters button').first().click();
    assert.equal(params().get('deals'), 'false');
    await cardCount(30);
    await page.reload({ waitUntil: 'load' });
    await cardCount(30);
    await open('/deals?category=software&type=license-key&price=0&sort=price-desc');
    await page.getByRole('button', { name: 'Clear All Filters', exact: true }).click();
    assert.equal(params().get('deals'), 'false');
    for (const key of ['category', 'type', 'price', 'sort', 'search', 'page']) assert.equal(params().get(key), null);
    await cardCount(30);
  });

  assert.deepEqual(errors, [], 'browser runtime errors');
  assert.deepEqual(blockedRequests, [], 'unexpected external requests');
  console.log('Catalog offline QA passed. No server or external requests used.');
} finally {
  await browser.close();
}
