import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { UnifiedExtractor } = require('../scripts/unifiedExtractor.cjs');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse .env and .env.local when running in local or hybrid environments
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
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || mergedEnv.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || mergedEnv.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

export const extractor = new UnifiedExtractor({
  remoteBrowserWs: process.env.REMOTE_BROWSER_WS_ENDPOINT || null
});

/**
 * Save extraction result into Supabase:
 * 1. public.product_download_links
 * 2. public.product_source_imports (metadata.download_flow)
 */
export async function saveExtractionResult(productId, sourceUrl, result) {
  const title = result.packageName || 'Download Package';

  // Check existing download links
  const { data: existingLinks } = await supabase
    .from('product_download_links')
    .select('id')
    .eq('product_id', productId)
    .limit(1);

  if (existingLinks && existingLinks.length > 0) {
    await supabase
      .from('product_download_links')
      .update({
        title,
        download_url: result.finalDownloadUrl,
        is_active: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingLinks[0].id);
  } else {
    await supabase
      .from('product_download_links')
      .insert({
        product_id: productId,
        title,
        download_url: result.finalDownloadUrl,
        is_active: true,
        sort_order: 0
      });
  }

  // Update product_source_imports metadata
  const { data: importRecord } = await supabase
    .from('product_source_imports')
    .select('id, metadata')
    .eq('product_id', productId)
    .maybeSingle();

  if (importRecord) {
    const metadata = importRecord.metadata || {};
    metadata.download_flow = {
      source_post_url: sourceUrl,
      download_page_url: result.downloadPageUrl,
      final_download_url: result.finalDownloadUrl,
      package_name: result.packageName,
      file_size: result.fileSize,
      status: 'success',
      extraction_engine: result.extractionEngine || 'lightweight_http',
      extracted_at: new Date().toISOString(),
      last_error: null
    };

    await supabase
      .from('product_source_imports')
      .update({
        metadata,
        updated_at: new Date().toISOString()
      })
      .eq('id', importRecord.id);
  }
}

/**
 * Mark product extraction as failed in Supabase
 */
export async function saveExtractionFailure(productId, sourceUrl, errorMessage) {
  const { data: importRecord } = await supabase
    .from('product_source_imports')
    .select('id, metadata')
    .eq('product_id', productId)
    .maybeSingle();

  if (importRecord) {
    const metadata = importRecord.metadata || {};
    metadata.download_flow = {
      source_post_url: sourceUrl,
      download_page_url: null,
      final_download_url: null,
      status: 'failed',
      extracted_at: new Date().toISOString(),
      last_error: errorMessage
    };

    await supabase
      .from('product_source_imports')
      .update({
        metadata,
        updated_at: new Date().toISOString()
      })
      .eq('id', importRecord.id);
  }
}
