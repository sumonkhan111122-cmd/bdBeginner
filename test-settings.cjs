const fs = require('fs');
const { createClient } = require('./node_modules/@supabase/supabase-js');

const envLocal = fs.readFileSync('.env.local', 'utf-8').split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=');
  if (key && val.length) acc[key.trim()] = val.join('=').trim();
  return acc;
}, {});

const supabase = createClient(envLocal.VITE_SUPABASE_URL, envLocal.VITE_SUPABASE_ANON_KEY);

async function inspect() {
  const { data: siteSettings, error: err1 } = await supabase.from('site_settings').select('*').limit(1);
  const { data: seoSettings, error: err2 } = await supabase.from('seo_settings').select('*').limit(1);
  
  console.log('site_settings:', siteSettings, err1);
  console.log('seo_settings:', seoSettings, err2);
}

inspect();
