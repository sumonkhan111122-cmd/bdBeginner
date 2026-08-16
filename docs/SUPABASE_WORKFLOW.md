# Safe Supabase migration and function workflow

Use three distinct targets: local, Preview/Staging, and Production. Supabase recommends separate staging and production projects and migration-based releases; remote Dashboard schema edits bypass migration history and should stop once reconciliation is complete.

## One-time reconciliation

Production contains historical schema work that is not fully represented by the four older local migration files. Do not run `db push` against Production until an operator has:

1. taken a fresh encrypted backup;
2. compared `supabase migration list` with `supabase/migrations`;
3. captured the authoritative remote schema using `supabase db pull` on a temporary reconciliation branch;
4. reviewed the generated SQL for destructive drift and secrets;
5. tested a clean local reset and a separate staging project.

Never use `supabase db reset --linked` against Production; it destroys remote data.

## Normal change flow

1. Authenticate locally with `supabase login`; do not commit the access token.
2. Start the local stack with `supabase start`.
3. Create an immutable migration with `supabase migration new descriptive_name`.
4. Test from a clean local database with `supabase db reset` and run application QA.
5. Link only to the Staging project: `supabase link --project-ref STAGING_PROJECT_REF`.
6. Review `supabase migration list` and `supabase db push --dry-run`.
7. Apply to Staging with `supabase db push`, deploy only the reviewed functions, and run production-like QA with sandbox bKash credentials.
8. Record migration IDs, function versions, QA evidence, and rollback steps.
9. Re-link to Production only during the approved change window, rerun `supabase db push --dry-run`, take a fresh backup, and wait for explicit production approval.
10. Apply once, verify migrations/functions, and complete a non-financial production smoke test. A live bKash payment requires separate explicit approval.

Never put a database password or access token in Git, command history pasted into issues, build output, or client variables. Official references: https://supabase.com/docs/guides/deployment/database-migrations and https://supabase.com/docs/guides/deployment/managing-environments.
