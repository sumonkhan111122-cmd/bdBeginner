const http = require('http');
const url = require('url');
const {
  extractionQueue
} = require('../scripts/extractionQueue.cjs');
const {
  previewProducts,
  checkUpdatesForAllImported,
  importMultipleProducts,
  recoverMissingDownloadLinks,
  retryFailedDownloadLink,
  extractSingleProductDownload
} = require('../scripts/weadownService.cjs');

const PORT = process.env.PORT || 3001;
const WORKER_AUTH_TOKEN = process.env.WORKER_AUTH_TOKEN || null;

function sendJson(res, data, status = 200) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  // Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  // Token authentication check (if configured in production)
  if (WORKER_AUTH_TOKEN) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || authHeader !== `Bearer ${WORKER_AUTH_TOKEN}`) {
      sendJson(res, { error: 'Unauthorized worker access' }, 401);
      return;
    }
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  try {
    // Healthcheck
    if (pathname === '/health' || pathname === '/') {
      sendJson(res, {
        status: 'healthy',
        service: 'bdBeginner Playwright Link Extractor Worker',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Queue Status
    if (pathname === '/api/weadown/queue-status' || pathname === '/queue-status') {
      const status = extractionQueue.getStatus();
      sendJson(res, status);
      return;
    }

    // Recover Missing Links
    if ((pathname === '/api/weadown/recover-downloads' || pathname === '/recover-downloads') && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          const payload = JSON.parse(body || '{}');
          const limit = Number(payload.limit) || 30;
          const result = await recoverMissingDownloadLinks(limit);
          sendJson(res, result);
        } catch (e) {
          sendJson(res, { error: e.message }, 500);
        }
      });
      return;
    }

    // Single Extract
    if ((pathname === '/api/weadown/extract-single' || pathname === '/extract-single') && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          const payload = JSON.parse(body || '{}');
          const result = await extractSingleProductDownload(payload.productId, payload.sourceUrl);
          sendJson(res, result);
        } catch (e) {
          sendJson(res, { error: e.message }, 500);
        }
      });
      return;
    }

    // Retry Failed Download Link
    if ((pathname === '/api/weadown/retry-download' || pathname === '/retry-download') && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          const payload = JSON.parse(body || '{}');
          const result = await retryFailedDownloadLink(payload.productId, payload.sourceUrl);
          sendJson(res, { success: true, job: result });
        } catch (e) {
          sendJson(res, { error: e.message }, 500);
        }
      });
      return;
    }

    sendJson(res, { error: 'Not found' }, 404);
  } catch (error) {
    sendJson(res, { error: error.message }, 500);
  }
});

server.listen(PORT, () => {
  console.log(`[PLAYWRIGHT WORKER] Running on port ${PORT}`);
});
