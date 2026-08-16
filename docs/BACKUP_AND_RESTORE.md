# Production backup and restore runbook

The monthly workflow creates a PostgreSQL custom-format dump plus a recursive copy of every Supabase Storage bucket. It encrypts the combined archive with AES-256 before upload and retains multiple monthly artifacts outside the primary Supabase project.

## Required repository secrets

- `PROD_SUPABASE_URL`
- `PROD_SUPABASE_SERVICE_ROLE_KEY`
- `PROD_SUPABASE_DB_URL`
- `BACKUP_ENCRYPTION_PASSPHRASE`

Never place their values in Git, workflow logs, issues, or this document. Limit repository Actions/artifact access to trusted maintainers and rotate the service role key if exposure is suspected.

## Schedule, retention, and failure handling

The workflow runs at 02:15 UTC on the first day of each month and can also be run manually. Each encrypted artifact is retained for 90 days, giving three independent monthly recovery points. A failed run remains visible in Actions and opens a repository issue; it must not be closed until a successful rerun exists.

`product-images` is a required bucket. A run fails if that bucket is absent, but still attempts to upload the encrypted diagnostic backup. Add any other required bucket names to `REQUIRED_STORAGE_BUCKETS` as a comma-separated list.

## Safe restore verification

Never restore over production during a drill.

1. Download one encrypted artifact and its checksum into an isolated machine.
2. Verify the checksum: `sha256sum --check production-backup-RUN_ID.sha256`.
3. Decrypt with the separately stored passphrase: `gpg --output production-backup.tar.gz --decrypt production-backup-RUN_ID.tar.gz.gpg`.
4. Extract into a temporary directory: `tar -xzf production-backup.tar.gz`.
5. Confirm `pg_restore --list backup/database/production.dump` succeeds and includes critical business tables such as orders, order_items, payment_transactions, fulfillments, products, coupons, and product_reviews.
6. Create a disposable, isolated PostgreSQL/Supabase test project. Restore with `pg_restore --clean --if-exists --no-owner --no-acl --dbname TEST_DATABASE_URL backup/database/production.dump`.
7. Compare row counts and sample non-sensitive records against the manifest/checklist. Do not send emails, invoke payment functions, or use live bKash credentials from the isolated project.
8. Confirm `backup/storage/storage-manifest.json` lists every required bucket and that representative files open correctly.
9. Delete the disposable environment and local plaintext only after recording the drill date, operator, artifact run ID, results, and any remediation.

A workflow success is not a restore test. Before launch, complete and record at least one isolated drill.
