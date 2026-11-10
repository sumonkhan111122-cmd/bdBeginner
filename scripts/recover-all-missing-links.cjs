/**
 * Recover & Add Missing Download Links for all WeaDown Products
 * 
 * Fetches products in product_source_imports that do not yet have an active
 * link in product_download_links, resolves the final download URL via WeaDown /zmk session,
 * and inserts the link so visitors can download 100% FREE.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const { extractDirectDownloadLink } = require('./fastLinkExtractor.cjs');

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

const PROGRESS_FILE = path.join(__dirname, '..', '.link-recovery-progress.json');

function loadProgress() {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
    }
  } catch(e) {}
  return { completed: [], failed: [] };
}

function saveProgress(prog) {
  try {
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(prog, null, 2), 'utf-8');
  } catch(e) {}
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function getMissingLinkProducts() {
  console.log('[DB] Scanning existing product_download_links...');
  const linkedProductIds = new Set();
  let from = 0;
  while (true) {
    const { data, error } = await supabase.from('product_download_links').select('product_id').range(from, from + 999);
    if (error || !data || data.length === 0) break;
    data.forEach(l => linkedProductIds.add(l.product_id));
    if (data.length < 1000) break;
    from += 1000;
  }
  console.log(`[DB] Found ${linkedProductIds.size} products that already have download links.`);

  console.log('[DB] Fetching imported products from product_source_imports...');
  const missing = [];
  from = 0;
  while (true) {
    const { data, error } = await supabase
      .from('product_source_imports')
      .select('id, product_id, source_url, source_title, source_version, metadata')
      .range(from, from + 999);
    if (error || !data || data.length === 0) break;
    data.forEach(imp => {
      if (imp.product_id && !linkedProductIds.has(imp.product_id)) {
        missing.push(imp);
      }
    });
    if (data.length < 1000) break;
    from += 1000;
  }
  return missing;
}

async function saveDownloadLinkToDB(productId, sourceUrl, downloadResult, sourceVersion = null) {
  // 1. Insert or update product_download_links
  const { data: existing } = await supabase
    .from('product_download_links')
    .select('id')
    .eq('product_id', productId)
    .maybeSingle();

  if (existing) {
    await supabase.from('product_download_links').update({
      title: downloadResult.title,
      download_url: downloadResult.downloadUrl,
      version: sourceVersion,
      is_active: true,
      updated_at: new Date().toISOString()
    }).eq('id', existing.id);
  } else {
    await supabase.from('product_download_links').insert({
      product_id: productId,
      title: downloadResult.title,
      download_url: downloadResult.downloadUrl,
      version: sourceVersion,
      is_active: true,
      sort_order: 0
    });
  }

  // 2. Also ensure product price is 0 (100% FREE)
  await supabase.from('products').update({
    price: 0,
    delivery_type: 'digital_download',
    status: 'published'
  }).eq('id', productId);

  // 3. Update product_source_imports metadata
  const { data: imp } = await supabase
    .from('product_source_imports')
    .select('id, metadata')
    .eq('product_id', productId)
    .maybeSingle();

  if (imp) {
    const metadata = imp.metadata || {};
    metadata.download_flow = {
      source_post_url: sourceUrl,
      download_page_url: downloadResult.downloadPageUrl,
      final_download_url: downloadResult.downloadUrl,
      package_name: downloadResult.packageName,
      status: 'success',
      extracted_at: new Date().toISOString()
    };
    await supabase.from('product_source_imports').update({
      metadata,
      updated_at: new Date().toISOString()
    }).eq('id', imp.id);
  }
}

async function runRecovery() {
  const args = process.argv.slice(2);
  const limitArg = args.find(a => a.startsWith('--limit='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : null;
  const isAll = args.includes('--all');
  const concurrencyArg = args.find(a => a.startsWith('--concurrency='));
  const CONCURRENCY = concurrencyArg ? parseInt(concurrencyArg.split('=')[1], 10) : 3;

  console.log(`\n================================================================`);
  console.log(`📥 bdBeginner Download Link Extractor & Recovery Pipeline`);
  console.log(`================================================================`);
  console.log(`Concurrency:   ${CONCURRENCY} workers`);
  console.log(`Price Policy:  0 BDT (100% Free Downloads)`);
  console.log(`Mode:          ${isAll ? 'ALL MISSING' : `BATCH LIMIT (${limit || 50})`}`);
  console.log(`================================================================\n`);

  const missing = await getMissingLinkProducts();
  const progress = loadProgress();
  const previouslyCompleted = new Set(progress.completed || []);

  const pending = missing.filter(m => !previouslyCompleted.has(m.product_id));
  console.log(`\n📊 Status Summary:`);
  console.log(`  - Total products missing download links: ${missing.length}`);
  console.log(`  - Pending in this recovery queue:        ${pending.length}`);

  if (pending.length === 0) {
    console.log(`\n🎉 All products already have active download links!\n`);
    return;
  }

  const toProcess = limit ? pending.slice(0, limit) : (isAll ? pending : pending.slice(0, 50));
  console.log(`  - Target for this run:                  ${toProcess.length} products\n`);

  let currentIndex = 0;
  let successCount = 0;
  let errorCount = 0;
  const startTime = Date.now();

  async function worker(workerId) {
    while (currentIndex < toProcess.length) {
      const idx = currentIndex++;
      const item = toProcess[idx];
      const itemStart = Date.now();

      let success = false;
      let retries = 0;
      let downloadResult = null;

      while (!success && retries < 2) {
        try {
          downloadResult = await extractDirectDownloadLink(item.source_url, { timeout: 25000 });
          success = true;
        } catch (err) {
          retries++;
          if (retries < 2) {
            await sleep(1500);
          } else {
            errorCount++;
            progress.failed.push({
              productId: item.product_id,
              sourceUrl: item.source_url,
              error: err.message,
              time: new Date().toISOString()
            });
            console.error(`❌ [${idx + 1}/${toProcess.length}] [ERROR] ${item.source_title}: ${err.message}`);
          }
        }
      }

      if (success && downloadResult) {
        try {
          await saveDownloadLinkToDB(item.product_id, item.source_url, downloadResult, item.source_version);
          successCount++;
          progress.completed.push(item.product_id);

          const duration = Date.now() - itemStart;
          const percent = ((successCount / toProcess.length) * 100).toFixed(1);
          console.log(`✅ [${String(idx + 1).padStart(4, ' ')}/${toProcess.length}] (${percent}%) [${duration}ms] Saved: "${item.source_title.slice(0, 40)}..." -> ${downloadResult.downloadUrl}`);
        } catch (dbErr) {
          console.error(`❌ [DB ERROR] ${dbErr.message}`);
        }
      }

      if (successCount % 10 === 0) {
        saveProgress(progress);
      }

      // Small pause to be gentle on servers
      await sleep(350);
    }
  }

  const workers = [];
  for (let w = 0; w < CONCURRENCY; w++) {
    workers.push(worker(w + 1));
  }

  await Promise.all(workers);
  saveProgress(progress);

  const totalTimeSec = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n================================================================`);
  console.log(`🎉 Recovery Batch Finished in ${totalTimeSec}s!`);
  console.log(`================================================================`);
  console.log(`  - Links Added:  ${successCount}`);
  console.log(`  - Failed:       ${errorCount}`);
  console.log(`  - Remaining:    ${pending.length - successCount}`);
  console.log(`================================================================\n`);
}

runRecovery().catch(err => {
  console.error('[FATAL ERROR]', err);
  process.exit(1);
});

