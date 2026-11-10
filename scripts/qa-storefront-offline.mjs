// Real React components in local Chromium. No server, credentials, or external requests.
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { chromium } from 'playwright';

const project = fileURLToPath(new URL('../', import.meta.url));
const mocks = {
  '@/context/CartContext': 'export const useCart = () => ({ count: 0, openCart() {}, isOpen: false });',
  '@/context/CustomerAuthContext': 'export const useCustomerAuth = () => ({ session: null });',
  '@/context/SiteSettingsContext': 'export const useSiteSettings = () => ({ siteSettings: { site_name: "bdBeginner" } });',
  '@/components/cart/CartDrawer': 'export const CartDrawer = () => null;',
  '@/services/catalog': `
    const request = (kind, key) => new Promise((resolve, reject) => window.requests.push({ kind, key, resolve, reject }));
    export const getProductBySlugFromCatalog = slug => request('product', slug);
    export const getRelatedProductsFromCatalog = product => request('related', product.id);
    export const getCategories = () => request('categories');
    export const getPublishedProducts = () => request('published');
    export const getFeaturedProductsFromCatalog = () => request('featured');
  `,
};
const bundle = await build({
  absWorkingDir: project,
  tsconfig: 'tsconfig.app.json',
  stdin: { contents: `
    import React, { useState } from 'react';
    import { createRoot } from 'react-dom/client';
    import { MemoryRouter, useLocation } from 'react-router-dom';
    import { Header } from '@/components/layout/Header';
    import { FaqAccordion } from '@/components/FaqAccordion';
    import { useProduct, useRelatedProducts } from '@/hooks/useCatalog';
    import { sharePendingRequest } from '@/lib/pendingRequests';
    const root = createRoot(document.getElementById('root'));
    window.requests = [];
    function Probe() {
      const [slug, setSlug] = useState('first');
      const [relatedProduct, setRelated] = useState(null);
      const product = useProduct(slug);
      const related = useRelatedProducts(relatedProduct);
      window.probe = { product, related, setSlug, setRelated };
      return <div>Catalog probe</div>;
    }
    function Location() { const location = useLocation(); return <output id="location">{location.pathname + location.search}</output>; }
    const items = [{ question: 'First question', answer: 'First answer' }, { question: 'Second question', answer: 'Second answer' }];
    window.mount = view => root.render(view === 'hooks' ? <Probe /> : view === 'header' ?
      <MemoryRouter><Header /><Location /><button id="outside">Outside header</button></MemoryRouter> :
      <><FaqAccordion items={items} /><FaqAccordion items={items} /></>);
    window.testPending = async () => {
      let calls = 0, resolve;
      const load = () => { calls++; return new Promise(done => { resolve = done; }); };
      const first = sharePendingRequest('same', load);
      const second = sharePendingRequest('same', load);
      await Promise.resolve();
      const shared = first === second && calls === 1;
      resolve('done');
      await first;
      const fresh = await sharePendingRequest('same', async () => { calls++; return 'fresh'; });
      await sharePendingRequest('failure', async () => { throw new Error('expected'); }).catch(() => {});
      const retried = await sharePendingRequest('failure', async () => 'retried');
      return { shared, fresh, calls, retried };
    };
  `, resolveDir: project, loader: 'tsx' },
  bundle: true, write: false, format: 'iife', jsx: 'automatic',
  plugins: [{ name: 'offline-fixtures', setup(plugin) {
    plugin.onResolve({ filter: /^@\// }, args => args.path in mocks ? { path: args.path, namespace: 'fixtures' } : undefined);
    plugin.onLoad({ filter: /.*/, namespace: 'fixtures' }, args => ({ contents: mocks[args.path], loader: 'js' }));
  } }],
});

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  const errors = [];
  let blockedRequests = 0;
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', route => { blockedRequests++; return route.abort(); });
  await page.setContent('<!doctype html><html><body><div id="root"></div></body></html>');
  await page.addScriptTag({ content: bundle.outputFiles[0].text });

  assert.deepEqual(await page.evaluate(() => window.testPending()), { shared: true, fresh: 'fresh', calls: 2, retried: 'retried' });

  await page.evaluate(() => window.mount('hooks'));
  await page.waitForFunction(() => window.requests.some(r => r.key === 'first'));
  await page.evaluate(() => window.probe.setSlug('second'));
  await page.waitForFunction(() => window.requests.some(r => r.key === 'second'));
  assert.equal(await page.evaluate(() => window.probe.product.data), null);
  await page.evaluate(() => window.requests.find(r => r.key === 'second').resolve({ id: 'second', name: 'Second product' }));
  await page.waitForFunction(() => window.probe.product.data?.id === 'second');
  await page.evaluate(() => window.requests.find(r => r.key === 'first').resolve({ id: 'first' }));
  await page.waitForTimeout(30);
  assert.equal(await page.evaluate(() => window.probe.product.data.id), 'second');
  await page.evaluate(() => window.probe.setRelated({ id: 'second', category: 'Tools' }));
  await page.waitForFunction(() => window.requests.some(r => r.kind === 'related' && r.key === 'second'));
  await page.evaluate(() => window.requests.find(r => r.kind === 'related' && r.key === 'second').resolve([{ id: 'recommended' }]));
  await page.waitForFunction(() => window.probe.related.data[0]?.id === 'recommended');
  await page.evaluate(() => window.probe.setSlug('failure'));
  await page.waitForFunction(() => window.requests.some(r => r.key === 'failure'));
  await page.evaluate(() => window.requests.find(r => r.key === 'failure').reject(new Error('Expected offline failure')));
  await page.waitForFunction(() => window.probe.product.error);
  await page.evaluate(() => window.probe.product.retry());
  await page.waitForFunction(() => window.requests.filter(r => r.key === 'failure').length === 2);
  await page.evaluate(() => window.requests.filter(r => r.key === 'failure')[1].resolve({ id: 'recovered' }));
  await page.waitForFunction(() => window.probe.product.data?.id === 'recovered');

  await page.evaluate(() => window.mount('header'));
  await page.getByRole('button', { name: 'Open search', exact: true }).waitFor();
  await page.keyboard.press('/');
  await page.getByRole('searchbox').waitFor();
  assert.equal(await page.getByRole('searchbox').evaluate(el => el === document.activeElement), true);
  await page.getByRole('searchbox').fill('WordPress tools');
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => document.querySelector('#location').textContent === '/products?search=WordPress%20tools');
  await page.keyboard.press('Control+k');
  await page.getByRole('searchbox').waitFor();
  assert.equal(await page.getByRole('searchbox').inputValue(), 'WordPress tools');
  await page.keyboard.press('Escape');
  assert.equal(await page.getByRole('button', { name: 'Open search', exact: true }).evaluate(el => el === document.activeElement), true);
  await page.getByRole('button', { name: 'Open menu', exact: true }).click();
  await page.getByRole('navigation', { name: 'Mobile navigation' }).waitFor();
  await page.getByRole('button', { name: 'Open search', exact: true }).click();
  assert.equal(await page.getByRole('navigation', { name: 'Mobile navigation' }).count(), 0);
  await page.locator('#outside').click();
  assert.equal(await page.getByRole('searchbox').count(), 0);

  await page.evaluate(() => window.mount('faq'));
  const firstQuestion = page.getByRole('button', { name: 'First question', exact: true }).first();
  await firstQuestion.waitFor();
  const ids = await page.locator('[id]').evaluateAll(nodes => nodes.map(node => node.id));
  assert.equal(ids.length, new Set(ids).size, 'Accordion instances have unique IDs');
  await firstQuestion.focus();
  await page.keyboard.press('ArrowDown');
  assert.equal(await page.evaluate(() => document.activeElement.textContent), 'Second question');
  await page.keyboard.press('Home');
  assert.equal(await firstQuestion.evaluate(el => el === document.activeElement), true);
  await page.keyboard.press('Enter');
  assert.equal(await firstQuestion.getAttribute('aria-expanded'), 'false');

  assert.deepEqual(errors, []);
  assert.equal(blockedRequests, 0);
  console.log('PASS: concurrent reads/retry, product navigation/races, related data, search shortcuts/navigation, exclusive menus, FAQ keyboard/IDs. No network requests or server.');
} finally {
  await browser.close();
}
