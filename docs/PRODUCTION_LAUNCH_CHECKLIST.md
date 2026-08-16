# bdBeginner production launch checklist

No unchecked gate may be treated as implicitly passed. Preview/Staging must be completed before Production.

## Audit and local verification

- [x] `npm run typecheck` passes.
- [x] `npm run lint` exits with no errors.
- [x] `npm run build` passes.
- [x] Client bundle contains only an `anon` Supabase JWT role; no service-role/server secret was found.
- [x] SPA rewrite, security headers, error boundary, robots, and sitemap exist locally.
- [ ] Registry-backed dependency audit passes (external npm audit currently unavailable).
- [ ] Local migration history is reconciled to the full production schema.

## Preview/Staging gates

- [ ] Separate Staging Supabase project exists and is linked intentionally.
- [ ] Phase 12 hardening migration applies cleanly to Staging.
- [ ] Edge Functions deploy to Staging with Staging-only secrets and exact CORS origin.
- [ ] Vercel Preview has all required public variables and no server secret.
- [ ] Auth Site URL and allow-list contain the exact Preview callback URLs.
- [ ] Turnstile and custom Auth SMTP work in Staging.
- [ ] Google OAuth works before `VITE_GOOGLE_AUTH_ENABLED=true`.
- [ ] Catalog, cart, coupon, checkout, zero-total, manual payment, order, fulfillment, download, license, review, wishlist, analytics, email, PDF, mobile, and cross-browser QA pass.
- [ ] Direct bKash uses sandbox credentials only; no live financial test.

## Production configuration gates

- [ ] Supabase Auth Site URL is `https://bdbeginner.com` and redirect allow-list is complete.
- [ ] CAPTCHA/attack protection is enabled and verified.
- [ ] Custom Auth SMTP is enabled and verified.
- [ ] `DELIVERY_ENCRYPTION_KEY` and `DELIVERY_ENCRYPTION_VERSION` are configured.
- [ ] Product/marketing Storage bucket(s), including `product-images`, exist with reviewed policies.
- [ ] Site contact, support, logo, favicon, announcement, and social settings are complete.
- [ ] Search Console verification and a real default OG image are configured; GA4/GTM decision is recorded.
- [ ] Production Edge Function secrets match `docs/ENVIRONMENT_VARIABLES.md`.
- [ ] Fresh database and Storage backup succeeds and an isolated restore drill is recorded.
- [ ] Canonical domain, DNS, HTTPS, `robots.txt`, `sitemap.xml`, and security headers work on the deployment candidate.

## Approval and release gates

- [ ] Preview/Staging QA report has no blocker.
- [ ] Explicit approval to deploy the reviewed candidate to Production is recorded.
- [ ] Explicit approval for a live bKash financial test is recorded separately, if that test is required.
- [ ] Production non-financial smoke test passes after deployment.
- [ ] Approved live bKash test passes or is explicitly recorded as pending without claiming overall readiness.
- [ ] Final Phase 12 report says `READY FOR PRODUCTION` with no blocker.
- [ ] Only then create the final commit/tag (`prepare bdBeginner v1 for production launch`, `v1.0.0`).
