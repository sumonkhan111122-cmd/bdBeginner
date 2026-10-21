const { scrapeStoreProducts, importSingleProduct } = require('./idcardscannerService.cjs');

async function importAll() {
  console.log('🚀 Starting batch import from https://www.idcardscannerpro.com/p/e-commerce-store.html...');
  const products = await scrapeStoreProducts();
  console.log(`📦 Found ${products.length} products on the store page.\n`);

  let createdCount = 0;
  let updatedCount = 0;
  let failedCount = 0;

  // Process in small batches of 3 to avoid hammering the source server
  const BATCH_SIZE = 3;
  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (prod, idx) => {
        const itemNum = i + idx + 1;
        try {
          const res = await importSingleProduct(prod, {
            overwritePrice: true,
            status: 'published'
          });
          if (res.isUpdate) {
            updatedCount++;
            console.log(`[${String(itemNum).padStart(2, '0')}/${products.length}] 🔄 Updated: "${prod.title.slice(0, 40)}" | ৳${prod.price} (was ৳${prod.originalPrice}) | Category: ${prod.category}`);
          } else {
            createdCount++;
            console.log(`[${String(itemNum).padStart(2, '0')}/${products.length}] ➕ Created: "${prod.title.slice(0, 40)}" | ৳${prod.price} (was ৳${prod.originalPrice}) | Category: ${prod.category}`);
          }
        } catch (err) {
          failedCount++;
          console.error(`[${String(itemNum).padStart(2, '0')}/${products.length}] ❌ Failed: "${prod.title.slice(0, 40)}" - ${err.message}`);
        }
      })
    );
  }

  console.log('\n==================================================');
  console.log('🎉 Batch Import Summary:');
  console.log(`Total Products:  ${products.length}`);
  console.log(`Successfully Created: ${createdCount}`);
  console.log(`Successfully Updated: ${updatedCount}`);
  console.log(`Failed:               ${failedCount}`);
  console.log('==================================================\n');
}

importAll().catch(err => {
  console.error('Fatal batch import error:', err);
  process.exit(1);
});
