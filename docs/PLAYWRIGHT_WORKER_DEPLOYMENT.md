# Multi-Step Download Link Extractor & Worker Deployment Guide

## 1. Current Hosting Architecture Inspection

| Component | Platform | Environment | Playwright Support | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend** | Netlify / Vercel | Static Web Hosting (`dist/`) | ❌ No | Static CDN hosting cannot run Chromium or headless browser binaries. |
| **Database & Auth** | Supabase | PostgreSQL + PostgREST | N/A | Secure relational store for products and purchase authorizations. |
| **Edge Functions** | Supabase Functions | Deno Deploy Serverless | ❌ No | Max 150MB memory/bundle limit; lacks system C++ libs and sandboxed Chromium binaries. |
| **Local Dev Server** | Node.js (Vite) | Windows / Linux / Mac | ✅ **Yes (Full)** | Uses `weadownApiPlugin` + Playwright Chromium. Zero setup needed for development. |
| **Production Worker** | Render / Railway / Fly.io / VPS | Docker Container | ✅ **Yes (Full)** | Uses official Microsoft Playwright image (`worker/Dockerfile`). |

---

## 2. Extraction Flow Overview

The multi-step browser extractor automates the legitimate download flow without bypassing security or downloading large packages:

```
[Original Post URL] 
        │
        ▼ (Finds file link)
[Intermediate Download Page (/files/<slug>/)]
        │
        ▼ (Clicks "Generate Secure Link")
[Dynamic Countdown Detection]
        │ ── (Waits for class 'zmk-is-ready' and API response /zmk/complete/)
        ▼ (Follows legitimate session redirect & referer)
[Final File Hosting URL (e.g. Zifury / Drive / Direct)]
        │
        ├── Saves to `product_download_links` (direct download URL)
        └── Stores { source_post_url, download_page_url, final_download_url } in `product_source_imports.metadata`
```

---

## 3. Deployment Options for Production

To run Playwright browser automation in production without breaking your Netlify / Vercel website or Supabase backend:

### Option A: Railway / Render Docker Deployment (Recommended)

1. Connect your repository to **Railway** (or **Render**).
2. Set Root Directory to the `project` folder.
3. Railway automatically detects `worker/Dockerfile`.
4. Add environment variables:
   - `VITE_SUPABASE_URL`: Your Supabase URL (`https://...supabase.co`)
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase Service Role Key
   - `PORT`: `3001`
   - `WORKER_AUTH_TOKEN`: (Optional) Secret key to restrict HTTP access.
5. In your frontend `.env.production` or admin settings, point `VITE_EXTRACTOR_WORKER_URL` to your Railway/Render URL (e.g. `https://bdbeginner-worker.up.railway.app`).

### Option B: VPS / Docker Container Deployment

If you have a Linux VPS (Ubuntu / Debian):

```bash
cd project
docker build -t bdbeginner-playwright-worker -f worker/Dockerfile .
docker run -d --restart always -p 3001:3001 \
  -e VITE_SUPABASE_URL="https://...supabase.co" \
  -e SUPABASE_SERVICE_ROLE_KEY="your-service-role-key" \
  --name bdbeginner-worker bdbeginner-playwright-worker
```

### Option C: GitHub Actions Scheduled Batch Extractor

You can also run extraction on a scheduled GitHub Actions cron job using the CLI runner:

```bash
npm run extract:recover -- --limit=50
```

---

## 4. Admin Features

1. **Automatic Extraction on Import**: Every product imported or updated is automatically added to the low-concurrency queue.
2. **Missing Link Recovery**: Click **"মিসিং লিংক রিকভার করুন"** in `/admin/imports` or run:
   ```bash
   npm run extract:recover
   ```
3. **Admin Row Badges**:
   - 🟢 **Success**: Extracted hosting link with direct test link.
   - 🔴 **Failed**: Displays failure reason with a **Retry** button.
   - 🟡 **In Queue / Retrying**: Currently queued in background.
   - ⚪ **Missing**: Shows **Extract Link** button.

---

## 5. Paid Download Protection

- Extracted final download links are stored in `product_download_links`.
- Customers only access download links through the authenticated `external-downloads` Supabase Edge Function (`/functions/v1/external-downloads`).
- The endpoint strictly verifies:
  1. `order.payment_status === 'paid'`
  2. Order ownership via user JWT or verified guest order access token.
  3. Digital product line item in order.
- Direct download URLs are **never** exposed publicly or to unpaid users.
