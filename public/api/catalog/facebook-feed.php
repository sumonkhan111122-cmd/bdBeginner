<?php
/**
 * Facebook (Meta) Product Catalog Feed Generator for bdBeginner
 * 
 * Supports:
 * - XML RSS 2.0 (Google Merchant / Facebook Catalog standard)
 * - CSV (when requested with ?format=csv)
 * 
 * Works out-of-the-box on cPanel Apache + PHP 7.4/8.0+
 */

// Load Supabase credentials
$supabaseUrl = getenv('VITE_SUPABASE_URL') ?: getenv('SUPABASE_URL') ?: 'https://ldmpxupslnfgzmmtpyat.supabase.co';
$supabaseKey = getenv('SUPABASE_SERVICE_ROLE_KEY') ?: getenv('VITE_SUPABASE_ANON_KEY') ?: '';

// Try reading from .env.local or .env if present
$envFile = __DIR__ . '/../../../../.env.local';
if (!file_exists($envFile)) $envFile = __DIR__ . '/../../../.env.local';
if (!file_exists($envFile)) $envFile = __DIR__ . '/../../.env.local';
if (!file_exists($envFile)) $envFile = __DIR__ . '/../../.env';

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

// Determine site base URL
$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? 'https://' : 'http://';
$host = $_SERVER['HTTP_HOST'] ?? 'bdbeginner.com';
$baseUrl = rtrim($protocol . $host, '/');

// Fetch published products from Supabase REST API
$ch = curl_init();
$apiUrl = rtrim($supabaseUrl, '/') . '/rest/v1/products?status=eq.published&select=id,name,slug,price,compare_at_price,short_description,description,thumbnail_url,categories(name)&order=created_at.desc';

curl_setopt($ch, CURLOPT_URL, $apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 15);
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

// Helpers
function cleanText($text, $maxLen = 5000) {
    if (!$text) return '';
    $clean = strip_tags($text);
    $clean = html_entity_decode($clean, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    $clean = preg_replace('/\s+/', ' ', $clean);
    $clean = trim($clean);
    if (mb_strlen($clean) > $maxLen) {
        $clean = mb_substr($clean, 0, $maxLen - 3) . '...';
    }
    return $clean;
}

function cleanPrice($val) {
    $num = floatval($val);
    return number_format(max(0, $num), 2, '.', '');
}

$format = isset($_GET['format']) ? strtolower(trim($_GET['format'])) : 'xml';

// Enable caching (1 hour)
header('Cache-Control: public, max-age=3600');

if ($format === 'csv') {
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: inline; filename="facebook-catalog.csv"');
    
    $out = fopen('php://output', 'w');
    fputcsv($out, ['id', 'title', 'description', 'availability', 'condition', 'price', 'link', 'image_link', 'brand', 'sale_price', 'google_product_category']);
    
    foreach ($products as $p) {
        $slug = $p['slug'] ?? '';
        $link = $baseUrl . '/products/' . rawurlencode($slug);
        $image = !empty($p['thumbnail_url']) ? $p['thumbnail_url'] : ($baseUrl . '/favicon.svg');

        $regPrice = !empty($p['compare_at_price']) ? cleanPrice($p['compare_at_price']) : cleanPrice($p['price'] ?? 0);
        $salePrice = (!empty($p['compare_at_price']) && floatval($p['price']) < floatval($p['compare_at_price'])) ? cleanPrice($p['price']) : '';

        $desc = cleanText($p['short_description'] ?? $p['description'] ?? $p['name']);

        fputcsv($out, [
            $p['id'],
            cleanText($p['name'], 150),
            $desc,
            'in stock',
            'new',
            $regPrice . ' BDT',
            $link,
            $image,
            'bdBeginner',
            $salePrice ? ($salePrice . ' BDT') : '',
            'Software > Digital Goods'
        ]);
    }
    fclose($out);
    exit;
}

// Default: XML (Google / Meta Merchant standard RSS 2.0)
header('Content-Type: application/xml; charset=utf-8');

echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>bdBeginner Products Catalog</title>
    <link><?= htmlspecialchars($baseUrl) ?></link>
    <description>bdBeginner — Premium Digital Products, Themes, Plugins &amp; Web Services</description>
    <?php foreach ($products as $p): ?>
      <?php
        $slug = $p['slug'] ?? '';
        $link = $baseUrl . '/products/' . rawurlencode($slug);
        $image = !empty($p['thumbnail_url']) ? $p['thumbnail_url'] : ($baseUrl . '/favicon.svg');

        $regularPrice = !empty($p['compare_at_price']) ? cleanPrice($p['compare_at_price']) : cleanPrice($p['price'] ?? 0);
        $salePrice = (!empty($p['compare_at_price']) && floatval($p['price']) < floatval($p['compare_at_price'])) 
            ? cleanPrice($p['price']) 
            : null;

        $desc = cleanText($p['short_description'] ?? $p['description'] ?? $p['name']);
        $catName = !empty($p['categories']['name']) ? cleanText($p['categories']['name']) : 'Digital Goods';
      ?>
      <item>
        <g:id><?= htmlspecialchars($p['id']) ?></g:id>
        <g:title><![CDATA[<?= cleanText($p['name'], 150) ?>]]></g:title>
        <g:description><![CDATA[<?= $desc ?>]]></g:description>
        <g:link><?= htmlspecialchars($link) ?></g:link>
        <g:image_link><?= htmlspecialchars($image) ?></g:image_link>
        <g:brand>bdBeginner</g:brand>
        <g:condition>new</g:condition>
        <g:availability>in stock</g:availability>
        <g:price><?= $regularPrice ?> BDT</g:price>
        <?php if ($salePrice !== null): ?>
          <g:sale_price><?= $salePrice ?> BDT</g:sale_price>
        <?php endif; ?>
        <g:product_type><![CDATA[<?= $catName ?>]]></g:product_type>
        <g:google_product_category>Software &gt; Digital Goods</g:google_product_category>
        <g:fb_product_category>software</g:fb_product_category>
      </item>
    <?php endforeach; ?>
  </channel>
</rss>
