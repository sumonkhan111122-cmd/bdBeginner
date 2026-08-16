# bdBeginner Project Guardrails

## Project Stack
This is the bdBeginner V2 digital commerce project.

**Frontend:**
* React
* Vite
* TypeScript
* Tailwind CSS

**Backend:**
* Supabase Database
* Supabase Auth
* Supabase Storage

**Supabase environment variables:**
* `VITE_SUPABASE_URL`
* `VITE_SUPABASE_PUBLISHABLE_KEY` (and `VITE_SUPABASE_ANON_KEY`)

**Important:** Never use `NEXT_PUBLIC_` environment variables because this is not a Next.js project.

## Supabase Client
Maintain exactly one shared production browser Supabase client.
Do not create separate clients for:
* storefront
* admin
* authentication
* catalog
unless explicitly requested and technically justified.

Never expose or use in browser code:
* service_role key
* Supabase secret key
* database password

## Authentication
Do not perform async Supabase database/API calls directly inside `onAuthStateChange`.
The auth state callback should update session state only.
Perform admin membership checks separately.

Admin authorization must use:
* Supabase Auth
* `public.admin_users`
* existing RLS

Never authorize admins using:
* hard-coded email
* localStorage role
* URL secrecy
* frontend-only boolean

## Catalog
Supabase is the single production source of truth for products and categories.
Never silently switch to:
* demo products
* mock products
* static fallback products
when Supabase fails.

On failure, show a proper error/retry state.
Admin login or customer login must never change the storefront product data source.

## Database Safety
Do not:
* change database schema
* create migrations
* modify RLS
* delete tables
* rename columns
* change Supabase connection
unless the user explicitly requests database work.
Before destructive database or data changes, explain what will change.

## Existing UI
Preserve approved bdBeginner storefront design unless explicitly asked to redesign it.
Do not unnecessarily rewrite working components.
Prefer targeted modifications over broad rewrites.

## Security
Keep all secrets out of source control.
Make sure `.env` and `.env.local` remain ignored by Git.
Do not log:
* access tokens
* refresh tokens
* API keys
* passwords

## Development Process
Before implementing a significant feature:
1. Inspect existing architecture.
2. Reuse existing components/services where appropriate.
3. Avoid duplicate implementations.
4. Make the smallest safe set of changes.
5. Run TypeScript/build checks.
6. Test the affected flow in the running browser.
7. Report exactly what changed.

## Regression Testing
After significant changes verify:
* storefront loads real Supabase products
* admin login still works
* admin → storefront → admin navigation still works
* logout → login works
* session survives refresh
* no static product fallback appears
* no console/runtime errors
* `npm run build` passes

## Git Safety
Do not commit `.env` or `.env.local`.
Before large risky changes, recommend or create a Git checkpoint when appropriate.
Do not perform destructive Git commands such as:
* `git reset --hard`
* force push
* deleting branches
unless explicitly requested.
