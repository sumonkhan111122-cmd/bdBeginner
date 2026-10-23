import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

function weadownApiPlugin() {
  return {
    name: 'weadown-api-plugin',
    configureServer(server: any) {
      server.middlewares.use('/api/free-download', async (req: any, res: any) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        if (req.method === 'OPTIONS') {
          res.statusCode = 200;
          res.end();
          return;
        }

        try {
          const handler = (await import('./api/free-download.js')).default;
          const urlObj = new URL(req.url, 'http://localhost');
          req.query = Object.fromEntries(urlObj.searchParams);
          res.status = (code: number) => {
            res.statusCode = code;
            return res;
          };
          res.json = (data: any) => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
            return res;
          };
          await handler(req, res);
        } catch (err: any) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });

      server.middlewares.use('/api/weadown', async (req: any, res: any, next: any) => {
        // Handle CORS
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        if (req.method === 'OPTIONS') {
          res.statusCode = 200;
          res.end();
          return;
        }

        const urlObj = new URL(req.url, 'http://localhost');
        const pathname = urlObj.pathname;

        try {
          const {
            previewProducts,
            checkUpdatesForAllImported,
            importMultipleProducts,
            getExtractionQueueStatus,
            recoverMissingDownloadLinks,
            retryFailedDownloadLink,
            extractSingleProductDownload
          } = require('./scripts/weadownService.cjs');

          if (pathname === '/queue-status') {
            const status = getExtractionQueueStatus();
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(status));
            return;
          }

          if (pathname === '/recover-downloads' && req.method === 'POST') {
            let body = '';
            req.on('data', (chunk: any) => { body += chunk; });
            req.on('end', async () => {
              try {
                const parsed = JSON.parse(body || '{}');
                const limit = Number(parsed.limit) || 30;
                const result = await recoverMissingDownloadLinks(limit);
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(result));
              } catch (err: any) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: err.message }));
              }
            });
            return;
          }

          if (pathname === '/retry-download' && req.method === 'POST') {
            let body = '';
            req.on('data', (chunk: any) => { body += chunk; });
            req.on('end', async () => {
              try {
                const parsed = JSON.parse(body || '{}');
                const result = await retryFailedDownloadLink(parsed.productId, parsed.sourceUrl);
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, job: result }));
              } catch (err: any) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: err.message }));
              }
            });
            return;
          }

          if (pathname === '/extract-single' && req.method === 'POST') {
            let body = '';
            req.on('data', (chunk: any) => { body += chunk; });
            req.on('end', async () => {
              try {
                const parsed = JSON.parse(body || '{}');
                const result = await extractSingleProductDownload(parsed.productId, parsed.sourceUrl);
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(result));
              } catch (err: any) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: err.message }));
              }
            });
            return;
          }

          if (pathname === '/preview' || pathname === '') {
            const sourceUrl = urlObj.searchParams.get('url') || 'https://weadown.com/wordpress-theme/';
            const limit = parseInt(urlObj.searchParams.get('limit') || '30', 10);
            const page = parseInt(urlObj.searchParams.get('page') || '1', 10);

            if (sourceUrl.includes('idcardscannerpro.com')) {
              const { previewProducts: previewIdCardScanner } = require('./scripts/idcardscannerService.cjs');
              const data = await previewIdCardScanner(sourceUrl, limit, page);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(data));
              return;
            }

            const data = await previewProducts(sourceUrl, limit, page);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
            return;
          }

          if (pathname === '/check-updates') {
            const limit = parseInt(urlObj.searchParams.get('limit') || '30', 10);
            const data = await checkUpdatesForAllImported(limit);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
            return;
          }

          if (pathname === '/import' && req.method === 'POST') {
            let body = '';
            req.on('data', (chunk: any) => { body += chunk; });
            req.on('end', async () => {
              try {
                const parsed = JSON.parse(body || '{}');
                const sourceUrls = parsed.sourceUrls || [];
                const isIdCardScanner = sourceUrls.some((u: string) => u.includes('idcardscannerpro.com'));

                if (isIdCardScanner) {
                  const { importMultipleProducts: importIdCardScanner } = require('./scripts/idcardscannerService.cjs');
                  const result = await importIdCardScanner(sourceUrls, {
                    price: parsed.price,
                    categoryName: parsed.categoryName,
                    status: parsed.status || 'published',
                    overwritePrice: parsed.overwritePrice === true
                  });
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(result));
                  return;
                }

                const result = await importMultipleProducts(sourceUrls, {
                  price: parsed.price ?? 99,
                  categoryName: parsed.categoryName || 'WordPress',
                  status: parsed.status || 'published',
                  overwritePrice: parsed.overwritePrice === true
                });
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(result));
              } catch (err: any) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: err.message }));
              }
            });
            return;
          }


          next();
        } catch (err: any) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message }));
        }
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), weadownApiPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('@supabase') || id.includes('@gotrue') || id.includes('@postgrest') || id.includes('@realtime')) {
            return 'vendor-supabase';
          }
          if (id.includes('lucide-react')) return undefined;
          if (id.includes('react') || id.includes('scheduler')) return 'vendor-react';
          return undefined;
        },
      },
    },
  },
});
