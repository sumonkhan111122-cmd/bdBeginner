<?php
/**
 * cPanel Native PHP API for WeaDown Download Link Extraction
 * 
 * Works out-of-the-box on standard cPanel Apache + PHP 7.4/8.0+ hosting.
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 1. Load Supabase credentials
$supabaseUrl = getenv('VITE_SUPABASE_URL') ?: getenv('SUPABASE_URL') ?: 'https://ldmpxupslnfgzmmtpyat.supabase.co';
$supabaseKey = getenv('SUPABASE_SERVICE_ROLE_KEY') ?: getenv('VITE_SUPABASE_ANON_KEY') ?: '';

// Try reading from .env.local or .env if present
$envFile = __DIR__ . '/../../../.env.local';
if (!file_exists($envFile)) $envFile = __DIR__ . '/../../../.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        list($name, $value) = explode('=', $line, 2) + [null, null];
        if ($name && $value !== null) {
            $name = trim($name);
            $value = trim($value, " \t\n\r\0\x0B\"'");
            if ($name === 'VITE_SUPABASE_URL' && !$supabaseUrl) $supabaseUrl = $value;
            if ($name === 'SUPABASE_SERVICE_ROLE_KEY' && !$supabaseKey) $supabaseKey = $value;
            if ($name === 'VITE_SUPABASE_ANON_KEY' && !$supabaseKey) $supabaseKey = $value;
        }
    }
}

// 2. Parse request endpoint
$endpoint = isset($_GET['endpoint']) ? trim($_GET['endpoint'], '/') : '';
if (!$endpoint) {
    $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $parts = explode('/api/weadown/', $uri);
    $endpoint = isset($parts[1]) ? trim($parts[1], '/') : '';
}

// 3. Helper functions
function httpGet($url, $referer = '', $cookie = '') {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    $headers = ['Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'];
    if ($referer) $headers[] = "Referer: $referer";
    if ($cookie) $headers[] = "Cookie: $cookie";
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_HEADER, true);
    $response = curl_exec($ch);
    $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    $headersStr = substr($response, 0, $headerSize);
    $body = substr($response, $headerSize);
    $info = curl_getinfo($ch);
    curl_close($ch);
    return ['headers' => $headersStr, 'body' => $body, 'info' => $info];
}

function httpPost($url, $data, $referer = '', $cookie = '') {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    $headers = [
        'Content-Type: application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With: XMLHttpRequest',
        'Origin: https://weadown.com'
    ];
    if ($referer) $headers[] = "Referer: $referer";
    if ($cookie) $headers[] = "Cookie: $cookie";
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    $body = curl_exec($ch);
    $info = curl_getinfo($ch);
    curl_close($ch);
    return ['body' => $body, 'info' => $info];
}

function supabaseRequest($url, $method = 'GET', $data = null, $supabaseKey = '') {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    $headers = [
        "apikey: $supabaseKey",
        "Authorization: Bearer $supabaseKey",
        'Content-Type: application/json',
        'Prefer: return=representation'
    ];
    if ($data !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    $body = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return ['code' => $code, 'data' => json_decode($body, true)];
}

function extractDownloadLink($sourcePostUrl) {
    // Step 1: Product page
    $postRes = httpGet($sourcePostUrl);
    if (!preg_match('/href=["\'](https?:\/\/weadown\.com\/files\/[^"\']+)["\']/i', $postRes['body'], $fileMatch)) {
        return ['success' => false, 'error' => 'No files link found on product page'];
    }
    $filePageUrl = $fileMatch[1];

    // Step 2: Download page
    $fileRes = httpGet($filePageUrl, $sourcePostUrl);
    $cookie = '';
    if (preg_match('/Set-Cookie:\s*(zmk_vid=[^;]+)/i', $fileRes['headers'], $cMatch)) {
        $cookie = $cMatch[1];
    }
    if (!preg_match('/data-slug="([^"]+)"/i', $fileRes['body'], $slugMatch)) {
        return ['success' => false, 'error' => 'data-slug not found'];
    }
    $slug = $slugMatch[1];

    // Step 3: Start session
    $requestId = bin2hex(random_bytes(16));
    $startRes = httpPost('https://weadown.com/zmk/start/?link_type=file', [
        'request_id' => $requestId,
        'slugs' => $slug
    ], $filePageUrl, $cookie);

    $startData = json_decode($startRes['body'], true);
    if (empty($startData['items'][0]['token'])) {
        return ['success' => false, 'error' => 'Start rejected: ' . ($startData['message'] ?? 'Unknown')];
    }

    $token = $startData['items'][0]['token'];
    $waitSec = max(1, min(15, (int)($startData['items'][0]['wait_seconds'] ?? 10)));
    sleep($waitSec + 1);

    // Step 4: Complete session
    $completeRes = httpPost('https://weadown.com/zmk/complete/?link_type=file', [
        'tokens' => $token
    ], $filePageUrl, $cookie);

    $completeData = json_decode($completeRes['body'], true);
    if (empty($completeData['items'][0]['go_url'])) {
        return ['success' => false, 'error' => 'Complete rejected: ' . ($completeData['message'] ?? 'Unknown')];
    }

    $goUrl = $completeData['items'][0]['go_url'];

    // Step 5: Follow go_url redirect
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $goUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    curl_setopt($ch, CURLOPT_HTTPHEADER, ["Referer: $filePageUrl", "Cookie: $cookie"]);
    curl_setopt($ch, CURLOPT_HEADER, true);
    $goResponse = curl_exec($ch);
    curl_close($ch);

    $finalUrl = $goUrl;
    if (preg_match('/Location:\s*([^\r\n]+)/i', $goResponse, $locMatch)) {
        $finalUrl = trim($locMatch[1]);
    }

    // Extract filename
    $packageName = basename(parse_url($finalUrl, PHP_URL_PATH));
    if (!$packageName || strpos($packageName, '.') === false) {
        $packageName = 'download-package.zip';
    }

    return [
        'success' => true,
        'sourcePostUrl' => $sourcePostUrl,
        'downloadPageUrl' => $filePageUrl,
        'finalDownloadUrl' => $finalUrl,
        'packageName' => $packageName,
        'fileSize' => null,
        'extractionEngine' => 'cpanel_php_http'
    ];
}

// 4. Route handling
$rawInput = file_get_contents('php://input');
$body = json_decode($rawInput, true) ?: [];

if ($endpoint === 'queue-status') {
    $res = supabaseRequest("$supabaseUrl/rest/v1/product_source_imports?select=id,product_id,source_url,source_title,metadata,created_at&order=created_at.desc", 'GET', null, $supabaseKey);
    $items = $res['data'] ?: [];
    $success = 0; $failed = 0; $pending = 0; $history = [];
    foreach ($items as $imp) {
        $flow = $imp['metadata']['download_flow'] ?? null;
        if (!empty($flow['status']) && $flow['status'] === 'success' && !empty($flow['final_download_url'])) {
            $success++;
            if (count($history) < 10) {
                $history[] = [
                    'productId' => $imp['product_id'],
                    'sourceTitle' => $imp['source_title'],
                    'sourceUrl' => $imp['source_url'],
                    'status' => 'success',
                    'result' => [
                        'finalDownloadUrl' => $flow['final_download_url'],
                        'downloadPageUrl' => $flow['download_page_url'] ?? '',
                        'packageName' => $flow['package_name'] ?? '',
                        'fileSize' => $flow['file_size'] ?? ''
                    ],
                    'finishedAt' => $flow['extracted_at'] ?? ''
                ];
            }
        } elseif (!empty($flow['status']) && $flow['status'] === 'failed') {
            $failed++;
        } else {
            $pending++;
        }
    }
    echo json_encode([
        'success' => true,
        'pending' => $pending,
        'processing' => 0,
        'retry' => 0,
        'successCount' => $success,
        'failedCount' => $failed,
        'totalCount' => count($items),
        'recentHistory' => $history
    ]);
    exit;
}

if (($endpoint === 'extract-single' || $endpoint === 'extract_single' || $endpoint === 'retry-download' || $endpoint === 'retry_download') && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $productId = $body['productId'] ?? '';
    $sourceUrl = $body['sourceUrl'] ?? '';
    if (!$productId || !$sourceUrl) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing productId or sourceUrl']);
        exit;
    }

    $result = extractDownloadLink($sourceUrl);
    if ($result['success'] && !empty($result['finalDownloadUrl'])) {
        // Save to product_download_links
        supabaseRequest("$supabaseUrl/rest/v1/product_download_links", 'POST', [
            'product_id' => $productId,
            'title' => $result['packageName'],
            'download_url' => $result['finalDownloadUrl'],
            'is_active' => true,
            'sort_order' => 0
        ], $supabaseKey);

        echo json_encode([
            'success' => true,
            'result' => $result,
            'finalDownloadUrl' => $result['finalDownloadUrl'],
            'downloadPageUrl' => $result['downloadPageUrl'],
            'packageName' => $result['packageName'],
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'error' => $result['error'] ?? 'Extraction failed',
            'finalDownloadUrl' => null,
            'result' => $result,
        ]);
    }
    exit;
}

if (($endpoint === 'recover-downloads' || $endpoint === 'recover_downloads') && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $batchSize = max(1, min(10, (int)($body['batchSize'] ?? 5)));
    $res = supabaseRequest("$supabaseUrl/rest/v1/product_source_imports?select=id,product_id,source_url,source_title,metadata&order=created_at.desc", 'GET', null, $supabaseKey);
    $items = $res['data'] ?: [];
    
    $pending = [];
    foreach ($items as $imp) {
        $flow = $imp['metadata']['download_flow'] ?? null;
        if (empty($flow) || empty($flow['final_download_url']) || $flow['status'] !== 'success') {
            $pending[] = $imp;
        }
    }

    $batch = array_slice($pending, 0, $batchSize);
    $results = [];

    foreach ($batch as $item) {
        $res = extractDownloadLink($item['source_url']);
        if ($res['success'] && !empty($res['finalDownloadUrl'])) {
            supabaseRequest("$supabaseUrl/rest/v1/product_download_links", 'POST', [
                'product_id' => $item['product_id'],
                'title' => $res['packageName'],
                'download_url' => $res['finalDownloadUrl'],
                'is_active' => true,
                'sort_order' => 0
            ], $supabaseKey);
            $results[] = [
                'productId' => $item['product_id'],
                'status' => 'success',
                'downloadUrl' => $res['finalDownloadUrl'],
                'packageName' => $res['packageName'],
            ];
        } else {
            $results[] = ['productId' => $item['product_id'], 'status' => 'failed', 'error' => $res['error'] ?? 'Extraction failed'];
        }
        sleep(2);
    }

    echo json_encode([
        'success' => true,
        'processed' => count($results),
        'remaining' => max(0, count($pending) - count($batch)),
        'totalRemaining' => count($pending),
        'results' => $results
    ]);
    exit;
}

// Fallback: Proxy any other endpoint to Supabase Edge Function
$edgeUrl = "$supabaseUrl/functions/v1/weadown-import";
$ch = curl_init($edgeUrl);
$proxyHeaders = ['Content-Type: application/json'];
if ($supabaseKey) {
    $proxyHeaders[] = "Authorization: Bearer $supabaseKey";
    $proxyHeaders[] = "apikey: $supabaseKey";
}
if (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
    $proxyHeaders[] = 'Authorization: ' . $_SERVER['HTTP_AUTHORIZATION'];
}

$payload = $body;
if (empty($payload['action'])) {
    if ($endpoint === 'preview') $payload['action'] = 'preview';
    else if ($endpoint === 'check-updates' || $endpoint === 'check_updates') $payload['action'] = 'check_updates';
    else if ($endpoint === 'import') $payload['action'] = 'import';
    else if ($endpoint === 'queue-status' || $endpoint === 'queue_status') $payload['action'] = 'queue_status';
    else if ($endpoint === 'extract-single' || $endpoint === 'extract_single') $payload['action'] = 'extract_single';
    else if ($endpoint === 'recover-downloads' || $endpoint === 'recover_downloads') $payload['action'] = 'recover_downloads';
}
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (empty($payload['sourceUrl']) && !empty($_GET['url'])) $payload['sourceUrl'] = $_GET['url'];
    if (empty($payload['limit']) && !empty($_GET['limit'])) $payload['limit'] = (int)$_GET['limit'];
    if (empty($payload['page']) && !empty($_GET['page'])) $payload['page'] = (int)$_GET['page'];
}

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, $proxyHeaders);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
$edgeResponse = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($edgeResponse !== false && $httpCode >= 200 && $httpCode < 500) {
    http_response_code($httpCode);
    echo $edgeResponse;
    exit;
}

http_response_code(404);
echo json_encode(['error' => 'Endpoint not found', 'endpoint' => $endpoint]);
