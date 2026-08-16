const fs = require('fs');
const { createClient } = require('./node_modules/@supabase/supabase-js');

const parseEnv = (content) => content.split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=');
  if (key && val.length) acc[key.trim()] = val.join('=').trim();
  return acc;
}, {});

let env = {};
let envLocal = {};

try { env = parseEnv(fs.readFileSync('.env', 'utf-8')); } catch(e) {}
try { envLocal = parseEnv(fs.readFileSync('.env.local', 'utf-8')); } catch(e) {}

const mergedEnv = { ...env, ...envLocal };

const url = mergedEnv.VITE_SUPABASE_URL;
const key = mergedEnv.VITE_SUPABASE_ANON_KEY ?? mergedEnv.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(url, key);

async function test() {
  const { data, error } = await supabase.from('seo_settings').select('*');
  console.log('seo_settings:', data, error);
}

test();
