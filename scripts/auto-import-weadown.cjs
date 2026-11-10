const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const { fetchHtml, parseProductPage } = require('./weadownParser.cjs');

// Parse .env and .env.local
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

const CATEGORIES = {
  'WordPress Themes': 'c7e89885-df81-4d5e-8353-70990cc57041',
  'WordPress': 'c7e89885-df81-4d5e-8353-70990cc57041',
  'WordPress Plugins': '2fa7f766-59f9-43bc-ba8b-7323b693b405',
  'Plugins': '2fa7f766-59f9-43bc-ba8b-7323b693b405',
  'Software': '4c9fd83b-2ead-488b-8652-4eff6b87c212',
  'PHP Scripts & Code': 'fbf0ca5c-78f5-4faf-b550-fad7c8d383a0',
  'Scripts': 'fbf0ca5c-78f5-4faf-b550-fad7c8d383a0',
  'AI Tools': '46e77cdb-bc84-4658-b6f1-3af0b9833a6d',
  'Courses': '9658a4a6-c141-433a-8e0a-964a081b3455',
  'Digital Resources': 'd7ac2ba6-4368-4adf-b314-d7e6b4c14956',
  'Web Services': 'dd5fe544-7b50-46d0-8d9b-4ed4588f6c8f',
  'GPL Research Imports': '9be33c12-a76d-491c-b396-711a19127626'
};

function detectCategory(parsed) {
  const text = `${parsed.title} ${parsed.slug} ${parsed.sourceCategory || ''}`.toLowerCase();

  // 1. Explicit Themes or Templates
  if (/\bthemes?\b|\btemplates?\b|themeforest|resume\s*theme|portfolio\s*theme/i.test(text)) {
    return CATEGORIES['WordPress Themes'];
  }

  // 2. PHP Scripts & Code
  if (/codecanyon|php\s*script|source\s*code|laravel|\bscripts?\b/i.test(text)) {
    return CATEGORIES['PHP Scripts & Code'];
  }

  // 3. Standalone Software
  if (/software|windows|mac\s*os|desktop\s*app|cracked\s*software/i.test(text) && !/wordpress|plugin|theme|woocommerce/i.test(text)) {
    return CATEGORIES['Software'];
  }

  // 4. Plugins, Addons, Extensions, WooCommerce tools, Builders, Gateways
  if (/plugin|addon|add-on|extension|widget|builder|elementor|woocommerce|gateway|form|seo|affiliate|calendar|booking|cache|security|payment|checkout|swatches|filter|slider|popup/i.test(text)) {
    return CATEGORIES['WordPress Plugins'];
  }

  return CATEGORIES['WordPress Themes'];
}

async function getProductUrlsFromSource(sourceUrl, limit = 50) {
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

  // If high limit (> 60) and requesting from homepage or general
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

      if (cleanUrls.size === beforeCount) break;
      page++;
    } catch (e) {
      break;
    }
  }

  return Array.from(cleanUrls).slice(0, limit);
}

async function importSingleProduct(sourceUrl, options = {}) {
  // 1. Scrape product page
  const parsed = await parseProductPage(sourceUrl);

  const defaultPrice = options.price ?? 0;
  const compareAtPrice = options.compareAtPrice ?? 99;
  
  let categoryId;
  if (options.categoryName && options.categoryName !== 'auto' && options.categoryName !== 'WordPress') {
    categoryId = CATEGORIES[options.categoryName] || CATEGORIES['WordPress Themes'];
  } else {
    categoryId = detectCategory(parsed);
  }

  const status = options.status || 'published';
  const overwritePrice = options.overwritePrice ?? false;

  // 2. Check if product already exists in product_source_imports
  const { data: existingImport } = await supabase
    .from('product_source_imports')
    .select('id, product_id, source_version, source_modified_at')
    .eq('source_url', parsed.sourceUrl)
    .maybeSingle();

  let productId = existingImport?.product_id;
  let isUpdate = false;

  if (productId) {
    // Check if version or modified date has changed
    const versionChanged = parsed.version && parsed.version !== existingImport.source_version;
    const modifiedChanged = parsed.publishedAt && parsed.publishedAt !== existingImport.source_modified_at;
    isUpdate = true;

    // Update existing product
    const updatePayload = {
      name: parsed.title,
      version: parsed.version,
      short_description: parsed.shortDescription,
      description: parsed.description,
      thumbnail_url: parsed.imageUrl,
      status: status,
      updated_at: new Date().toISOString()
    };
    if (overwritePrice) {
      updatePayload.price = defaultPrice;
    }

    const { error: updateErr } = await supabase
      .from('products')
      .update(updatePayload)
      .eq('id', productId);

    if (updateErr) throw updateErr;
  } else {
    // Check if product with slug already exists
    const { data: existingProd } = await supabase
      .from('products')
      .select('id')
      .eq('slug', parsed.slug)
      .maybeSingle();

    if (existingProd) {
      productId = existingProd.id;
      isUpdate = true;
      await supabase.from('products').update({
        name: parsed.title,
        version: parsed.version,
        short_description: parsed.shortDescription,
        description: parsed.description,
        thumbnail_url: parsed.imageUrl,
        updated_at: new Date().toISOString()
      }).eq('id', productId);
    } else {
      // Insert new product
      const { data: created, error: insertErr } = await supabase
        .from('products')
        .insert({
          category_id: categoryId,
          name: parsed.title,
          slug: parsed.slug,
          sku: `WBD-${parsed.slug.slice(0, 10).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
          short_description: parsed.shortDescription,
          description: parsed.description,
          price: defaultPrice,
          compare_at_price: compareAtPrice,
          thumbnail_url: parsed.imageUrl,
          product_type: 'digital_download',
          delivery_type: 'digital_download',
          status: status,
          featured: false,
          new_product: true,
          version: parsed.version,
          compatibility: 'WordPress 6.0+, PHP 8.0+',
          requirements: 'Standard hosting requirements',
          support_period: 'Lifetime updates',
          update_policy: 'Future updates included',
          delivery_description: 'Instant download link provided in user dashboard.',
          seo_title: `${parsed.title} | bdBeginner`,
          seo_description: parsed.shortDescription,
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (insertErr) throw insertErr;
      productId = created.id;
    }
  }

  // 3. Sync Gallery Images
  if (parsed.galleryImages && parsed.galleryImages.length > 0) {
    await supabase.from('product_images').delete().eq('product_id', productId);
    const imgRows = parsed.galleryImages.map((imgUrl, idx) => ({
      product_id: productId,
      image_url: imgUrl,
      alt_text: `${parsed.title} preview ${idx + 1}`,
      sort_order: idx
    }));
    await supabase.from('product_images').insert(imgRows);
  }

  // 4. Sync Features
  if (parsed.features && parsed.features.length > 0) {
    await supabase.from('product_features').delete().eq('product_id', productId);
    const featRows = parsed.features.map((feat, idx) => ({
      product_id: productId,
      feature: feat,
      sort_order: idx + 1
    }));
    await supabase.from('product_features').insert(featRows);
  }

  // 5. Upsert product_source_imports record
  await supabase.from('product_source_imports').upsert({
    product_id: productId,
    provider: 'weadown',
    source_url: parsed.sourceUrl,
    source_slug: parsed.slug,
    source_title: parsed.title,
    source_version: parsed.version,
    source_modified_at: parsed.publishedAt,
    license_status: 'unverified',
    metadata: {
      excerpt: parsed.shortDescription,
      image_url: parsed.imageUrl,
      gallery_images: parsed.galleryImages,
      features_count: parsed.features.length,
      source_category: parsed.sourceCategory,
      import_mode: 'full_product'
    },
    last_checked_at: new Date().toISOString(),
    last_imported_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }, { onConflict: 'source_url' });

  // 6. Automatically extract download link and save to product_download_links
  const autoExtract = options.autoExtract !== false;
  let downloadUrl = null;
  if (autoExtract && productId) {
    try {
      const { extractDirectDownloadLink } = require('./fastLinkExtractor.cjs');
      const dlRes = await extractDirectDownloadLink(parsed.sourceUrl, { timeout: 20000 });
      if (dlRes && dlRes.downloadUrl) {
        downloadUrl = dlRes.downloadUrl;

        // Upsert into product_download_links
        const { data: existingLink } = await supabase
          .from('product_download_links')
          .select('id')
          .eq('product_id', productId)
          .maybeSingle();

        if (existingLink) {
          await supabase.from('product_download_links').update({
            title: dlRes.title,
            download_url: dlRes.downloadUrl,
            version: parsed.version,
            is_active: true,
            updated_at: new Date().toISOString()
          }).eq('id', existingLink.id);
        } else {
          await supabase.from('product_download_links').insert({
            product_id: productId,
            title: dlRes.title,
            download_url: dlRes.downloadUrl,
            version: parsed.version,
            is_active: true,
            sort_order: 0
          });
        }

        // Update product_source_imports metadata
        const { data: impRec } = await supabase
          .from('product_source_imports')
          .select('id, metadata')
          .eq('product_id', productId)
          .maybeSingle();

        if (impRec) {
          const meta = impRec.metadata || {};
          meta.download_flow = {
            source_post_url: parsed.sourceUrl,
            download_page_url: dlRes.downloadPageUrl,
            final_download_url: dlRes.downloadUrl,
            package_name: dlRes.packageName,
            status: 'success',
            extracted_at: new Date().toISOString()
          };
          await supabase.from('product_source_imports').update({
            metadata: meta,
            updated_at: new Date().toISOString()
          }).eq('id', impRec.id);
        }
      }
    } catch (dlErr) {
      console.warn(`[AUTO-IMPORT] Link extraction warning for ${parsed.title}:`, dlErr.message);
      try {
        const { extractionQueue } = require('./extractionQueue.cjs');
        extractionQueue.enqueue(productId, parsed.sourceUrl, parsed.title);
      } catch (e) {}
    }
  }

  return {
    sourceUrl: parsed.sourceUrl,
    productId,
    title: parsed.title,
    version: parsed.version,
    categoryName: Object.entries(CATEGORIES).find(([k, v]) => v === categoryId)?.[0] || 'WordPress Themes',
    downloadUrl,
    isUpdate,
    hasDownloadLink: Boolean(downloadUrl)
  };
}


async function main() {
  const args = process.argv.slice(2);
  const targetUrl = args[0] || 'https://weadown.com/wordpress-theme/';
  const limitArg = args.find(a => a.startsWith('--limit='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : 20;

  console.log(`\n======================================================`);
  console.log(`=== WeaDown Auto Product Importer ===`);
  console.log(`Source: ${targetUrl}`);
  console.log(`Target Limit: ${limit}`);
  console.log(`======================================================\n`);

  const urls = await getProductUrlsFromSource(targetUrl, limit);
  console.log(`Found ${urls.length} product(s) to process.\n`);

  let createdCount = 0;
  let updatedCount = 0;
  let errorCount = 0;

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    process.stdout.write(`[${i + 1}/${urls.length}] Importing: ${url}... `);
    try {
      const res = await importSingleProduct(url, { price: 99, status: 'published' });
      if (res.isUpdate) {
        updatedCount++;
        console.log(`UPDATED (v${res.version}) - "${res.title.slice(0, 35)}..."`);
      } else {
        createdCount++;
        console.log(`CREATED (v${res.version}) - "${res.title.slice(0, 35)}..."`);
      }
    } catch (err) {
      errorCount++;
      console.log(`ERROR: ${err.message}`);
    }
  }

  console.log(`\n======================================================`);
  console.log(`Import Complete!`);
  console.log(`Created: ${createdCount} | Updated: ${updatedCount} | Errors: ${errorCount}`);
  console.log(`======================================================\n`);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  getProductUrlsFromSource,
  importSingleProduct
};
