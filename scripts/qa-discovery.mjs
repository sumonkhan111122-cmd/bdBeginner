// Offline browser checks of the real discovery provider. No server or backend is used.
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { chromium } from 'playwright';

const bundled = await build({
  stdin: {
    contents: `
      import React from 'react';
      import { createRoot } from 'react-dom/client';
      import { DiscoveryProvider, useDiscovery } from '@/context/DiscoveryContext';
      import * as local from '@/services/discoveryLocal';
      function Probe() { window.discovery = useDiscovery(); return null; }
      const root = createRoot(document.getElementById('root'));
      window.discoveryLocal = local;
      window.renderDiscovery = () => root.render(<DiscoveryProvider><Probe /></DiscoveryProvider>);
      window.renderDiscovery();
    `,
    resolveDir: process.cwd(), loader: 'tsx',
  },
  bundle: true, write: false, format: 'iife', platform: 'browser', logLevel: 'silent', tsconfig: 'tsconfig.app.json',
  plugins: [{
    name: 'offline-discovery-adapters',
    setup(builder) {
      builder.onResolve({ filter: /^@\/(context\/CustomerAuthContext|services\/discoveryDb|lib\/tracking)$/ }, ({ path }) => ({ path, namespace: 'discovery-test' }));
      builder.onLoad({ filter: /.*/, namespace: 'discovery-test' }, ({ path }) => ({
        contents: path.includes('CustomerAuthContext')
          ? 'export function useCustomerAuth() { return window.authState; }'
          : path.includes('tracking')
            ? 'export function trackAddToWishlist() {}'
            : ['fetchWishlist', 'addToWishlistDb', 'removeFromWishlistDb', 'mergeGuestWishlistDb', 'fetchRecentlyViewed', 'addToRecentlyViewedDb', 'clearRecentlyViewedDb', 'mergeGuestRecentlyViewedDb']
              .map(name => `export const ${name} = (...args) => window.discoveryDb.${name}(...args);`).join('\n'),
        loader: 'js',
      }));
    },
  }],
});

const browser = await chromium.launch({ headless: true });
let passed = 0;
try {
  const page = await browser.newPage();
  let networkRequests = 0;
  await page.route('**/*', route => { networkRequests++; return route.abort(); });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setContent('<div id="root"></div>');
  await page.evaluate(() => {
    window.storage = new Map();
    Object.defineProperty(window, 'localStorage', { configurable: true, value: {
      getItem: key => window.storage.get(key) ?? null,
      setItem: (key, value) => window.storage.set(key, value),
      removeItem: key => window.storage.delete(key),
    } });
    window.authState = { session: null, loading: false };
    window.discoveryDb = {
      fetchWishlist: async () => [], fetchRecentlyViewed: async () => [],
      addToWishlistDb: async () => true, removeFromWishlistDb: async () => true,
      mergeGuestWishlistDb: async () => true, mergeGuestRecentlyViewedDb: async () => true,
      addToRecentlyViewedDb: async () => true, clearRecentlyViewedDb: async () => true,
    };
  });
  await page.addScriptTag({ content: bundled.outputFiles[0].text });
  await page.waitForFunction(() => window.discovery && !window.discovery.loading);
  const check = async (name, test) => { await test(); passed++; console.log(`PASS ${name}`); };
  const signIn = async id => {
    await page.evaluate(id => {
      window.authState = { session: id ? { user: { id } } : null, loading: false };
      window.renderDiscovery();
    }, id);
    await page.waitForFunction(() => !window.discovery.loading);
    // Let both the provider and its effects finish committing the auth transition.
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  };

  await check('corrupt stored lists are sanitized and recent history is bounded', async () => {
    const ids = await page.evaluate(() => {
      const local = window.discoveryLocal;
      window.storage.set(local.WISHLIST_KEY, JSON.stringify(['one', ' one ', null, 4, '', {}, 'two']));
      window.storage.set(local.RECENTLY_VIEWED_KEY, JSON.stringify(Array.from({ length: 20 }, (_, i) => `product-${i}`)));
      return { wishlist: local.getGuestWishlist(), recent: local.getGuestRecentlyViewed() };
    });
    assert.deepEqual(ids.wishlist, ['one', 'two']);
    assert.equal(ids.recent.length, 12);
  });

  await check('guest lists update when another tab changes storage', async () => {
    await page.evaluate(() => window.dispatchEvent(new StorageEvent('storage', { key: window.discoveryLocal.WISHLIST_KEY })));
    await page.waitForFunction(() => window.discovery.wishlistIds.join(',') === 'one,two');
  });

  await check('failed login merges retain guest data', async () => {
    await page.evaluate(() => {
      window.discoveryDb.mergeGuestWishlistDb = async () => false;
      window.discoveryDb.mergeGuestRecentlyViewedDb = async () => false;
    });
    await signIn('customer-a');
    const guest = await page.evaluate(() => ({ wishlist: window.discoveryLocal.getGuestWishlist(), recent: window.discoveryLocal.getGuestRecentlyViewed() }));
    assert.deepEqual(guest.wishlist, ['one', 'two']);
    assert.equal(guest.recent.length, 12);
  });

  await check('duplicate wishlist controls share one pending mutation and rollback failures', async () => {
    await page.evaluate(() => {
      window.addCalls = 0;
      window.discoveryDb.addToWishlistDb = () => { window.addCalls++; return new Promise(resolve => { window.finishAdd = resolve; }); };
      window.discovery.toggleWishlist('new-product');
      window.discovery.toggleWishlist('new-product');
    });
    await page.waitForFunction(() => window.discovery.wishlistIds.includes('new-product'));
    assert.equal(await page.evaluate(() => window.addCalls), 1);
    await page.evaluate(() => window.finishAdd(false));
    await page.waitForFunction(() => !window.discovery.wishlistIds.includes('new-product'));
  });

  await check('an old account mutation cannot overwrite the new account list', async () => {
    await page.evaluate(() => { void window.discovery.toggleWishlist('old-account-product'); });
    await page.waitForFunction(() => window.discovery.wishlistIds.includes('old-account-product'));
    await page.evaluate(() => { window.discoveryDb.fetchWishlist = async () => [{ product_id: 'new-account-product' }]; });
    await signIn('customer-b');
    await page.evaluate(() => window.finishAdd(false));
    assert.deepEqual(await page.evaluate(() => window.discovery.wishlistIds), ['new-account-product']);
  });

  await check('failed history clear restores the visible history', async () => {
    await page.evaluate(() => {
      window.discoveryDb.clearRecentlyViewedDb = async () => false;
      window.discoveryDb.addToRecentlyViewedDb = async () => true;
    });
    await page.evaluate(() => window.discovery.addRecentlyViewed('viewed-product'));
    await page.evaluate(() => window.discovery.clearRecentlyViewed());
    await page.waitForFunction(() => window.discovery.recentlyViewedIds.includes('viewed-product'));
  });

  await check('blocked browser storage does not break clearing or saving', async () => {
    const result = await page.evaluate(() => {
      const storage = window.localStorage;
      Object.defineProperty(window, 'localStorage', { configurable: true, get() { throw new Error('Storage blocked'); } });
      const local = window.discoveryLocal;
      local.clearGuestWishlist(); local.clearGuestRecentlyViewed();
      local.setGuestWishlist(['one']); local.setGuestRecentlyViewed(['one']);
      const result = [local.getGuestWishlist(), local.getGuestRecentlyViewed()];
      Object.defineProperty(window, 'localStorage', { configurable: true, value: storage });
      return result;
    });
    assert.deepEqual(result, [[], []]);
  });

  await check('successful merges preserve guest additions made by another tab', async () => {
    await signIn(null);
    await page.evaluate(() => {
      window.discoveryLocal.setGuestWishlist(['merge-me']);
      window.discoveryLocal.setGuestRecentlyViewed([]);
      window.discoveryDb.mergeGuestWishlistDb = async () => {
        window.discoveryLocal.setGuestWishlist(['merge-me', 'other-tab-addition']);
        return true;
      };
    });
    await signIn('customer-c');
    assert.deepEqual(await page.evaluate(() => window.discoveryLocal.getGuestWishlist()), ['other-tab-addition']);
  });

  await check('views made before authentication finishes are kept', async () => {
    await page.evaluate(() => {
      window.authState = { session: null, loading: true };
      window.renderDiscovery();
    });
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    await page.evaluate(() => window.discovery.addRecentlyViewed('viewed-during-auth'));
    await signIn(null);
    assert.ok(await page.evaluate(() => window.discovery.recentlyViewedIds.includes('viewed-during-auth')));
  });

  assert.deepEqual(errors, [], 'No uncaught browser errors');
  assert.equal(networkRequests, 0, 'All checks run without network requests');
  console.log(`${passed} discovery checks passed; zero network requests.`);
} finally {
  await browser.close();
}
