# Product importer

The admin importer reads the newest entries from WeaDown's Rank Math post
sitemap and creates or updates catalog drafts. It is intentionally implemented
as a research-safe metadata demo:

- imports the latest 50 source titles, descriptions, versions, dates, and image
  references;
- creates new products with a default price of BDT 99;
- records a stable source mapping so later previews can detect updates;
- preserves an existing price during metadata updates unless **Also reset the
  price when applying updates** is selected;
- creates draft products, never auto-published products;
- attaches a generated text manifest as the test download instead of copying a
  third-party package.

## Deploy

1. Apply `supabase/migrations/20260818000000_add_product_source_imports.sql`.
2. Deploy the `weadown-import` and `demo-product-download` Edge Functions.
3. Deploy the frontend build.
4. Sign in as an administrator and open `/admin/imports`.

The importer endpoint requires an authenticated user listed in `admin_users`.
Source URLs are restricted to HTTPS URLs under `weadown.com/res/` to prevent
the endpoint from becoming a general-purpose server-side request proxy.

## Import and update workflow

1. Select **Preview latest 50**.
2. Review the new/update/current status and selected rows.
3. Keep the price at `99` and select **Import selected**.
4. Review the resulting drafts under **Products** before publishing anything.
5. Later, use **Check latest updates** and import the rows marked **Update
   available**.
6. To change all 50 prices to zero, enter `0`, select **Also reset the price
   when applying updates**, choose **Select all 50**, and import again.

