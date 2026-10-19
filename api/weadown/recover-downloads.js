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
    const { batchSize = 5 } = req.body || {};
    const limit = Math.max(1, Math.min(10, parseInt(batchSize, 10) || 5));

    // 1. Fetch imports needing download link extraction
    const { data: allImports, error: fetchErr } = await supabase
      .from('product_source_imports')
      .select('id, product_id, source_url, source_title, metadata')
      .order('created_at', { ascending: false });

    if (fetchErr) throw fetchErr;

    // Filter to missing or failed
    const pendingList = (allImports || []).filter(imp => {
      const flow = imp.metadata && imp.metadata.download_flow;
      return !flow || flow.status !== 'success' || !flow.final_download_url;
    });

    const totalRemaining = pendingList.length;
    const batch = pendingList.slice(0, limit);

    console.log(`[API recover-downloads] Processing batch of ${batch.length} items (Total remaining: ${totalRemaining})`);

    const results = [];

    for (const item of batch) {
      try {
        console.log(`[API recover-downloads] Extracting: ${item.source_title} (${item.source_url})`);
        const result = await extractor.extract(item.source_url);

        if (result.success && result.finalDownloadUrl) {
          await saveExtractionResult(item.product_id, item.source_url, result);
          results.push({
            productId: item.product_id,
            title: item.source_title,
            status: 'success',
            downloadUrl: result.finalDownloadUrl
          });
        } else {
          await saveExtractionFailure(item.product_id, item.source_url, result.error || 'Failed to extract download URL');
          results.push({
            productId: item.product_id,
            title: item.source_title,
            status: 'failed',
            error: result.error
          });
        }
      } catch (err) {
        await saveExtractionFailure(item.product_id, item.source_url, err.message);
        results.push({
          productId: item.product_id,
          title: item.source_title,
          status: 'failed',
          error: err.message
        });
      }

      // Safe polite gap between requests
      await new Promise(r => setTimeout(r, 2000));
    }

    const remainingAfterBatch = Math.max(0, totalRemaining - batch.length);

    return res.status(200).json({
      success: true,
      processed: results.length,
      remaining: remainingAfterBatch,
      totalRemaining: totalRemaining,
      results
    });
  } catch (error) {
    console.error('[API recover-downloads] Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
