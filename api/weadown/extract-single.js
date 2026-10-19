import { extractor, saveExtractionResult, saveExtractionFailure } from '../_db.js';

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
    const { productId, sourceUrl } = req.body || {};
    if (!productId || !sourceUrl) {
      return res.status(400).json({ error: 'Missing productId or sourceUrl' });
    }

    const result = await extractor.extract(sourceUrl);

    if (result.success && result.finalDownloadUrl) {
      await saveExtractionResult(productId, sourceUrl, result);
      return res.status(200).json({
        success: true,
        result
      });
    } else {
      await saveExtractionFailure(productId, sourceUrl, result.error || 'Failed to extract download URL');
      return res.status(500).json({
        success: false,
        error: result.error || 'Extraction failed'
      });
    }
  } catch (error) {
    console.error('[API extract-single] Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
