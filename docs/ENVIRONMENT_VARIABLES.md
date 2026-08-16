# Environment variable inventory

Keep Preview/Staging and Production values separate. Vercel `VITE_*` values are embedded in the browser bundle and must never contain a database password, service-role key, SMTP password, bKash secret, or backup passphrase.

## Vercel browser build

| Name | Required | Notes |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | yes | Environment-specific Supabase project URL. |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | yes | Public publishable/anon key only. `VITE_SUPABASE_ANON_KEY` is supported as a legacy fallback. |
| `VITE_SITE_URL` | yes | Canonical environment origin; Production must be `https://bdbeginner.com`. |
| `VITE_TURNSTILE_SITE_KEY` | yes for Preview/Production | Public Turnstile site key. Production sign-in fails closed if absent. |
| `VITE_GOOGLE_AUTH_ENABLED` | yes | Set `true` only after the matching Supabase Google provider and redirect URLs work in that environment. |

## Supabase Edge Function secrets

| Name | Used by | Requirement |
| --- | --- | --- |
| `SITE_URL` | payment redirects, emails, CORS | Exact environment origin. |
| `CORS_ORIGIN` | all Edge Functions | Optional explicit override; one exact trusted origin per environment. |
| `SUPABASE_URL` | all server functions | Supabase-provided server value. |
| `SUPABASE_SERVICE_ROLE_KEY` | all privileged functions | Secret; server only. |
| `SUPABASE_ANON_KEY` | external downloads | Public key used by a user-scoped server client. |
| `DELIVERY_ENCRYPTION_KEY` | secure fulfillment | Secret 32-byte key encoded as Base64. Required before fulfillment. |
| `DELIVERY_ENCRYPTION_VERSION` | secure fulfillment | Positive integer key/payload version. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | order notification | Transactional SMTP transport. |
| `SMTP_FROM_EMAIL`, `SMTP_FROM_NAME` | order notification | Orders sender identity. |
| `AUTH_SMTP_FROM_EMAIL`, `AUTH_SMTP_FROM_NAME` | activation email | Optional dedicated auth sender identity. |
| `ADMIN_ORDER_EMAIL` | order/review notification | Internal recipient address. |
| `BKASH_USERNAME`, `BKASH_PASSWORD` | direct bKash | Server-only merchant credentials. |
| `BKASH_APP_KEY`, `BKASH_APP_SECRET` | direct bKash | Server-only API credentials. |
| `BKASH_BASE_URL` | direct bKash | Sandbox in Preview/Staging; live only in Production after approval. |

Supabase Auth CAPTCHA secret configuration belongs in Authentication settings, not in a `VITE_*` variable. Custom Auth SMTP is also configured separately in Authentication settings.

## GitHub Actions backup secrets

- `PROD_SUPABASE_URL`
- `PROD_SUPABASE_SERVICE_ROLE_KEY`
- `PROD_SUPABASE_DB_URL`
- `BACKUP_ENCRYPTION_PASSPHRASE`

The backup passphrase must be stored separately from downloaded backup artifacts. See `docs/BACKUP_AND_RESTORE.md`.
