const { extractionQueue } = require('./extractionQueue.cjs');

async function main() {
  const args = process.argv.slice(2);
  const isRecover = args.includes('--recover');
  const limitArg = args.find(a => a.startsWith('--limit='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : 30;

  console.log('======================================================');
  console.log('=== Multi-Step Download Link Extractor (Playwright) ===');
  console.log('======================================================\n');

  if (isRecover) {
    console.log(`[RECOVERY MODE] Scanning database for up to ${limit} products with missing download links...`);
    const res = await extractionQueue.recoverMissingLinks(limit);
    console.log(`\nEnqueued ${res.count} product(s) for background extraction:`);
    res.enqueued.forEach((item, idx) => {
      console.log(` [${idx + 1}] Product ID: ${item.productId} — ${item.title}`);
    });
    console.log('\nProcessing in background with low concurrency (1 worker, 3s throttle gap)...');
    console.log('You can monitor progress via Admin UI (/admin/imports) or leave this runner running.\n');

    // Wait until queue finishes
    while (extractionQueue.isProcessing || extractionQueue.queue.length > 0) {
      await new Promise(r => setTimeout(r, 4000));
      const status = extractionQueue.getStatus();
      console.log(`[STATUS] Total: ${status.totalQueued} | Pending: ${status.pending} | Processing: ${status.processing} | Success: ${status.success} | Failed: ${status.failed}`);
    }

    console.log('\nRecovery complete!');
    process.exit(0);
  }

  // Single URL mode
  const targetUrl = args[0];
  if (targetUrl && targetUrl.startsWith('http')) {
    console.log(`[SINGLE TEST MODE] Extracting download link for: ${targetUrl}`);
    const { DownloadExtractor } = require('./downloadExtractor.cjs');
    const extractor = new DownloadExtractor({ headless: true, timeout: 35000 });
    const result = await extractor.extract(targetUrl);
    console.log('\nResult:', JSON.stringify(result, null, 2));
    await extractor.closeBrowser();
    process.exit(result.success ? 0 : 1);
  }

  console.log('Usage:');
  console.log('  node scripts/extract-downloads.cjs --recover [--limit=30]   (Recover missing links)');
  console.log('  node scripts/extract-downloads.cjs <product_or_file_url>   (Extract single URL)');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
