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

async function getProductUrls(sourceUrl, limit = 50, pageNum = 1) {
  let normalized = (sourceUrl || '').trim();
  if (!normalized) normalized = 'https://weadown.com/wordpress-theme/';

  // 1. Single product URL
  if (/\/res\/[a-z0-9\-]+\/?/i.test(normalized)) {
    const cleaned = normalized.endsWith('/') ? normalized : normalized + '/';
    return [cleaned];
  }

  // 2. Specific Sitemap URL
  if (normalized.endsWith('.xml')) {
    let sitemapUrl = normalized;
    if (pageNum > 1 && sitemapUrl.includes('post-sitemap1.xml')) {
      sitemapUrl = sitemapUrl.replace('post-sitemap1.xml', `post-sitemap${pageNum}.xml`);
    }
    const xml = await fetchHtml(sitemapUrl);
    const matches = xml.match(/<loc>(https:\/\/weadown\.com\/res\/[a-z0-9\-]+\/?)<\/loc>/gi) || [];
    const urls = matches.map(m => m.replace(/<\/?loc>/gi, '').trim());
    return [...new Set(urls)].slice(0, limit);
  }

  const cleanUrls = new Set();

  // 3. Category or Listing URL: page by page crawling using /pages/{page}/
  let page = pageNum || 1;
  const pageMatch = normalized.match(/\/pages\/(\d+)\/?$/i);
  if (pageMatch) {
    if (pageNum === 1) page = parseInt(pageMatch[1], 10);
  }
  const baseUrl = normalized.replace(/\/pages\/\d+\/?$/i, '').replace(/\/$/, '');

  while (cleanUrls.size < limit && page <= 100) {
    try {
      const pageUrl = page === 1 ? `${baseUrl}/` : `${baseUrl}/pages/${page}/`;
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

async function previewProducts(sourceUrl, limit = 30, pageNum = 1) {
  const urls = await getProductUrls(sourceUrl, limit, pageNum);
  if (urls.length === 0) return { items: [], count: 0 };

  const { extractionQueue } = require('./extractionQueue.cjs');
  const queueStatus = extractionQueue.getStatus();
  const queueItems = extractionQueue.queue;

  // Fetch existing imports from Supabase
  let existingMap = new Map();
  if (supabase) {
    const { data } = await supabase
      .from('product_source_imports')
      .select('product_id, source_url, source_version, source_modified_at, license_status, metadata')
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

        // Determine download extraction status
        const flow = existing?.metadata?.download_flow;
        let downloadStatus = 'missing';
        let downloadUrl = null;
        let downloadPageUrl = null;
        let downloadError = null;
        let downloadPackageName = null;

        if (flow) {
          downloadStatus = flow.status || 'missing';
          downloadUrl = flow.final_download_url || null;
          downloadPageUrl = flow.download_page_url || null;
          downloadError = flow.last_error || null;
          downloadPackageName = flow.package_name || null;
        }

        const inQueue = queueItems.find(q => q.sourceUrl === url || (existing?.product_id && q.productId === existing.product_id));
        if (inQueue) {
          downloadStatus = inQueue.status === 'processing' ? 'processing' : (inQueue.status === 'retry' ? 'retry' : 'in_queue');
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
          licenseStatus: existing?.license_status || 'unverified',
          downloadStatus,
          downloadUrl,
          downloadPageUrl,
          downloadError,
          downloadPackageName
        };
      } catch (err) {
        console.error(`Error parsing ${url}:`, err.message);
        return null;
      }
    });

    const results = await Promise.all(promises);
    results.filter(Boolean).forEach(item => items.push(item));
  }

  return { items, count: items.length, queueStatus };
}

async function checkUpdatesForAllImported(limit = 30) {
  if (!supabase) return { items: [], count: 0 };

  const { extractionQueue } = require('./extractionQueue.cjs');
  const queueStatus = extractionQueue.getStatus();
  const queueItems = extractionQueue.queue;

  const { data: imported } = await supabase
    .from('product_source_imports')
    .select('product_id, source_url, source_version, source_modified_at, source_title, metadata')
    .order('last_checked_at', { ascending: true })
    .limit(limit);

  if (!imported || imported.length === 0) return { items: [], count: 0, queueStatus };

  const updatedItems = [];
  for (const item of imported) {
    try {
      const parsed = await parseProductPage(item.source_url);
      const versionDiff = parsed.version && item.source_version && parsed.version !== item.source_version;
      const modifiedDiff = parsed.publishedAt && item.source_modified_at && Date.parse(parsed.publishedAt) > Date.parse(item.source_modified_at);
      
      const isUpdated = versionDiff || modifiedDiff;

      const flow = item.metadata?.download_flow;
      let downloadStatus = 'missing';
      let downloadUrl = null;
      let downloadPageUrl = null;
      let downloadError = null;
      let downloadPackageName = null;

      if (flow) {
        downloadStatus = flow.status || 'missing';
        downloadUrl = flow.final_download_url || null;
        downloadPageUrl = flow.download_page_url || null;
        downloadError = flow.last_error || null;
        downloadPackageName = flow.package_name || null;
      }

      const inQueue = queueItems.find(q => q.sourceUrl === item.source_url || q.productId === item.product_id);
      if (inQueue) {
        downloadStatus = inQueue.status === 'processing' ? 'processing' : (inQueue.status === 'retry' ? 'retry' : 'in_queue');
      }

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
        licenseStatus: 'unverified',
        downloadStatus,
        downloadUrl,
        downloadPageUrl,
        downloadError,
        downloadPackageName
      });
    } catch (e) {
      console.error(`Check update failed for ${item.source_url}:`, e.message);
    }
  }

  return { items: updatedItems, count: updatedItems.length, queueStatus };
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
        result: res.isUpdate ? 'updated' : 'created',
        extractionQueued: res.extractionQueued
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

function getExtractionQueueStatus() {
  const { extractionQueue } = require('./extractionQueue.cjs');
  return extractionQueue.getStatus();
}

async function recoverMissingDownloadLinks(limit = 30) {
  const { extractionQueue } = require('./extractionQueue.cjs');
  return extractionQueue.recoverMissingLinks(limit);
}

async function retryFailedDownloadLink(productId, sourceUrl) {
  const { extractionQueue } = require('./extractionQueue.cjs');
  return extractionQueue.enqueue(productId, sourceUrl);
}

async function extractSingleProductDownload(productId, sourceUrl) {
  const { extractionQueue } = require('./extractionQueue.cjs');
  return extractionQueue.extractSingleProduct(productId, sourceUrl);
}

module.exports = {
  getProductUrls,
  previewProducts,
  checkUpdatesForAllImported,
  importMultipleProducts,
  getExtractionQueueStatus,
  recoverMissingDownloadLinks,
  retryFailedDownloadLink,
  extractSingleProductDownload,
  CATEGORIES
};

