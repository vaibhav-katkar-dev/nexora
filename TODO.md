# Vercel Deployment Fixes — Task Tracker

## Goal
Fix the Vercel serverless crash (`ERR_REQUIRE_ESM` with nanoid) with deployment/build fixes only — no feature or logic changes.

## Steps
- [x] Analyze Vercel logs and repo state (root cause: nanoid@6 ESM-only dep + invalid root package.json)
- [x] Fix root `package.json` invalid JSON (missing comma between `scripts` and `workspaces`)
- [x] Remove `nanoid@^6.0.1` dependency from `apps/api/package.json`
- [x] Regenerate `package-lock.json` (no nanoid@6 installed into apps/api)
- [x] Rebuild via `npm run build:vercel` and verify the CommonJS bundle boots without nanoid
- [x] Commit & push to redeploy on Vercel

