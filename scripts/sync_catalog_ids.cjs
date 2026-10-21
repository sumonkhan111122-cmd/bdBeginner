const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter(l => l.includes('='))
    .map(l => l.trim().split('='))
);

const sbAdmin = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function syncCatalogIds() {
  const { data: dbProds } = await sbAdmin.from('products').select('id, slug');
  const slugToId = new Map(dbProds.map(p => [p.slug, p.id]));

  // Read catalogProducts.ts
  let catalogFile = fs.readFileSync('src/data/catalogProducts.ts', 'utf8');

  // Parse products by loading them or regex
  let replaced = 0;
  for (const [slug, dbId] of slugToId.entries()) {
    const escapedSlug = slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp('("id":\\s*")[^"]+("(?=[^}]*?"slug":\\s*"' + escapedSlug + '"))', 's');
    if (regex.test(catalogFile)) {
      catalogFile = catalogFile.replace(regex, `$1${dbId}$2`);
      replaced++;
    }
  }

  fs.writeFileSync('src/data/catalogProducts.ts', catalogFile, 'utf8');
  console.log('Successfully synchronized IDs in catalogProducts.ts:', replaced);
}

syncCatalogIds();
