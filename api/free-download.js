import { supabase } from './_db.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const productId = req.query.productId || req.body?.productId;
    const slug = req.query.slug || req.body?.slug;

    if (!productId && !slug) {
      return res.status(400).json({ success: false, error: 'Product ID or slug is required' });
    }

    let query = supabase
      .from('products')
      .select('id, name, slug, price, category_id, categories(slug, name)');

    if (productId) {
      query = query.eq('id', productId);
    } else {
      query = query.eq('slug', slug);
    }

    const { data: product, error: prodErr } = await query.maybeSingle();

    if (prodErr || !product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const catSlug = product.categories?.slug;
    const isFreeCategory = ['wordpress', 'plugins', 'scripts', 'gpl-research-imports'].includes(catSlug);
    const isZeroPrice = Number(product.price) === 0;

    if (!isFreeCategory && !isZeroPrice) {
      return res.status(403).json({
        success: false,
        isPaid: true,
        error: 'This is a paid product. Please purchase or use a VIP membership.',
      });
    }

    // Fetch active download link
    const { data: links, error: linkErr } = await supabase
      .from('product_download_links')
      .select('id, product_id, title, download_url, version, sort_order')
      .eq('product_id', product.id)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('title', { ascending: true });

    if (linkErr || !links || links.length === 0) {
      // Attempt on-demand extraction from source_url
      try {
        const { data: imp } = await supabase
          .from('product_source_imports')
          .select('source_url, source_title, metadata')
          .eq('product_id', product.id)
          .maybeSingle();

        if (imp && imp.source_url) {
          const { createRequire } = await import('module');
          const require = createRequire(import.meta.url);
          const { extractDirectDownloadLink } = require('../scripts/fastLinkExtractor.cjs');
          const dlRes = await extractDirectDownloadLink(imp.source_url, { timeout: 20000 });

          if (dlRes && dlRes.downloadUrl) {
            // Persist to DB for all subsequent requests
            await supabase.from('product_download_links').insert({
              product_id: product.id,
              title: dlRes.title || `${product.name} (Direct Download)`,
              download_url: dlRes.downloadUrl,
              version: product.version,
              is_active: true,
              sort_order: 0,
            });

            return res.status(200).json({
              success: true,
              productId: product.id,
              productName: product.name,
              url: dlRes.downloadUrl,
              title: dlRes.title,
              version: product.version,
              links: [{
                id: 'on-demand-extracted',
                title: dlRes.title,
                url: dlRes.downloadUrl,
                version: product.version,
              }],
            });
          }
        }
      } catch (onDemandErr) {
        console.warn('On-demand link extraction notice:', onDemandErr?.message);
      }

      return res.status(404).json({
        success: false,
        error: 'No download links currently available for this product.',
      });
    }

    const primaryLink = links[0];

    return res.status(200).json({
      success: true,
      productId: product.id,
      productName: product.name,
      url: primaryLink.download_url,
      title: primaryLink.title,
      version: primaryLink.version,
      links: links.map((l) => ({
        id: l.id,
        title: l.title,
        url: l.download_url,
        version: l.version,
      })),
    });
  } catch (err) {
    console.error('Free download error:', err);
    return res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : 'Internal server error',
    });
  }
}
