# cPanel Deployment & Update Guide (bdbeginner)

This guide explains how to deploy the React SPA frontend and the automated **Multi-Step Download Link Extractor** to **cPanel Shared Hosting**.

---

## 1. Architecture on cPanel

* **Frontend:** Built with React + Vite (`dist/` folder). Uploaded to cPanel's `public_html/`.
* **Routing & Security:** Handled by `.htaccess` in `public_html/` (automatically included in `dist/.htaccess`), ensuring client-side React Router links work without 404 errors.
* **Download Link Extraction API on cPanel:**
  * **Native PHP API:** `public_html/api/weadown/index.php` handles:
    * `/api/weadown/queue-status` (Live database statistics)
    * `/api/weadown/extract-single` (On-demand extraction)
    * `/api/weadown/recover-downloads` (Batch extraction with safe throttling)
    * `/api/weadown/retry-download`
  * **Supabase Edge Function Fallback:** If PHP or Apache rewrites are not enabled, the frontend automatically falls back to `supabase.functions.invoke('weadown-import')` directly, ensuring 100% uptime.

---

## 2. Steps to Build and Deploy to cPanel

### Step 1: Run the Production Build
On your computer/development environment, run:
```bash
npm run build
```
This compiles the entire frontend into the `dist/` directory, including:
* `dist/index.html` and assets
* `dist/.htaccess` (for React Router and API routing)
* `dist/api/weadown/index.php` (native cPanel PHP extractor API)

### Step 2: Upload to cPanel
1. Open **cPanel File Manager**.
2. Navigate to your website's document root (usually `public_html/` or a subdomain folder like `public_html/subdomain/`).
3. Compress the contents of your local `dist/` folder into a `.zip` file (e.g. `dist.zip`).
4. Upload `dist.zip` to `public_html/` and click **Extract**.
5. Ensure the extracted files are directly inside `public_html/` (so `index.html` and `.htaccess` are in `public_html/`, not inside a nested `dist/` folder).

### Step 3: Verify `.htaccess` Visibility
In cPanel File Manager:
* Click **Settings** (top-right corner).
* Check **"Show Hidden Files (dotfiles)"** and click **Save**.
* Verify that `.htaccess` is present in `public_html/`.

---

## 3. How the Features Work in cPanel Admin

1. **Auto-Extract on Import:**
   When you import products from WeaDown via the Admin Importer (`/admin/imports`), download links are automatically extracted and saved directly to `product_download_links` and `product_source_imports`.
2. **Recover Missing Links Button:**
   Click **"মিসিং লিংক রিকভার করুন"** in the Admin Importer. It processes products in chunks of 5 with a 2-second polite throttle, updating live progress until all missing links are recovered.
3. **Protected Downloads:**
   Extracted download links are strictly protected behind your existing purchase authorization function (`supabase/functions/external-downloads`). Only users with paid orders can access the download links.
