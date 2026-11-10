/**
 * Automated Batch Importer for WeaDown -> bdBeginner
 * 
 * Automatically scrapes and imports all remaining themes, plugins, and scripts
 * from weadown.com into Supabase according to exact store specifications:
 * - Status: 'published'
 * - Delivery: 'digital_download'
 * - Price: 99 BDT (Compare at 149 BDT)
 * - Auto-categorization (WordPress Themes, WordPress Plugins, PHP Scripts & Code, Software)
 * - Complete gallery images & features extraction
 * - Checkpoint / resume support via .import-progress.json
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const { importSingleProduct } = require('./auto-import-weadown.cjs');

// Parse environment
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

if (!SERVICE_KEY) {
  console.error('Error: Missing SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const PROGRESS_FILE = path.join(__dirname, '..', '.import-progress.json');
const URLS_CACHE_FILE = path.join(__dirname, '..', '.weadown-all-urls.json');

async function fetchAllSitemapUrls() {
  if (fs.existsSync(URLS_CACHE_FILE)) {
    try {
      const cached = JSON.parse(fs.readFileSync(URLS_CACHE_FILE, 'utf-8'));
      if (Array.isArray(cached) && cached.length > 3000) {
        console.log(`[Cache] Loaded ${cached.length} URLs from ${path.basename(URLS_CACHE_FILE)}`);
        return cached;
      }
    } catch(e) {}
  }

  console.log('[Sitemaps] Fetching all post-sitemaps (1 to 17) from weadown.com...');
  const allUrls = [];

  for (let i = 1; i <= 17; i++) {
    const sitemapUrl = `https://weadown.com/post-sitemap${i}.xml`;
    try {
      const res = await fetch(sitemapUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      const text = await res.text();
      const matches = (text.match(/<loc>(https:\/\/weadown\.com\/res\/[a-z0-9\-]+\/?)<\/loc>/gi) || [])
        .map(m => m.replace(/<\/?loc>/gi, '').trim().toLowerCase())
        .map(u => u.endsWith('/') ? u : u + '/');
      
      allUrls.push(...matches);
      process.stdout.write(`  - Sitemap ${i}: ${matches.length} items\n`);
    } catch(e) {
      console.warn(`  - Error fetching sitemap ${i}: ${e.message}`);
    }
  }

  const unique = [...new Set(allUrls)];
  console.log(`[Sitemaps] Total unique product URLs discovered: ${unique.length}`);
  fs.writeFileSync(URLS_CACHE_FILE, JSON.stringify(unique, null, 2), 'utf-8');
  return unique;
}

async function getExistingImportedUrls() {
  console.log('[DB] Fetching existing imported URLs from product_source_imports...');
  const existing = new Set();
  let from = 0;
  const step = 1000;

  while (true) {
    const { data, error } = await supabase
      .from('product_source_imports')
      .select('source_url')
      .range(from, from + step - 1);
    
    if (error) {
      console.error('[DB Error]', error.message);
      break;
    }
    if (!data || data.length === 0) break;
    data.forEach(r => {
      if (r.source_url) {
        const u = r.source_url.toLowerCase().replace(/\/$/, '') + '/';
        existing.add(u);
      }
    });
    if (data.length < step) break;
    from += step;
  }

  console.log(`[DB] Found ${existing.size} already imported products in database.`);
  return existing;
}

function loadProgress() {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
    }
  } catch(e) {}
  return { completed: [], failed: [], stats: { created: 0, updated: 0, errors: 0 } };
}

function saveProgress(progress) {
  try {
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2), 'utf-8');
  } catch(e) {}
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function runBatchImport() {
  const args = process.argv.slice(2);
  const limitArg = args.find(a => a.startsWith('--limit='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : null;
  const isAll = args.includes('--all');
  const isDryRun = args.includes('--dry-run');
  const priceArg = args.find(a => a.startsWith('--price='));
  const price = priceArg ? parseInt(priceArg.split('=')[1], 10) : 0; // Default 0 BDT (100% FREE)
  const compareAtPrice = 99;
  const noExtractArg = args.includes('--no-extract');
  const autoExtract = !noExtractArg;
  const concurrencyArg = args.find(a => a.startsWith('--concurrency='));
  const CONCURRENCY = concurrencyArg ? parseInt(concurrencyArg.split('=')[1], 10) : 3;

  console.log(`\n================================================================`);
  console.log(`🚀 bdBeginner WeaDown Automated Master Importer`);
  console.log(`================================================================`);
  console.log(`Mode:            ${isDryRun ? 'DRY RUN' : (isAll ? 'FULL IMPORT (ALL REMAINING)' : `BATCH LIMIT (${limit || 50})`)}`);
  console.log(`Price:           ${price} BDT (100% FREE, Compare: ${compareAtPrice} BDT)`);
  console.log(`Concurrency:     ${CONCURRENCY} workers`);
  console.log(`Extract Links:   ${autoExtract ? 'ENABLED (Direct to product_download_links)' : 'DISABLED'}`);
  console.log(`Status:          published`);
  console.log(`Delivery:        digital_download`);
  console.log(`Auto-Category:   ENABLED (Themes, Plugins, Scripts, Software)`);
  console.log(`================================================================\n`);

  const [allSitemapUrls, existingUrls] = await Promise.all([
    fetchAllSitemapUrls(),
    getExistingImportedUrls()
  ]);

  const progress = loadProgress();
  const previouslyCompleted = new Set(progress.completed || []);

  const pendingUrls = allSitemapUrls.filter(u => !existingUrls.has(u) && !previouslyCompleted.has(u));

  console.log(`\n📊 Status Summary:`);
  console.log(`  - Total catalog URLs:      ${allSitemapUrls.length}`);
  console.log(`  - Already in Database:     ${existingUrls.size}`);
  console.log(`  - Unimported Remaining:    ${pendingUrls.length}`);

  if (pendingUrls.length === 0) {
    console.log(`\n🎉 All ${allSitemapUrls.length} products have already been imported! Database is 100% up to date.\n`);
    return;
  }

  const toProcess = limit ? pendingUrls.slice(0, limit) : (isAll ? pendingUrls : pendingUrls.slice(0, 50));
  console.log(`  - Target for this run:     ${toProcess.length} products\n`);

  if (isDryRun) {
    console.log(`[Dry Run] Sample 10 items to be imported:`);
    toProcess.slice(0, 10).forEach((u, i) => console.log(`  ${i + 1}. ${u}`));
    return;
  }

  console.log(`Starting import process with concurrency of ${CONCURRENCY}...\n`);

  let processedCount = 0;
  let createdCount = 0;
  let updatedCount = 0;
  let errorCount = 0;
  const startTime = Date.now();
  const categoryCounts = {};

  // Worker queue processor
  let currentIndex = 0;

  async function worker(workerId) {
    while (currentIndex < toProcess.length) {
      const idx = currentIndex++;
      const url = toProcess[idx];
      const itemStart = Date.now();

      let success = false;
      let retries = 0;
      let result = null;

      while (!success && retries < 2) {
        try {
          result = await importSingleProduct(url, {
            price,
            compareAtPrice,
            status: 'published',
            autoExtract: autoExtract
          });
          success = true;
        } catch (err) {
          retries++;
          if (retries < 2) {
            await sleep(1000);
          } else {
            errorCount++;
            progress.failed.push({ url, error: err.message, time: new Date().toISOString() });
            console.error(`❌ [${idx + 1}/${toProcess.length}] [ERROR] ${url}: ${err.message}`);
          }
        }
      }

      if (success && result) {
        processedCount++;
        if (result.isUpdate) updatedCount++;
        else createdCount++;

        const cat = result.categoryName || 'WordPress Themes';
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;

        progress.completed.push(url);
        progress.stats.created = (progress.stats.created || 0) + 1;

        const duration = Date.now() - itemStart;
        const progressPercent = ((processedCount / toProcess.length) * 100).toFixed(1);
        console.log(`✅ [${String(idx + 1).padStart(4, ' ')}/${toProcess.length}] (${progressPercent}%) [${cat}] ${result.title.slice(0, 45)}... (v${result.version || '1.0'}) [${duration}ms]`);
      }

      // Periodically persist progress checkpoint every 10 items
      if (processedCount % 10 === 0) {
        saveProgress(progress);
      }

      // Gentle pause between requests to prevent rate limiting
      await sleep(250 + Math.floor(Math.random() * 150));
    }
  }

  // Launch workers
  const workers = [];
  for (let w = 0; w < CONCURRENCY; w++) {
    workers.push(worker(w + 1));
  }

  await Promise.all(workers);
  saveProgress(progress);

  const totalTimeSec = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n================================================================`);
  console.log(`🎉 Batch Import Finished in ${totalTimeSec}s!`);
  console.log(`================================================================`);
  console.log(`  - Processed:    ${processedCount}`);
  console.log(`  - Created:      ${createdCount}`);
  console.log(`  - Updated:      ${updatedCount}`);
  console.log(`  - Errors:       ${errorCount}`);
  console.log(`  - Categories:`);
  for (const [c, n] of Object.entries(categoryCounts)) {
    console.log(`      * ${c}: ${n}`);
  }
  console.log(`  - Remaining:    ${pendingUrls.length - processedCount}`);
  console.log(`================================================================\n`);
}

runBatchImport().catch(err => {
  console.error('[FATAL ERROR]', err);
  process.exit(1);
});

