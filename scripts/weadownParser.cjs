function decodeHtml(value) {
  if (!value) return '';
  const named = {
    amp: '&', apos: "'", quot: '"', lt: '<', gt: '>',
    nbsp: ' ', ndash: '–', mdash: '—', hellip: '…',
  };
  return value
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (match, name) => named[name.toLowerCase()] ?? match);
}

function stripTags(value) {
  return decodeHtml((value || '').replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

function extractVersion(title) {
  const version = title.match(/(?:^|\s)v?(\d+(?:\.\d+){1,4})(?=\s|\+|–|-|$)/i);
  return version ? version[1] : null;
}

function extractMeta(html, property) {
  const reg1 = new RegExp(`<meta\\s+property=["']${property}["']\\s+content=["'](.*?)["']`, 'i');
  const match1 = html.match(reg1);
  if (match1) return decodeHtml(match1[1]);
  const reg2 = new RegExp(`<meta\\s+name=["']${property}["']\\s+content=["'](.*?)["']`, 'i');
  const match2 = html.match(reg2);
  return match2 ? decodeHtml(match2[1]) : null;
}

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    }
  });
  if (!res.ok) throw new Error(`HTTP error ${res.status} for ${url}`);
  return res.text();
}

async function parseProductPage(url, html) {
  if (!html) html = await fetchHtml(url);

  const ogTitle = extractMeta(html, 'og:title') || '';
  const cleanTitle = ogTitle.replace(/\s*[|–-]\s*WeaDown\s*$/i, '').trim();
  const rawDesc = extractMeta(html, 'og:description') || extractMeta(html, 'description') || '';
  const ogImage = extractMeta(html, 'og:image');
  const publishedAt = extractMeta(html, 'article:published_time');
  const section = extractMeta(html, 'article:section') || '';
  const version = extractVersion(cleanTitle) || '1.0.0';

  const slug = url.replace(/^https?:\/\/[^\/]+\/res\//, '').replace(/\/$/, '');

  // Extract features from list items
  const liMatches = [...html.matchAll(/<li>([\s\S]*?)<\/li>/gi)]
    .map(m => stripTags(m[1]))
    .filter(t => t.length > 8 && t.length < 160 && !/^(download|home|contact|adblock|comment|sign in|privacy|terms)/i.test(t));
  const features = [...new Set(liMatches)].slice(0, 10);

  // Extract paragraphs for description
  const pMatches = [...html.matchAll(/<p>([\s\S]*?)<\/p>/gi)]
    .map(m => stripTags(m[1]))
    .filter(t => t.length > 20 && !/^(note:|if you are having trouble|disabling ad blocker|try another web browser)/i.test(t));

  const cleanDescription = pMatches.slice(0, 4).join('\n\n') || rawDesc || cleanTitle;
  const shortDescription = rawDesc ? rawDesc.slice(0, 200) : cleanDescription.slice(0, 200);

  // Extract gallery images
  const imgMatches = [...html.matchAll(/<img[^>]+src=["'](https:\/\/weadown\.com\/wp-content\/uploads\/[^"']+)["']/gi)]
    .map(m => m[1])
    .filter(src => !src.includes('logo') && !src.includes('avatar') && !src.includes('banner') && !src.includes('icon'));
  const galleryImages = [...new Set([ogImage, ...imgMatches].filter(Boolean))].slice(0, 4);

  return {
    sourceUrl: url,
    slug,
    title: cleanTitle || slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    version,
    imageUrl: ogImage || galleryImages[0] || null,
    galleryImages,
    shortDescription,
    description: cleanDescription,
    features,
    sourceCategory: section,
    publishedAt: publishedAt || new Date().toISOString()
  };
}

async function test() {
  const sample = await parseProductPage('https://weadown.com/res/kadence-pro-premium-addon/');
  console.log('Parsed Kadence Pro:', {
    title: sample.title,
    version: sample.version,
    imageUrl: sample.imageUrl,
    galleryImagesCount: sample.galleryImages.length,
    featuresCount: sample.features.length,
    featuresSample: sample.features.slice(0, 3),
    shortDescription: sample.shortDescription.slice(0, 100)
  });
}

if (require.main === module) {
  test().catch(console.error);
}

module.exports = {
  fetchHtml,
  parseProductPage,
  decodeHtml,
  stripTags,
  extractVersion
};
