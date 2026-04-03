# Cloudflare Migration Checklist

Date: 2026-04-03

## What Is Already Confirmed

- Local changes are not pushed because there is no configured git remote (`origin`) and no commit after initial scaffold commit.
- There are 46 staged files with major app updates (admin panel, API routes, JSON storage, UI updates).
- Project currently uses file-based JSON storage via `fs` in `src/lib/db.ts`.
- Project uses SSR and route handlers in Next.js App Router.

## Questions To Resolve (In Order)

1. Target runtime on Cloudflare:
   - Cloudflare Pages + Workers (recommended for Next.js SSR on Cloudflare)
   - Alternative: Cloudflare-based container/VM hosting (if strict Node-only APIs must remain)

2. Data storage replacement for `fs` JSON:
   - Option A: Cloudflare D1 (SQL)
   - Option B: Cloudflare KV (key-value)
   - Option C: External DB (Supabase/Postgres/etc.)
   - Note: local file writes are not durable/supported as a production DB on Workers.

3. Email sending path on Cloudflare:
   - Keep SMTP approach (verify compatibility in worker runtime)
   - Switch to API mail provider (Resend/Mailgun/SendGrid), usually simpler on Workers

4. SSR/build adapter setup for Cloudflare:
   - Add Cloudflare-compatible Next.js deployment setup (OpenNext for Cloudflare)
   - Add Cloudflare config and build/deploy scripts

5. Environment and secrets migration:
   - Move env vars from Vercel/project local to Cloudflare secrets/vars
   - Validate admin/auth/session behavior in production

6. Git publication and deployment pipeline:
   - Add `origin`
   - Commit staged changes in logical commits
   - Push to GitHub
   - Connect repo to Cloudflare deployment flow

## Current Status

- [x] Detect why changes were not pushed
- [x] Identify main Cloudflare incompatibility areas (`fs` and SMTP runtime assumptions)
- [ ] Choose Cloudflare runtime target
- [ ] Choose DB strategy
- [ ] Implement migration in code and config
- [ ] Push to GitHub and configure Cloudflare deploy
