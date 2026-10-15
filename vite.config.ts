import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

function weadownApiPlugin() {
  return {
    name: 'weadown-api-plugin',
    configureServer(server: any) {
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
            importMultipleProducts
          } = require('./scripts/weadownService.cjs');

          if (pathname === '/preview' || pathname === '') {
            const sourceUrl = urlObj.searchParams.get('url') || 'https://weadown.com/wordpress-theme/';
            const limit = parseInt(urlObj.searchParams.get('limit') || '30', 10);
            const data = await previewProducts(sourceUrl, limit);
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
                const result = await importMultipleProducts(parsed.sourceUrls || [], {
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
