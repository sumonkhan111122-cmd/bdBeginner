const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter(l => l.includes('='))
    .map(l => l.trim().split('='))
);

const sb = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

const file = fs.readFileSync('src/data/catalogProducts.ts', 'utf8');
const slugs = [...file.matchAll(/"slug":\s*"([^"]+)"/g)].map(m => m[1]);
console.log('Total slugs in catalogProducts.ts:', slugs.length);

async function check() {
  const { data: dbProducts } = await sb.from('products').select('id, slug, name');
  const dbSlugs = new Set((dbProducts || []).map(p => p.slug));
  const missing = slugs.filter(s => !dbSlugs.has(s));
  console.log('Total in DB:', dbProducts.length);
  console.log('Slugs found in DB:', slugs.length - missing.length);
  console.log('Slugs MISSING in DB:', missing.length);
  if (missing.length > 0) {
    console.log('Missing slugs:', missing);
  }
}
check();
