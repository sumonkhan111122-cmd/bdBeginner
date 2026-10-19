const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { UnifiedExtractor } = require('./unifiedExtractor.cjs');

// Parse environment
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

const QUEUE_FILE = path.join(__dirname, '..', '.extraction-queue.json');

class ExtractionQueue {
  constructor() {
    this.queue = [];
    this.history = [];
    this.isProcessing = false;
    this.extractor = null;
    this.concurrency = 1; // Strict low concurrency
    this.maxRetries = 3;
    this.throttleDelayMs = 3000;
    this.loadState();
  }

  loadState() {
    try {
      if (fs.existsSync(QUEUE_FILE)) {
        const raw = fs.readFileSync(QUEUE_FILE, 'utf-8');
        const data = JSON.parse(raw);
        this.queue = Array.isArray(data.queue) ? data.queue : [];
        this.history = Array.isArray(data.history) ? data.history.slice(-100) : [];
      }
    } catch (e) {
      this.queue = [];
      this.history = [];
    }
  }

  saveState() {
    try {
      fs.writeFileSync(QUEUE_FILE, JSON.stringify({
        queue: this.queue,
        history: this.history.slice(-100),
        lastUpdated: new Date().toISOString()
      }, null, 2), 'utf-8');
    } catch (e) {}
  }

  getExtractor() {
    if (!this.extractor) {
      this.extractor = new UnifiedExtractor({ timeout: 35000 });
    }
    return this.extractor;
  }

  getStatus() {
    const pending = this.queue.filter(j => j.status === 'pending').length;
    const processing = this.queue.filter(j => j.status === 'processing').length;
    const retry = this.queue.filter(j => j.status === 'retry').length;
    const success = this.history.filter(j => j.status === 'success').length;
    const failed = this.history.filter(j => j.status === 'failed').length;

    return {
      isProcessing: this.isProcessing,
      pending,
      processing,
      retry,
      success,
      failed,
      totalQueued: this.queue.length,
      currentJob: this.queue.find(j => j.status === 'processing') || null,
      recentHistory: this.history.slice(-10)
    };
  }

  enqueue(productId, sourceUrl, sourceTitle = '') {
    if (!productId || !sourceUrl) return null;

    // Check if already in active queue
    const existingIndex = this.queue.findIndex(j => j.productId === productId);
    if (existingIndex >= 0) {
      return this.queue[existingIndex];
    }

    const job = {
      id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      productId,
      sourceUrl,
      sourceTitle,
      status: 'pending', // 'pending' | 'processing' | 'retry' | 'success' | 'failed'
      retries: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.queue.push(job);
    this.saveState();

    // Trigger queue processing asynchronously
    this.processQueue().catch(console.error);

    return job;
  }

  async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      while (this.queue.length > 0) {
        // Find next eligible job
        const job = this.queue.find(j => j.status === 'pending' || j.status === 'retry');
        if (!job) break;

        job.status = 'processing';
        job.updatedAt = new Date().toISOString();
        this.saveState();

        const extractor = this.getExtractor();
        const result = await extractor.extract(job.sourceUrl);

        if (result.success && result.finalDownloadUrl) {
          job.status = 'success';
          job.result = {
            downloadPageUrl: result.downloadPageUrl,
            finalDownloadUrl: result.finalDownloadUrl,
            packageName: result.packageName,
            fileSize: result.fileSize
          };
          job.updatedAt = new Date().toISOString();

          // Sync to Database
          await this.saveResultToDatabase(job.productId, job.sourceUrl, result);

          // Move from queue to history
          this.queue = this.queue.filter(j => j.id !== job.id);
          this.history.push({ ...job, finishedAt: new Date().toISOString() });
        } else {
          job.retries = (job.retries || 0) + 1;
          job.lastError = result.error || 'Failed to extract link';
          job.updatedAt = new Date().toISOString();

          if (job.retries < this.maxRetries) {
            job.status = 'retry';
            console.log(`[EXTRACTION QUEUE] Job ${job.productId} failed (attempt ${job.retries}/${this.maxRetries}), queued for retry.`);
          } else {
            job.status = 'failed';
            console.error(`[EXTRACTION QUEUE] Job ${job.productId} permanently failed after ${this.maxRetries} retries: ${job.lastError}`);
            // Sync failed status to metadata in DB
            await this.saveFailedToDatabase(job.productId, job.sourceUrl, job.lastError);
            this.queue = this.queue.filter(j => j.id !== job.id);
            this.history.push({ ...job, finishedAt: new Date().toISOString() });
          }
        }

        this.saveState();

        // Throttle gap between jobs
        if (this.queue.length > 0) {
          await new Promise(r => setTimeout(r, this.throttleDelayMs));
        }
      }
    } catch (err) {
      console.error('[EXTRACTION QUEUE] Queue execution error:', err.message);
    } finally {
      this.isProcessing = false;
      this.saveState();
      if (this.extractor) {
        await this.extractor.closeBrowser().catch(() => {});
        this.extractor = null;
      }
    }
  }

  async saveResultToDatabase(productId, sourceUrl, result) {
    if (!supabase) return;

    try {
      // 1. Update product_download_links
      const title = result.packageName
        ? `${result.packageName} (Direct Download)`
        : 'Direct Product Package';

      // Check if link exists
      const { data: existingLink } = await supabase
        .from('product_download_links')
        .select('id')
        .eq('product_id', productId)
        .maybeSingle();

      if (existingLink) {
        await supabase
          .from('product_download_links')
          .update({
            title,
            download_url: result.finalDownloadUrl,
            is_active: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingLink.id);
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

      // 2. Update product_source_imports metadata with download_flow details
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
    } catch (dbErr) {
      console.error('[EXTRACTION QUEUE] DB Sync Error:', dbErr.message);
    }
  }

  async saveFailedToDatabase(productId, sourceUrl, errorMsg) {
    if (!supabase) return;

    try {
      const { data: importRecord } = await supabase
        .from('product_source_imports')
        .select('id, metadata')
        .eq('product_id', productId)
        .maybeSingle();

      if (importRecord) {
        const metadata = importRecord.metadata || {};
        metadata.download_flow = {
          source_post_url: sourceUrl,
          status: 'failed',
          last_error: errorMsg,
          updated_at: new Date().toISOString()
        };

        await supabase
          .from('product_source_imports')
          .update({
            metadata,
            updated_at: new Date().toISOString()
          })
          .eq('id', importRecord.id);
      }
    } catch (e) {}
  }

  /**
   * Find and enqueue previously imported products that have missing or demo download links
   */
  async recoverMissingLinks(limit = 30) {
    if (!supabase) return { count: 0, enqueued: [] };

    // Fetch imported products
    const { data: imports, error } = await supabase
      .from('product_source_imports')
      .select('product_id, source_url, source_title, metadata')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !imports || imports.length === 0) {
      return { count: 0, enqueued: [] };
    }

    // Check which ones have missing or demo links
    const productIds = imports.map(i => i.product_id);
    const { data: links } = await supabase
      .from('product_download_links')
      .select('product_id, download_url')
      .in('product_id', productIds);

    const linkMap = new Map();
    if (links) {
      links.forEach(l => linkMap.set(l.product_id, l.download_url));
    }

    const enqueued = [];
    for (const imp of imports) {
      const dlUrl = linkMap.get(imp.product_id);
      const isMissing = !dlUrl;
      const isDemo = dlUrl && (dlUrl.includes('demo-product-download') || dlUrl.includes('supabase.co/functions'));
      const flow = imp.metadata?.download_flow;
      const isFailed = flow?.status === 'failed';

      if (isMissing || isDemo || isFailed) {
        const job = this.enqueue(imp.product_id, imp.source_url, imp.source_title);
        if (job) enqueued.push({ productId: imp.product_id, title: imp.source_title });
      }
    }

    return {
      count: enqueued.length,
      enqueued
    };
  }

  /**
   * Single product on-demand extraction
   */
  async extractSingleProduct(productId, sourceUrl) {
    const extractor = this.getExtractor();
    const result = await extractor.extract(sourceUrl);
    if (result.success && result.finalDownloadUrl) {
      await this.saveResultToDatabase(productId, sourceUrl, result);
    } else {
      await this.saveFailedToDatabase(productId, sourceUrl, result.error);
    }
    return result;
  }
}

// Singleton instance
const extractionQueue = new ExtractionQueue();

module.exports = {
  ExtractionQueue,
  extractionQueue
};
