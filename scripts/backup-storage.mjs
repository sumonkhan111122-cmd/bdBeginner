import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const outputRoot = path.resolve(process.argv[2] || 'backup/storage');
const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const requiredBuckets = (process.env.REQUIRED_STORAGE_BUCKETS || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
}

const headers = {
  apikey: serviceRoleKey,
  authorization: `Bearer ${serviceRoleKey}`,
  'content-type': 'application/json',
};

async function storageRequest(endpoint, init = {}) {
  const response = await fetch(`${supabaseUrl.replace(/\/$/, '')}/storage/v1${endpoint}`, {
    ...init,
    headers: { ...headers, ...(init.headers || {}) },
  });
  if (!response.ok) {
    throw new Error(`Storage request failed (${response.status}) for ${endpoint}`);
  }
  return response;
}

const encodeObjectPath = (value) => value.split('/').map(encodeURIComponent).join('/');
const safeSegment = (value) => value.replace(/[^a-zA-Z0-9._-]/g, '_');

async function listFolder(bucketId, prefix = '') {
  const entries = [];
  let offset = 0;
  while (true) {
    const response = await storageRequest(`/object/list/${encodeURIComponent(bucketId)}`, {
      method: 'POST',
      body: JSON.stringify({ prefix, limit: 1000, offset, sortBy: { column: 'name', order: 'asc' } }),
    });
    const page = await response.json();
    entries.push(...page);
    if (page.length < 1000) break;
    offset += page.length;
  }
  return entries;
}

async function collectObjects(bucketId, prefix = '') {
  const entries = await listFolder(bucketId, prefix);
  const objects = [];
  for (const entry of entries) {
    const objectPath = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.id) {
      objects.push({ ...entry, objectPath });
    } else {
      objects.push(...await collectObjects(bucketId, objectPath));
    }
  }
  return objects;
}

await mkdir(outputRoot, { recursive: true });
const bucketsResponse = await storageRequest('/bucket');
const buckets = await bucketsResponse.json();
const manifest = { createdAt: new Date().toISOString(), buckets: [], missingRequiredBuckets: [] };

for (const bucket of buckets) {
  const bucketDirectory = path.join(outputRoot, safeSegment(bucket.id));
  await mkdir(bucketDirectory, { recursive: true });
  const objects = await collectObjects(bucket.id);
  for (const object of objects) {
    const response = await storageRequest(`/object/${encodeURIComponent(bucket.id)}/${encodeObjectPath(object.objectPath)}`);
    const destination = path.join(bucketDirectory, ...object.objectPath.split('/').map(safeSegment));
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, Buffer.from(await response.arrayBuffer()));
  }
  manifest.buckets.push({ id: bucket.id, public: Boolean(bucket.public), objectCount: objects.length });
}

const availableBucketIds = new Set(buckets.map((bucket) => bucket.id));
manifest.missingRequiredBuckets = requiredBuckets.filter((bucket) => !availableBucketIds.has(bucket));
await writeFile(path.join(outputRoot, 'storage-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);

if (manifest.missingRequiredBuckets.length) {
  throw new Error(`Required Storage buckets are missing: ${manifest.missingRequiredBuckets.join(', ')}`);
}
