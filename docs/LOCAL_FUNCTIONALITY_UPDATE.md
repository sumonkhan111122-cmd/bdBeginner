# Local functionality update — 2026-11-07

The overall layout, typography, and branding are preserved. Product action buttons were subsequently refined at the user's request. No dependencies, database schema, migrations, payment configuration, or hosted services were changed. Existing workspace edits were retained.

## Implemented

- Catalog search, categories, delivery types, price ranges, deals, sort order, and pagination are stored in the URL. Refresh, shared links, and browser Back/Forward restore the selection.
- Clear/reset works on category and deals landing pages. Invalid pages and filter parameters are handled safely. Price bands include fractional prices without gaps. Search matches normalized words across product information; analytics wait until typing pauses.
- The cart persists between browser sessions, migrates the previous session cart, and synchronizes across tabs. Invalid or corrupt stored items and unavailable browser storage no longer break shopping.
- Pricing and coupon requests cannot overwrite a newer cart state. Changing quantities, removing products, and clearing the cart invalidate old results. Successful coupons avoid a redundant pricing request.
- The cart drawer supports keyboard focus containment, Escape, focus return, scroll locking, and an inert closed state.
- Guest wishlist/history survive failed account merges. Concurrent changes, sign-in transitions, and duplicate wishlist actions are guarded. Guest lists synchronize across tabs; views recorded during initialization are retained.
- Wishlist product-load failures show the existing retry state. Save buttons expose pressed/loading state to assistive technology.
- Product details reload when navigating to a different slug. Related products reload when their product becomes available. Old responses cannot replace the current product.
- Concurrent catalog reads share one pending request; settled responses are not cached, so retries and later reads remain fresh.
- Header search supports Ctrl+K, Cmd+K, and `/`. Escape returns focus. Search and mobile navigation close each other and dismiss on outside clicks.
- FAQ instances have unique accessible IDs and support Arrow Up/Down, Home, and End navigation.
- Explicit imports load the icons used by the site. Images decode asynchronously; the logo and main product image load eagerly.
- Product cards have a consistent, full-width action beneath the price: green **Download** for free resources, blue **Add to cart** for paid resources, and **Buy now** for paid courses using their existing course route. Free actions use the existing download service, disable duplicate clicks while preparing, retain a ready link when popups are blocked, and show retry feedback on failure. The mobile detail action spells out **Add to cart** and fits narrow screens.

## Local verification

```sh
npm run typecheck
npm run test:offline
npm run build
```

Offline tests exercise the actual React components in local headless Chromium, using fixtures and intercepted requests. They do not start an HTTP server or contact production, Supabase, payment gateways, or other external services. Fixtures exist only in QA scripts and do not replace runtime catalog data.

The checks cover URL/history behavior, catalog boundaries, corrupted/blocked storage, cart synchronization, pricing/coupon races, drawer keyboard behavior, wishlist merges/rollback, delayed initialization, product navigation, catalog request sharing/retry, search shortcuts, and FAQ accessibility.

The production build's main JavaScript chunk changed from approximately 882 KB (168 KB gzip) to 144 KB (42 KB gzip). This measures the main chunk, not total page weight or a live speed score.

Real backend integration, payment processing, and visual checks against live catalog content were intentionally not run.

## Suggested follow-up

- Connect the contact form to direct email delivery; it currently opens the visitor's email app.
- Connect the unused newsletter form to a real subscription service before displaying it.
- Add product comparison if customers need to choose between similar tools or licenses.
- Add a Bengali/English language option after preparing translated product and support content.
