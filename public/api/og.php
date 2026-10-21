<?php
/**
 * Dynamic Open Graph Generator for Social Media Crawlers (Facebook, WhatsApp, Twitter, LinkedIn)
 * 
 * Ensures that when a link is shared or used in Facebook Ads, Facebook's scraper
 * immediately extracts the exact product image, title, BDT price, and description.
 */

$slug = isset($_GET['slug']) ? trim($_GET['slug']) : '';
if (!$slug) {
    // Fall back to index.html
    readfile(__DIR__ . '/../../index.html');
    exit;
}

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

// 2. Fetch product by slug
$ch = curl_init();
$apiUrl = rtrim($supabaseUrl, '/') . '/rest/v1/products?slug=eq.' . rawurlencode($slug) . '&select=id,name,slug,price,compare_at_price,short_description,description,thumbnail_url&limit=1';

curl_setopt($ch, CURLOPT_URL, $apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 6);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'apikey: ' . $supabaseKey,
    'Authorization: Bearer ' . $supabaseKey,
    'Accept: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$product = null;
if ($httpCode === 200 && $response) {
    $decoded = json_decode($response, true);
    if (!empty($decoded[0])) {
        $product = $decoded[0];
    }
}

// If product not found, fallback to standard SPA index.html
if (!$product) {
    readfile(__DIR__ . '/../../index.html');
    exit;
}

$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? 'https://' : 'http://';
$host = $_SERVER['HTTP_HOST'] ?? 'bdbeginner.com';
$baseUrl = rtrim($protocol . $host, '/');
$canonicalUrl = $baseUrl . '/products/' . rawurlencode($slug);

$title = $product['name'] . ' — bdBeginner';
$desc = strip_tags($product['short_description'] ?? $product['description'] ?? 'Explore premium digital products and WordPress tools at bdBeginner.');
$desc = trim(preg_replace('/\s+/', ' ', $desc));
if (mb_strlen($desc) > 300) {
    $desc = mb_substr($desc, 0, 297) . '...';
}

$image = !empty($product['thumbnail_url']) ? $product['thumbnail_url'] : ($baseUrl . '/favicon.svg');
$priceVal = !empty($product['price']) ? $product['price'] : ($product['compare_at_price'] ?? 0);

header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: public, max-age=3600');
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title><?= htmlspecialchars($title) ?></title>
  <meta name="description" content="<?= htmlspecialchars($desc) ?>">
  <link rel="canonical" href="<?= htmlspecialchars($canonicalUrl) ?>">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="product">
  <meta property="og:site_name" content="bdBeginner">
  <meta property="og:title" content="<?= htmlspecialchars($product['name']) ?>">
  <meta property="og:description" content="<?= htmlspecialchars($desc) ?>">
  <meta property="og:image" content="<?= htmlspecialchars($image) ?>">
  <meta property="og:url" content="<?= htmlspecialchars($canonicalUrl) ?>">
  <meta property="product:price:amount" content="<?= htmlspecialchars($priceVal) ?>">
  <meta property="product:price:currency" content="BDT">
  <meta property="product:availability" content="in stock">
  <meta property="product:condition" content="new">
  <meta property="product:brand" content="bdBeginner">
  <meta property="product:retailer_item_id" content="<?= htmlspecialchars($product['id']) ?>">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="<?= htmlspecialchars($product['name']) ?>">
  <meta name="twitter:description" content="<?= htmlspecialchars($desc) ?>">
  <meta name="twitter:image" content="<?= htmlspecialchars($image) ?>">
  
  <!-- Schema.org Microdata for Crawlers -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": <?= json_encode($product['name']) ?>,
    "description": <?= json_encode($desc) ?>,
    "image": [<?= json_encode($image) ?>],
    "sku": <?= json_encode($product['id']) ?>,
    "offers": {
      "@type": "Offer",
      "price": <?= json_encode((string)$priceVal) ?>,
      "priceCurrency": "BDT",
      "availability": "https://schema.org/InStock",
      "url": <?= json_encode($canonicalUrl) ?>
    }
  }
  </script>

  <!-- Instant redirect for real web browsers to the client-side SPA -->
  <script>window.location.replace(<?= json_encode('/products/' . $slug) ?>);</script>
  <meta http-equiv="refresh" content="0;url=/products/<?= urlencode($slug) ?>">
</head>
<body style="font-family:sans-serif;padding:2rem;text-align:center;">
  <h1><?= htmlspecialchars($product['name']) ?></h1>
  <p><?= htmlspecialchars($desc) ?></p>
  <p><strong>Price:</strong> <?= htmlspecialchars($priceVal) ?> BDT</p>
  <p><a href="/products/<?= urlencode($slug) ?>">Click here if you are not redirected automatically</a></p>
</body>
</html>
