const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Helper to parse .env files
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
  'Software': '4c9fd83b-2ead-488b-8652-4eff6b87c212',
  'AI Tools': '46e77cdb-bc84-4658-b6f1-3af0b9833a6d',
  'Web Services': 'dd5fe544-7b50-46d0-8d9b-4ed4588f6c8f',
  'Courses': '9658a4a6-c141-433a-8e0a-964a081b3455',
  'Digital Resources': 'd7ac2ba6-4368-4adf-b314-d7e6b4c14956'
};

function decodeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function bnToEnDigits(str) {
  if (!str) return '';
  const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return str.replace(/[০-৯]/g, (d) => bn.indexOf(d));
}

function calculateCompareAtPrice(price) {
  if (price <= 200) return Math.round((price * 1.6) / 10) * 10;
  if (price <= 400) return Math.round((price * 1.55) / 10) * 10;
  if (price <= 700) return Math.round((price * 1.45) / 10) * 10;
  if (price <= 1200) return Math.round((price * 1.4) / 10) * 10;
  return Math.round((price * 1.35) / 10) * 10;
}

function inferCategory(title, detailUrl) {
  const t = (title + ' ' + detailUrl).toLowerCase();
  if (/course|কোর্স|শিখুন|excel|graphic design|e-return|trading|aminship|mayajal|টেন্ডার|ড্রপিং|ভিডিও এডিটিং|বুকিং/.test(t)) {
    return 'Courses';
  }
  if (/remini|ai |এআই|চ্যাটজিপিটি/.test(t)) {
    return 'AI Tools';
  }
  if (/server|সার্ভার|এক্সেস|digital service|ডিজিটাল সেবা/.test(t) && /১৬|16|সার্ভার/.test(t)) {
    return 'Web Services';
  }
  if (/voter|ভোটার|মৌজা|ম্যাপ|ভাতার|ফরম|pdf|লিস্ট|ড্রামা|মুভি|গেম|game|1 লক্ষ্য|১ লক্ষ্য|graphic bundle|গাইড বুক|বুক|book/.test(t)) {
    return 'Digital Resources';
  }
  return 'Software';
}

function generateSlug(title, detailUrl) {
  if (detailUrl) {
    const slugMatch = detailUrl.match(/\/p\/([a-z0-9\-]+)\.html/i);
    if (slugMatch && slugMatch[1]) {
      return slugMatch[1].toLowerCase() + '-pro';
    }
  }
  const cleanTitle = title
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase();
  if (cleanTitle.length > 3) return cleanTitle.slice(0, 45);
  return 'idcardscanner-' + Math.floor(10000 + Math.random() * 90000);
}

const IGNORED_HEADINGS = [
  'Action Required',
  'Advanced Image Cropping Tool',
  'Cropped Result:',
  'Bangla Sign Maker Pro',
  'Bulk Image Converter',
  'PDF to Image Converter',
  'Image to PDF Converter',
  'অর্ডার করতে কোনো সমস্যা হচ্ছে?',
  'আপনার কি কোনো প্রশ্ন আছে?',
  'কোনো প্রশ্ন আছে?'
];

async function fetchProductDetail(url) {
  try {
    const fullUrl = url.startsWith('http') ? url : `https://www.idcardscannerpro.com${url}`;
    const res = await fetch(fullUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      signal: AbortSignal.timeout(10000)
    });
    if (!res.ok) return null;
    const text = await res.text();

    const start = text.indexOf("class='post-body");
    if (start === -1) return null;
    const postBodyStart = text.indexOf(">", start) + 1;
    const postBodyEnd = text.indexOf("<div class='post-bottom", postBodyStart);
    let html = text.slice(postBodyStart, postBodyEnd !== -1 ? postBodyEnd : postBodyStart + 35000);

    let content = html.replace(/<style[\s\S]*?<\/style>/gi, '')
                      .replace(/<script[\s\S]*?<\/script>/gi, '')
                      .replace(/<!--[\s\S]*?-->/gi, '');

    const images = [];
    const imgMatches = content.match(/<img[^>]+src=["']([^"']+)["']/gi) || [];
    for (const im of imgMatches) {
      const src = im.match(/src=["']([^"']+)["']/i)?.[1];
      if (src && !src.includes('dmca_protected') && !src.includes('blogger_badge') && !src.includes('ifoAPIq') && !images.includes(src)) {
        images.push(src);
      }
    }

    const features = [];
    const hMatches = content.match(/<h[2-4][^>]*>([\s\S]*?)<\/h[2-4]>/gi) || [];
    for (const h of hMatches) {
      const clean = decodeHtml(h.replace(/<[^>]+>/g, '').trim());
      if (clean && clean.length > 3 && clean.length < 80 && !IGNORED_HEADINGS.includes(clean) && !features.includes(clean)) {
        features.push(clean);
      }
    }

    const pMatches = content.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || [];
    const paragraphs = [];
    for (const p of pMatches) {
      const clean = decodeHtml(p.replace(/<[^>]+>/g, '').trim());
      if (clean && clean.length > 25 && !paragraphs.includes(clean)) {
        paragraphs.push(clean);
      }
    }

    return {
      paragraphs,
      features: features.slice(0, 8),
      images
    };
  } catch (err) {
    return null;
  }
}

async function scrapeStoreProducts(storeUrl = 'https://www.idcardscannerpro.com/p/e-commerce-store.html') {
  let html = '';
  // Check if storeUrl is a single detail page URL
  if (storeUrl.includes('/p/') && !storeUrl.includes('e-commerce-store')) {
    // Single product preview
    const detail = await fetchProductDetail(storeUrl);
    const slug = generateSlug('', storeUrl);
    return [{
      title: detail?.paragraphs?.[0]?.slice(0, 80) || slug,
      slug,
      image: detail?.images?.[0] || 'https://i.imgur.com/Pf7J0ZX.jpeg',
      price: 350,
      originalPrice: 500,
      detailUrl: storeUrl,
      detail
    }];
  }

  const res = await fetch(storeUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    signal: AbortSignal.timeout(12000)
  });
  if (!res.ok) throw new Error(`Failed to load store: HTTP ${res.status}`);
  html = await res.text();

  const parts = html.split('<div class="product-card">');
  parts.shift(); // remove header

  const products = [];
  for (let i = 0; i < parts.length; i++) {
    const chunk = parts[i];
    const imgSrcMatch = chunk.match(/<img[^>]+src=["']([^"']+)["']/i);
    const titleMatch = chunk.match(/<h3[^>]*class=["']product-title["'][^>]*>([\s\S]*?)<\/h3>/i);
    const currentPriceMatch = chunk.match(/<span[^>]*class=["']current-price["'][^>]*>([\s\S]*?)<\/span>/i);
    const originalPriceMatch = chunk.match(/<span[^>]*class=["']original-price["'][^>]*>([\s\S]*?)<\/span>/i);
    const linkMatch = chunk.match(/<a[^>]*class=["']btn-order["'][^>]*href=["']([^"']+)["']/i);

    const rawTitle = titleMatch ? decodeHtml(titleMatch[1].trim()) : '';
    const rawCurrentPrice = currentPriceMatch ? decodeHtml(currentPriceMatch[1].trim()) : '';
    const rawOriginalPrice = originalPriceMatch ? decodeHtml(originalPriceMatch[1].trim()) : '';

    const priceDigits = bnToEnDigits(rawCurrentPrice).replace(/[^\d]/g, '');
    const origPriceDigits = bnToEnDigits(rawOriginalPrice).replace(/[^\d]/g, '');

    const price = priceDigits ? parseInt(priceDigits, 10) : 250;
    let originalPrice = origPriceDigits ? parseInt(origPriceDigits, 10) : 0;
    if (!originalPrice || originalPrice <= price) {
      originalPrice = calculateCompareAtPrice(price);
    }

    const relLink = linkMatch ? linkMatch[1].trim() : '';
    const detailUrl = relLink ? (relLink.startsWith('http') ? relLink : `https://www.idcardscannerpro.com${relLink}`) : storeUrl;

    if (rawTitle) {
      products.push({
        id: i + 1,
        title: rawTitle,
        image: imgSrcMatch ? imgSrcMatch[1] : '',
        price,
        originalPrice,
        detailUrl,
        slug: generateSlug(rawTitle, relLink),
        category: inferCategory(rawTitle, relLink)
      });
    }
  }

  return products;
}

async function previewProducts(sourceUrl = 'https://www.idcardscannerpro.com/p/e-commerce-store.html', limit = 50, page = 1) {
  const allProducts = await scrapeStoreProducts(sourceUrl);
  const startIndex = (page - 1) * limit;
  const paginated = allProducts.slice(startIndex, startIndex + limit);

  // Check which products are already imported
  const urls = paginated.map(p => p.detailUrl);
  let existingMap = new Map();
  if (supabase && urls.length > 0) {
    const { data } = await supabase
      .from('product_source_imports')
      .select('product_id, source_url, source_version')
      .in('source_url', urls);
    if (data) {
      data.forEach(r => existingMap.set(r.source_url, r));
    }
  }

  const items = paginated.map(p => {
    const existing = existingMap.get(p.detailUrl);
    return {
      sourceUrl: p.detailUrl,
      sourceModifiedAt: new Date().toISOString(),
      title: p.title,
      slug: p.slug,
      version: '1.0',
      excerpt: `${p.title} - সম্পূর্ণ ডিজিটাল লাইসেন্স/এক্সেস। ইনস্ট্যান্ট ডেলিভারি।`,
      imageUrl: p.image,
      galleryImages: [p.image],
      features: ['লাইফটাইম ডিজিটাল এক্সেস', '১০০% জেনুইন ও নিরাপদ', 'ইনস্ট্যান্ট এক্টিভেশন সাপোর্ট'],
      sourceCategory: p.category,
      importStatus: existing ? 'up_to_date' : 'new',
      productId: existing?.product_id || null,
      currentVersion: existing?.source_version || null,
      licenseStatus: 'verified_gpl',
      price: p.price,
      compareAtPrice: p.originalPrice
    };
  });

  return {
    items,
    count: allProducts.length,
    source: 'idcardscannerpro'
  };
}

async function importSingleProduct(productInfo, options = {}) {
  if (!supabase) throw new Error('Supabase client not initialized');

  const sourceUrl = productInfo.detailUrl || productInfo.sourceUrl;
  const title = productInfo.title;
  const slug = productInfo.slug || generateSlug(title, sourceUrl);
  const price = typeof productInfo.price === 'number' && productInfo.price > 0 ? productInfo.price : (options.price || 250);
  const compareAtPrice = productInfo.originalPrice || productInfo.compareAtPrice || calculateCompareAtPrice(price);
  const categoryName = productInfo.category || options.categoryName || inferCategory(title, sourceUrl);
  const categoryId = CATEGORIES[categoryName] || CATEGORIES['Software'];
  const status = options.status || 'published';
  const imageUrl = productInfo.image || productInfo.imageUrl;

  // 1. Fetch detail page for rich text and features
  let detail = null;
  if (sourceUrl && sourceUrl.includes('/p/')) {
    detail = await fetchProductDetail(sourceUrl);
  }

  const paragraphs = detail?.paragraphs || [];
  const features = detail?.features?.length ? detail.features : [
    'লাইফটাইম ডিজিটাল এক্সেস ও সাপোর্ট',
    '১০০% জেনুইন ফাইল ও নিরাপদ ব্যবহার',
    'সহজ ইনস্টলেশন ও ব্যবহার নির্দেশিকা'
  ];

  let shortDesc = paragraphs[0] || `${title} - সম্পূর্ণ ডিজিটাল লাইসেন্স এবং লাইফটাইম এক্সেস।`;
  if (shortDesc.length > 250) shortDesc = shortDesc.slice(0, 247) + '...';

  let richDesc = paragraphs.length > 0
    ? paragraphs.map(p => `<p>${p}</p>`).join('\n')
    : `<p>${title} এর সম্পূর্ণ ডিজিটাল প্যাকেজ। যেকোনো প্রয়োজনে লাইফটাইম এক্সেস ও নিরবচ্ছিন্ন সুবিধা পান।</p>`;
  
  richDesc += `\n<p><strong>ডেলিভারি নির্দেশিকা:</strong> সফলভাবে অর্ডার সম্পন্ন করার পর আপনার অ্যাকাউন্ট ড্যাশবোর্ডে ফাইল এবং নির্দেশিকা দেখতে পাবেন।</p>`;

  // 2. Check if product already exists
  const { data: existingImport } = await supabase
    .from('product_source_imports')
    .select('id, product_id')
    .eq('source_url', sourceUrl)
    .maybeSingle();

  let productId = existingImport?.product_id;
  let isUpdate = false;

  if (productId) {
    isUpdate = true;
    const updatePayload = {
      name: title,
      short_description: shortDesc,
      description: richDesc,
      thumbnail_url: imageUrl,
      status: status,
      updated_at: new Date().toISOString()
    };
    if (options.overwritePrice) {
      updatePayload.price = price;
      updatePayload.compare_at_price = compareAtPrice;
    }
    await supabase.from('products').update(updatePayload).eq('id', productId);
  } else {
    // Check by slug
    const { data: existingSlug } = await supabase
      .from('products')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (existingSlug) {
      productId = existingSlug.id;
      isUpdate = true;
      await supabase.from('products').update({
        name: title,
        short_description: shortDesc,
        description: richDesc,
        thumbnail_url: imageUrl,
        updated_at: new Date().toISOString()
      }).eq('id', productId);
    } else {
      // Insert new product
      const { data: created, error: insertErr } = await supabase
        .from('products')
        .insert({
          category_id: categoryId,
          name: title,
          slug: slug,
          sku: `IDC-${slug.slice(0, 8).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
          short_description: shortDesc,
          description: richDesc,
          price: price,
          compare_at_price: compareAtPrice,
          thumbnail_url: imageUrl,
          product_type: 'digital_download',
          delivery_type: 'digital_download',
          status: status,
          featured: false,
          new_product: true,
          version: '1.0',
          compatibility: 'Windows / Android / Universal',
          requirements: 'Standard system requirements',
          support_period: 'Lifetime support',
          update_policy: 'Updates included',
          delivery_description: 'Instant access provided in your user dashboard.',
          seo_title: `${title} | bdBeginner`,
          seo_description: shortDesc,
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
  const galleryImages = [imageUrl, ...(detail?.images || [])].filter((v, idx, arr) => v && arr.indexOf(v) === idx);
  if (galleryImages.length > 0) {
    await supabase.from('product_images').delete().eq('product_id', productId);
    const imgRows = galleryImages.slice(0, 5).map((imgUrl, idx) => ({
      product_id: productId,
      image_url: imgUrl,
      alt_text: `${title} preview ${idx + 1}`,
      sort_order: idx
    }));
    await supabase.from('product_images').insert(imgRows);
  }

  // 4. Sync Features
  if (features.length > 0) {
    await supabase.from('product_features').delete().eq('product_id', productId);
    const featureRows = features.map((feat, idx) => ({
      product_id: productId,
      feature: feat,
      sort_order: idx
    }));
    await supabase.from('product_features').insert(featureRows);
  }

  // 5. Ensure at least one active download/access link exists for VIP members
  const { data: existingLinks } = await supabase
    .from('product_download_links')
    .select('id')
    .eq('product_id', productId)
    .limit(1);

  if (!existingLinks || existingLinks.length === 0) {
    await supabase.from('product_download_links').insert({
      product_id: productId,
      title: `${title} (Official Instant Access)`,
      download_url: sourceUrl,
      version: '1.0',
      sort_order: 0,
      is_active: true
    });
  }

  // 5. Record in product_source_imports
  const importRecord = {
    product_id: productId,
    source_site: 'idcardscannerpro',
    source_url: sourceUrl,
    source_title: title,
    source_version: '1.0',
    source_modified_at: new Date().toISOString(),
    license_status: 'verified_gpl',
    last_checked_at: new Date().toISOString(),
    metadata: {
      site_price: price,
      compare_at_price: compareAtPrice,
      detailUrl: sourceUrl
    }
  };

  await supabase
    .from('product_source_imports')
    .upsert(importRecord, { onConflict: 'source_url' });

  return { productId, isUpdate };
}

async function importMultipleProducts(sourceUrls, options = {}) {
  // First load all products from store
  const allProducts = await scrapeStoreProducts();
  const urlMap = new Map();
  allProducts.forEach(p => urlMap.set(p.detailUrl, p));

  const results = {
    imported: [],
    errors: [],
    created: 0,
    updated: 0
  };

  for (const url of sourceUrls) {
    try {
      const prodData = urlMap.get(url) || {
        detailUrl: url,
        title: generateSlug('', url),
        price: options.price || 250,
        slug: generateSlug('', url)
      };

      const res = await importSingleProduct(prodData, options);
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
  CATEGORIES,
  scrapeStoreProducts,
  previewProducts,
  importSingleProduct,
  importMultipleProducts,
  calculateCompareAtPrice
};
