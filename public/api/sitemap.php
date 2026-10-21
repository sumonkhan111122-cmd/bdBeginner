<?php
/**
 * Real-time Dynamic Sitemap Generator for bdBeginner
 * 
 * Works on cPanel Apache + PHP 7.4/8.0+
 * Automatically queried when visiting /sitemap.xml
 */

// 1. Load Supabase credentials
$supabaseUrl = getenv('VITE_SUPABASE_URL') ?: getenv('SUPABASE_URL') ?: 'https://ldmpxupslnfgzmmtpyat.supabase.co';
$supabaseKey = getenv('SUPABASE_SERVICE_ROLE_KEY') ?: getenv('VITE_SUPABASE_ANON_KEY') ?: '';

$envFile = __DIR__ . '/../../../.env.local';
if (!file_exists($envFile)) $envFile = __DIR__ . '/../../.env.local';
if (!file_exists($envFile)) $envFile = __DIR__ . '/../.env.local';
if (!file_exists($envFile)) $envFile = __DIR__ . '/../.env';

if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        list($name, $value) = explode('=', $line, 2) + [null, null];
        if ($name && $value !== null) {
            $name = trim($name);
            $value = trim($value, " \t\n\r\0\x0B\"'");
            if ($name === 'VITE_SUPABASE_URL' && (!$supabaseUrl || $supabaseUrl === 'https://ldmpxupslnfgzmmtpyat.supabase.co')) {
                $supabaseUrl = $value;
            }
            if ($name === 'SUPABASE_SERVICE_ROLE_KEY' && !$supabaseKey) {
                $supabaseKey = $value;
            }
            if ($name === 'VITE_SUPABASE_ANON_KEY' && !$supabaseKey) {
                $supabaseKey = $value;
            }
        }
    }
}

// 2. Fetch products and categories from Supabase
$ch = curl_init();
$apiUrl = rtrim($supabaseUrl, '/') . '/rest/v1/products?status=eq.published&select=id,name,slug,updated_at,created_at,thumbnail_url&order=created_at.desc';

curl_setopt($ch, CURLOPT_URL, $apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 12);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'apikey: ' . $supabaseKey,
    'Authorization: Bearer ' . $supabaseKey,
    'Accept: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$products = [];
if ($httpCode === 200 && $response) {
    $decoded = json_decode($response, true);
    if (is_array($decoded)) {
        $products = $decoded;
    }
}

// Fetch categories
$ch2 = curl_init();
curl_setopt($ch2, CURLOPT_URL, rtrim($supabaseUrl, '/') . '/rest/v1/categories?select=id,name,slug');
curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch2, CURLOPT_TIMEOUT, 6);
curl_setopt($ch2, CURLOPT_HTTPHEADER, [
    'apikey: ' . $supabaseKey,
    'Authorization: Bearer ' . $supabaseKey,
    'Accept: application/json'
]);
$catResponse = curl_exec($ch2);
curl_close($ch2);

$categories = [];
if ($catResponse) {
    $decodedCats = json_decode($catResponse, true);
    if (is_array($decodedCats)) {
        $categories = $decodedCats;
    }
}

// If database fetch failed, fallback to pre-rendered static sitemap.xml
if (empty($products)) {
    $staticSitemap = __DIR__ . '/../sitemap.xml';
    if (file_exists($staticSitemap)) {
        header('Content-Type: application/xml; charset=utf-8');
        readfile($staticSitemap);
        exit;
    }
}

$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? 'https://' : 'http://';
$host = $_SERVER['HTTP_HOST'] ?? 'bdbeginner.com';
$baseUrl = rtrim($protocol . $host, '/');
$today = date('Y-m-d');

header('Content-Type: application/xml; charset=utf-8');
header('Cache-Control: public, max-age=43200'); // 12 hours cache

echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <!-- Core Storefront & Landing Pages -->
  <url>
    <loc><?= $baseUrl ?>/</loc>
    <lastmod><?= $today ?></lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc><?= $baseUrl ?>/products</loc>
    <lastmod><?= $today ?></lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc><?= $baseUrl ?>/categories</loc>
    <lastmod><?= $today ?></lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc><?= $baseUrl ?>/services</loc>
    <lastmod><?= $today ?></lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc><?= $baseUrl ?>/about</loc>
    <lastmod><?= $today ?></lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc><?= $baseUrl ?>/faq</loc>
    <lastmod><?= $today ?></lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc><?= $baseUrl ?>/support</loc>
    <lastmod><?= $today ?></lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc><?= $baseUrl ?>/contact</loc>
    <lastmod><?= $today ?></lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc><?= $baseUrl ?>/terms</loc>
    <lastmod><?= $today ?></lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc><?= $baseUrl ?>/privacy</loc>
    <lastmod><?= $today ?></lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc><?= $baseUrl ?>/refund-policy</loc>
    <lastmod><?= $today ?></lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc><?= $baseUrl ?>/delivery-policy</loc>
    <lastmod><?= $today ?></lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>

  <?php if (!empty($categories)): ?>
  <!-- Product Category Archives -->
  <?php foreach ($categories as $cat): ?>
    <?php if (empty($cat['slug'])) continue; ?>
  <url>
    <loc><?= $baseUrl ?>/products?category=<?= rawurlencode($cat['slug']) ?></loc>
    <lastmod><?= $today ?></lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <?php endforeach; ?>
  <?php endif; ?>

  <!-- Published Products & Tools (<?= count($products) ?> items) -->
  <?php foreach ($products as $p): ?>
    <?php
      if (empty($p['slug'])) continue;
      $loc = $baseUrl . '/products/' . rawurlencode($p['slug']);
      $dateRaw = !empty($p['updated_at']) ? $p['updated_at'] : (!empty($p['created_at']) ? $p['created_at'] : null);
      $lastmod = $dateRaw ? substr($dateRaw, 0, 10) : $today;
      $image = !empty($p['thumbnail_url']) ? $p['thumbnail_url'] : null;
      $name = !empty($p['name']) ? $p['name'] : '';
    ?>
  <url>
    <loc><?= htmlspecialchars($loc) ?></loc>
    <lastmod><?= $lastmod ?></lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <?php if ($image && strpos($image, 'http') === 0): ?>
    <image:image>
      <image:loc><?= htmlspecialchars($image) ?></image:loc>
      <image:title><![CDATA[<?= $name ?>]]></image:title>
    </image:image>
    <?php endif; ?>
  </url>
  <?php endforeach; ?>
</urlset>
