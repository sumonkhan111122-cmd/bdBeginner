import { supabase, extractor, saveExtractionResult, saveExtractionFailure } from '../_db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { productId } = req.body || {};
    if (!productId) {
      return res.status(400).json({ error: 'Missing productId' });
    }

    const { data: imp, error } = await supabase
      .from('product_source_imports')
      .select('id, product_id, source_url, source_title')
      .eq('product_id', productId)
      .maybeSingle();

    if (error || !imp) {
      return res.status(404).json({ error: 'Product import record not found' });
    }

    const result = await extractor.extract(imp.source_url);

    if (result.success && result.finalDownloadUrl) {
      await saveExtractionResult(imp.product_id, imp.source_url, result);
      return res.status(200).json({
        success: true,
        result
      });
    } else {
      await saveExtractionFailure(imp.product_id, imp.source_url, result.error || 'Retry extraction failed');
      return res.status(500).json({
        success: false,
        error: result.error || 'Retry failed'
      });
    }
  } catch (error) {
    console.error('[API retry-download] Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
