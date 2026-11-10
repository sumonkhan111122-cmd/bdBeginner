// Offline cart regression checks: browser requests are intercepted and pricing is mocked.
// No server, credentials, database calls, or production changes are involved.
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { chromium } from 'playwright';

const helperBundle = await build({ entryPoints: ['src/lib/cartStorage.ts'], bundle: true, write: false, platform: 'node', format: 'esm', logLevel: 'silent' });
const storage = await import(`data:text/javascript;base64,${Buffer.from(helperBundle.outputFiles[0].text).toString('base64')}`);
const seed = { productId: 'test-product', name: 'Test resource', price: 100, quantity: 1, slug: 'test-resource', icon: 'Package', deliveryType: 'instant-download' };
assert.deepEqual(storage.parseStoredCart('{broken'), []);
assert.deepEqual(storage.parseStoredCart('{}'), []);
assert.deepEqual(storage.parseStoredCart(JSON.stringify([{ ...seed, quantity: 0 }, { ...seed, price: -1 }])), []);
assert.equal(storage.parseStoredCart(JSON.stringify([{ ...seed, quantity: 2.8 }, seed]))[0].quantity, 3);
assert.equal(storage.parseStoredCart(JSON.stringify([{ ...seed, deliveryType: 'invalid' }]))[0].deliveryType, 'instant-download');
assert.equal(storage.parseStoredCart(JSON.stringify([{ ...seed, productId: 'a0000001-0000-0000-0000-000000000001' }]))[0].productId, 'a0000001-0000-4000-8000-000000000001');
for (const invalid of [NaN, Infinity, -Infinity, 0, -2, Number.MAX_SAFE_INTEGER + 1]) assert.equal(storage.normalizeCartQuantity(invalid), null);
assert.equal(storage.normalizeCartQuantity(2.9), 2);
assert.equal(storage.normalizeCoupon('  save10  '), 'SAVE10');

const harness = await build({
  stdin: {
    contents: `
      import React from 'react';
      import { createRoot } from 'react-dom/client';
      import { MemoryRouter } from 'react-router-dom';
      import { CartProvider, useCart } from './src/context/CartContext';
      import { CartDrawer } from './src/components/cart/CartDrawer';
      window.__pricingCalls = [];
      function Harness() {
        const cart = useCart();
        window.__cart = cart;
        return <><button id="open-cart" onClick={cart.openCart}>Open cart</button><CartDrawer /></>;
      }
      createRoot(document.getElementById('root')).render(<MemoryRouter><CartProvider><Harness /></CartProvider></MemoryRouter>);
    `,
    resolveDir: process.cwd(), loader: 'tsx', sourcefile: 'cart-harness.tsx',
  },
  bundle: true, write: false, format: 'iife', logLevel: 'silent', tsconfig: 'tsconfig.app.json',
  define: { 'process.env.NODE_ENV': '"test"' },
  plugins: [{ name: 'offline-cart-dependencies', setup(builder) {
    builder.onResolve({ filter: /^@\/(services\/pricing|lib\/tracking|hooks\/useCurrency)$/ }, ({ path }) => ({ path, namespace: 'offline-cart' }));
    builder.onLoad({ filter: /.*/, namespace: 'offline-cart' }, ({ path }) => ({ loader: 'js', contents:
      path.includes('pricing')
        ? `export function calculateCheckoutPricing(input) { return new Promise((resolve, reject) => window.__pricingCalls.push({ input, resolve, reject })); } export function friendlyPricingError(error) { return error.message || 'Pricing unavailable'; }`
        : path.includes('useCurrency') ? `export function useCurrencyFormatter() { return value => String(value); }`
        : `export function trackAddToCart() {}`,
    }));
  } }],
});
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const errors = [];
await context.route('**/*', route => route.fulfill({ contentType: 'text/html', body: '<html><body><div id="root"></div></body></html>' }));
const mount = async page => {
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('https://offline-cart.test/');
  await page.addScriptTag({ content: harness.outputFiles[0].text });
  await page.waitForFunction(() => Boolean(window.__cart));
};
const read = page => page.evaluate(() => ({ count: window.__cart.count, coupon: window.__cart.couponCode, pricing: window.__cart.pricing, loading: window.__cart.pricingLoading }));
const price = (total, discountSource = null) => ({ subtotal: total, total, discountTotal: 0, currencyCode: 'BDT', discountSource, discountCode: discountSource ? 'SAVE' : null, discountName: null });
try {
  const page = await context.newPage();
  await page.addInitScript(({ seed, key }) => sessionStorage.setItem(key, JSON.stringify([seed])), { seed, key: storage.CART_KEY });
  await mount(page);
  assert.equal((await read(page)).count, 1);
  assert.equal(await page.evaluate(key => sessionStorage.getItem(key), storage.CART_KEY), null, 'legacy session cart migrates');
  await page.waitForFunction(() => window.__pricingCalls.length === 1);
  await page.evaluate(() => window.__cart.updateQuantity('test-product', 2));
  await page.evaluate(result => window.__pricingCalls[0].resolve(result), price(100));
  assert.equal((await read(page)).pricing, null, 'old prices cannot overwrite a changed cart');
  await page.waitForFunction(() => window.__pricingCalls.length === 2);
  await page.evaluate(() => window.__cart.clearCart());
  await page.evaluate(result => window.__pricingCalls[1].resolve(result), price(200));
  assert.deepEqual(await read(page), { count: 0, coupon: null, pricing: null, loading: false }, 'late prices cannot resurrect a cleared cart');

  await page.evaluate(seed => window.__cart.addItem({ ...seed, id: seed.productId }, 1, false), seed);
  await page.evaluate(() => { window.__cart.updateQuantity('test-product', NaN); window.__cart.updateQuantity('test-product', Infinity); });
  assert.equal((await read(page)).count, 1);
  await page.locator('#open-cart').click();
  await page.waitForFunction(() => document.activeElement?.getAttribute('aria-label') === 'Close cart');
  assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden');
  await page.keyboard.press('Shift+Tab');
  assert.equal(await page.evaluate(() => document.activeElement?.textContent?.trim()), 'Continue Shopping');
  await page.keyboard.press('Escape');
  assert.equal(await page.evaluate(() => document.activeElement?.id), 'open-cart');
  assert.equal(await page.evaluate(() => document.querySelector('[role="dialog"]').inert), true);
  assert.equal(await page.evaluate(() => document.body.style.overflow), '');

  await page.evaluate(() => { window.__couponResult = undefined; window.__cart.applyCoupon(' save ').then(result => { window.__couponResult = result; }); });
  let couponCall = await page.evaluate(() => window.__pricingCalls.length - 1);
  await page.evaluate(() => window.__cart.updateQuantity('test-product', 2));
  await page.evaluate(({ index, result }) => window.__pricingCalls[index].resolve(result), { index: couponCall, result: price(50, 'coupon') });
  await page.waitForFunction(() => typeof window.__couponResult === 'string');
  assert.equal((await read(page)).coupon, null, 'coupon validation for an older cart is discarded');

  await page.evaluate(() => { window.__couponResult = undefined; window.__cart.applyCoupon(' save ').then(result => { window.__couponResult = result; }); });
  couponCall = await page.evaluate(() => window.__pricingCalls.length - 1);
  await page.evaluate(({ index, result }) => window.__pricingCalls[index].resolve(result), { index: couponCall, result: price(150, 'coupon') });
  await page.waitForFunction(() => window.__couponResult === null);
  assert.equal((await read(page)).coupon, 'SAVE');
  const callsAfterCoupon = await page.evaluate(() => window.__pricingCalls.length);
  await page.waitForTimeout(400);
  assert.equal(await page.evaluate(() => window.__pricingCalls.length), callsAfterCoupon, 'successful coupons do not trigger a duplicate pricing call');

  await page.evaluate(() => window.__cart.updateQuantity('test-product', 3));
  await page.waitForFunction(count => window.__pricingCalls.length > count, callsAfterCoupon);
  await page.evaluate(() => window.__pricingCalls.at(-1).reject(new Error('Network unavailable')));
  await page.waitForFunction(() => !window.__cart.pricingLoading);
  assert.equal((await read(page)).coupon, 'SAVE', 'temporary network failures preserve the coupon');
  await page.evaluate(() => window.__cart.updateQuantity('test-product', 2));

  const second = await context.newPage();
  await mount(second);
  assert.equal((await read(second)).count, 2, 'cart survives opening another tab');
  await second.evaluate(() => window.__cart.updateQuantity('test-product', 4));
  await page.waitForFunction(() => window.__cart.count === 4);
  await second.evaluate(() => window.__cart.clearCart());
  await page.waitForFunction(() => window.__cart.count === 0 && window.__cart.couponCode === null);
  await page.reload();
  await page.addScriptTag({ content: harness.outputFiles[0].text });
  await page.waitForFunction(() => Boolean(window.__cart));
  assert.equal((await read(page)).count, 0, 'old session carts do not return after clearing');

  const blocked = await context.newPage();
  await blocked.addInitScript(() => {
    for (const key of ['localStorage', 'sessionStorage']) Object.defineProperty(window, key, { get() { throw new Error('Storage blocked'); } });
  });
  await mount(blocked);
  await blocked.evaluate(seed => window.__cart.addItem({ ...seed, id: seed.productId }, 1, false), seed);
  assert.equal((await read(blocked)).count, 1, 'blocked storage cannot crash shopping');
  assert.deepEqual(errors, [], 'no browser runtime errors');
  console.log('PASS: cart sanitization, legacy migration, storage restrictions, durable/cross-tab cart, stale pricing, coupon races, drawer focus and Escape. All checks ran offline.');
} finally {
  await browser.close();
}
