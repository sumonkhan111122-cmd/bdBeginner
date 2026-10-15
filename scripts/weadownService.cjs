const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const { fetchHtml, parseProductPage } = require('./weadownParser.cjs');

const parseEnv = (content) => content.split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=');
  if (key && val.length) acc[key.trim()] = val.join('=').trim();
  return acc;
}, {});

let envLocal = {};
try { envLocal = parseEnv(fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf-8')); } catch(e) {}
let env = {};
try { env = parseEnv(fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf-8')); } catch(e) {}

const mergedEnv = { ...env, ...envLocal };
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || mergedEnv.VITE_SUPABASE_URL || 'https://ldmpxupslnfgzmmtpyat.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || mergedEnv.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;
if (SERVICE_KEY) {
  supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

const CATEGORIES = {
  'WordPress': 'c7e89885-df81-4d5e-8353-70990cc57041',
  'Software': '4c9fd83b-2ead-488b-8652-4eff6b87c212',
  'AI Tools': '46e77cdb-bc84-4658-b6f1-3af0b9833a6d',
  'Courses': '9658a4a6-c141-433a-8e0a-964a081b3455',
  'Digital Resources': 'd7ac2ba6-4368-4adf-b314-d7e6b4c14956',
  'Web Services': 'dd5fe544-7b50-46d0-8d9b-4ed4588f6c8f'
};

async function getProductUrls(sourceUrl, limit = 50) {
  let normalized = (sourceUrl || '').trim();
  if (!normalized) normalized = 'https://weadown.com/wordpress-theme/';

  // 1. Single product URL
  if (/\/res\/[a-z0-9\-]+\/?/i.test(normalized)) {
    const cleaned = normalized.endsWith('/') ? normalized : normalized + '/';
    return [cleaned];
  }

  // 2. Specific Sitemap URL
  if (normalized.endsWith('.xml')) {
    const xml = await fetchHtml(normalized);
    const matches = xml.match(/<loc>(https:\/\/weadown\.com\/res\/[a-z0-9\-]+\/?)<\/loc>/gi) || [];
    const urls = matches.map(m => m.replace(/<\/?loc>/gi, '').trim());
    return [...new Set(urls)].slice(0, limit);
  }

  const cleanUrls = new Set();

  // If high limit (> 60) and requesting from homepage or sitemap
  if (limit > 60 && (normalized === 'https://weadown.com/' || normalized === 'https://weadown.com')) {
    let sitemapIndex = 1;
    while (cleanUrls.size < limit && sitemapIndex <= 10) {
      try {
        const sitemapUrl = `https://weadown.com/post-sitemap${sitemapIndex}.xml`;
        const xml = await fetchHtml(sitemapUrl);
        const matches = xml.match(/<loc>(https:\/\/weadown\.com\/res\/[a-z0-9\-]+\/?)<\/loc>/gi) || [];
        if (!matches || matches.length === 0) break;
        for (const m of matches) {
          const u = m.replace(/<\/?loc>/gi, '').trim().toLowerCase();
          cleanUrls.add(u.endsWith('/') ? u : u + '/');
          if (cleanUrls.size >= limit) break;
        }
        sitemapIndex++;
      } catch (e) {
        break;
      }
    }
    return Array.from(cleanUrls).slice(0, limit);
  }

  // 3. Category or Listing URL: page by page crawling
  let page = 1;
  const baseUrl = normalized.replace(/\/page\/\d+\/?$/, '').replace(/\/$/, '');

  while (cleanUrls.size < limit && page <= 50) {
    try {
      const pageUrl = page === 1 ? `${baseUrl}/` : `${baseUrl}/page/${page}/`;
      const html = await fetchHtml(pageUrl);
      const matches = html.match(/https:\/\/weadown\.com\/res\/[a-z0-9\-]+\/?/gi) || [];
      if (!matches || matches.length === 0) break;

      const beforeCount = cleanUrls.size;
      for (const u of matches) {
        const cleaned = (u.endsWith('/') ? u : u + '/').toLowerCase();
        cleanUrls.add(cleaned);
        if (cleanUrls.size >= limit) break;
      }

      // If no new URLs found on this page, stop
      if (cleanUrls.size === beforeCount) break;
      page++;
    } catch (e) {
      break;
    }
  }

  return Array.from(cleanUrls).slice(0, limit);
}

async function previewProducts(sourceUrl, limit = 30) {
  const urls = await getProductUrls(sourceUrl, limit);
  if (urls.length === 0) return { items: [], count: 0 };

  // Fetch existing imports from Supabase
  let existingMap = new Map();
  if (supabase) {
    const { data } = await supabase
      .from('product_source_imports')
      .select('product_id, source_url, source_version, source_modified_at, license_status')
      .in('source_url', urls);
    if (data) {
      data.forEach(row => existingMap.set(row.source_url, row));
    }
  }

  // Parse products concurrently (max 5 at a time)
  const items = [];
  const chunkSize = 5;
  for (let i = 0; i < urls.length; i += chunkSize) {
    const chunk = urls.slice(i, i + chunkSize);
    const promises = chunk.map(async (url) => {
      try {
        const parsed = await parseProductPage(url);
        const existing = existingMap.get(url);
        
        let importStatus = 'new';
        if (existing) {
          const versionDiff = parsed.version && existing.source_version && parsed.version !== existing.source_version;
          const modifiedDiff = parsed.publishedAt && existing.source_modified_at && Date.parse(parsed.publishedAt) > Date.parse(existing.source_modified_at);
          importStatus = (versionDiff || modifiedDiff) ? 'update_available' : 'up_to_date';
        }

        return {
          sourceUrl: parsed.sourceUrl,
          sourceModifiedAt: parsed.publishedAt,
          title: parsed.title,
          slug: parsed.slug,
          version: parsed.version,
          excerpt: parsed.shortDescription,
          imageUrl: parsed.imageUrl,
          galleryImages: parsed.galleryImages,
          features: parsed.features,
          sourceCategory: parsed.sourceCategory || 'WordPress',
          importStatus,
          productId: existing?.product_id || null,
          currentVersion: existing?.source_version || null,
          licenseStatus: existing?.license_status || 'unverified'
        };
      } catch (err) {
        console.error(`Error parsing ${url}:`, err.message);
        return null;
      }
    });

    const results = await Promise.all(promises);
    results.filter(Boolean).forEach(item => items.push(item));
  }

  return { items, count: items.length };
}

async function checkUpdatesForAllImported(limit = 30) {
  if (!supabase) return { items: [], count: 0 };

  const { data: imported } = await supabase
    .from('product_source_imports')
    .select('product_id, source_url, source_version, source_modified_at, source_title')
    .order('last_checked_at', { ascending: true })
    .limit(limit);

  if (!imported || imported.length === 0) return { items: [], count: 0 };

  const updatedItems = [];
  for (const item of imported) {
    try {
      const parsed = await parseProductPage(item.source_url);
      const versionDiff = parsed.version && item.source_version && parsed.version !== item.source_version;
      const modifiedDiff = parsed.publishedAt && item.source_modified_at && Date.parse(parsed.publishedAt) > Date.parse(item.source_modified_at);
      
      const isUpdated = versionDiff || modifiedDiff;
      updatedItems.push({
        sourceUrl: item.source_url,
        sourceModifiedAt: parsed.publishedAt,
        title: parsed.title,
        slug: parsed.slug,
        version: parsed.version,
        excerpt: parsed.shortDescription,
        imageUrl: parsed.imageUrl,
        galleryImages: parsed.galleryImages,
        features: parsed.features,
        sourceCategory: parsed.sourceCategory || 'WordPress',
        importStatus: isUpdated ? 'update_available' : 'up_to_date',
        productId: item.product_id,
        currentVersion: item.source_version,
        licenseStatus: 'unverified'
      });
    } catch (e) {
      console.error(`Check update failed for ${item.source_url}:`, e.message);
    }
  }

  return { items: updatedItems, count: updatedItems.length };
}

async function importMultipleProducts(sourceUrls, options = {}) {
  const { importSingleProduct } = require('./auto-import-weadown.cjs');
  const results = {
    imported: [],
    errors: [],
    created: 0,
    updated: 0
  };

  for (const url of sourceUrls) {
    try {
      const res = await importSingleProduct(url, options);
      results.imported.push({
        sourceUrl: url,
        productId: res.productId,
        result: res.isUpdate ? 'updated' : 'created'
      });
      if (res.isUpdate) results.updated++;
      else results.created++;
    } catch (err) {
      results.errors.push({
        sourceUrl: url,
        message: err.message
      });
    }
  }

  return results;
}

module.exports = {
  getProductUrls,
  previewProducts,
  checkUpdatesForAllImported,
  importMultipleProducts,
  CATEGORIES
};
