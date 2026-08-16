const fs = require('fs');
const { createClient } = require('./node_modules/@supabase/supabase-js');

const envLocal = fs.readFileSync('.env.local', 'utf-8').split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=');
  if (key && val.length) acc[key.trim()] = val.join('=').trim();
  return acc;
}, {});

const url = envLocal.VITE_SUPABASE_URL;
const key = envLocal.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

async function test() {
  const { data, error } = await supabase.from('products').select('*').limit(1);
  console.log('Anon query:', data?.length, error);

  // Sign in as admin
  // Wait, I can't sign in without password!
}

test();
