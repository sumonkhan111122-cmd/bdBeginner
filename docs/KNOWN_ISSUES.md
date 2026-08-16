# Known issues and open launch gates

Verified on 2026-08-16. This is a status record, not permission to change Production.

## Blockers

- Production Supabase Auth Site URL is the invalid value `bdbeginner-v2`; the redirect URL allow-list is empty.
- Production CAPTCHA/attack protection is disabled, and the required Preview/Production Turnstile configuration is not in place.
- Supabase Google Auth provider is disabled. The local UI now hides Google sign-in unless explicitly enabled after provider QA.
- Supabase custom Auth SMTP is disabled.
- Production is missing `DELIVERY_ENCRYPTION_KEY` and `DELIVERY_ENCRYPTION_VERSION`, so secure fulfillment cannot be trusted.
- Production has no Storage buckets; the required `product-images`/marketing asset backup cannot run.
- Production contains legacy authenticated catalog read policies that expose inactive/draft rows. The local hardening migration is not yet tested/applied.
- Production Edge Functions do not yet contain the local CORS and order-notification authorization/state hardening.
- Local migration history is incomplete compared with the manually evolved production schema; it must be reconciled before any push.
- The monthly backup workflow has not run, and no isolated restore drill has been completed.
- No separate Preview/Staging deployment or full production-like QA run has completed.
- No Production deployment or production smoke test has been authorized/performed.
- The live bKash environment is configured. A live financial test is deliberately pending explicit approval.
- Dependency vulnerability verification is incomplete because the registry-backed `npm audit` request was blocked by the execution environment.
- Git CLI is unavailable in this workspace, so the requested checkpoint commit and final tag cannot be created here.

## Non-blockers / follow-up

- Search Console, default OG image, GA4, and GTM are not configured. Search Console and OG image are launch gates; analytics IDs may remain intentionally absent if that decision is documented.
- Site settings currently omit contact/support email, phone, WhatsApp, logo, favicon, and social URLs. Safe UI fallbacks exist locally, but authoritative Production content remains a launch gate.
- Static sitemap includes the eight currently published product URLs. Regenerate it whenever published slugs change.
- Lint/typecheck/build pass locally. The browserslist dataset is outdated and should be refreshed in a dependency-maintenance change after registry access is available.
