import { supabase } from '../_db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { data: allImports, error } = await supabase
      .from('product_source_imports')
      .select('id, product_id, source_url, source_title, metadata, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    let successCount = 0;
    let failedCount = 0;
    let pendingCount = 0;
    const history = [];

    (allImports || []).forEach(imp => {
      const flow = imp.metadata && imp.metadata.download_flow;
      if (flow && flow.status === 'success' && flow.final_download_url) {
        successCount++;
        if (history.length < 10) {
          history.push({
            productId: imp.product_id,
            sourceTitle: imp.source_title,
            sourceUrl: imp.source_url,
            status: 'success',
            result: {
              finalDownloadUrl: flow.final_download_url,
              downloadPageUrl: flow.download_page_url,
              packageName: flow.package_name,
              fileSize: flow.file_size
            },
            finishedAt: flow.extracted_at
          });
        }
      } else if (flow && flow.status === 'failed') {
        failedCount++;
      } else {
        pendingCount++;
      }
    });

    return res.status(200).json({
      success: true,
      pending: pendingCount,
      processing: 0,
      retry: 0,
      successCount: successCount,
      failedCount: failedCount,
      totalCount: (allImports || []).length,
      currentJob: null,
      recentHistory: history
    });
  } catch (error) {
    console.error('[API queue-status] Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
