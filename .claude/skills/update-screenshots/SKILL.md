---
name: update-screenshots
description: Capture or refresh the Rhinestone dashboard screenshots used by the docs guides, using mock/stubbed data and no backend stack. Use when screenshots under images/dashboard/ are stale (dashboard redesign, new guide, changed labels) and need re-shooting.
---

# Update dashboard screenshots

Re-captures the dashboard screenshots that the docs guides embed (everything under `images/dashboard/<guide>/`). It runs the **real dashboard** dev server against a **mock user-service** that returns stubbed JSON, then drives a headless browser to screenshot each screen and modal. No postgres/redis/KMS/orchestrator needed.

Why this works: dashboard auth is entirely client-side — `pages/Main.vue` only checks `authClient.useSession()` (better-auth `GET /users/auth/get-session`); every other call is a `credentials:'include'` fetch. Return a non-null session + stubbed data and the app renders fully populated.

## Prerequisites

- A local checkout of the `dashboard` repo (sibling to this `docs` repo by default; override with `DASHBOARD_DIR`).
- `bun` (runs the mock + the dashboard dev server).
- A Playwright install + a chromium browser. The capture script auto-discovers both (npx cache + `~/.cache/ms-playwright`), or set `PLAYWRIGHT_PATH` / `CHROME_BIN`.

## Steps

1. **Check what the guides reference.** Grep the guides for image paths so the shot list matches reality:
   ```bash
   grep -rho '/images/dashboard/[^"]*' --include=*.mdx . | sort -u
   ```
   If a guide added/renamed a shot, add a matching capture in `scripts/shoot.mjs` (see "Adding a shot").

2. **Disable the Vue devtools plugin** in the dashboard's `vite.config.ts` (comment out `VueDevTools()`). Otherwise its floating "V" pill appears in every full-page shot. **Remember to restore it after.** (CSS-hiding the host element does not work — it renders in a shadow root.)

3. **Point the dashboard at the mock.** In the dashboard `.env`:
   ```
   VITE_USER_SERVICE_BASE_URL=http://localhost:3000
   VITE_APP_BASE_URL=http://localhost:5173
   ```
   Set the mock org's `ORG_ID` (in `scripts/mock-user-service.ts`) equal to `VITE_RHINESTONE_ORG_ID` to show the brand mark.

4. **Boot both servers.** Background them with `setsid` (see Gotchas):
   ```bash
   setsid bash -c 'bun run <skill>/scripts/mock-user-service.ts >/tmp/mock.log 2>&1' </dev/null >/dev/null 2>&1 &
   cd "$DASHBOARD_DIR" && setsid bash -c 'bun run dev >/tmp/dash.log 2>&1' </dev/null >/dev/null 2>&1 &
   sleep 4
   curl -s -o /dev/null -w 'mock:%{http_code} ' http://localhost:3000/users/me
   curl -s -o /dev/null -w 'dash:%{http_code}\n' http://localhost:5173/
   ```
   Both should report `200`.

5. **Capture.** `node <skill>/scripts/shoot.mjs` — writes PNGs into `images/dashboard/<guide>/` (auto-resolved relative to the skill; override with `SCREENSHOT_OUT`). It prints `OK`/`FAIL` per shot.

6. **Review every shot** by reading the PNGs. Check: auth passed (not stuck on `/login`), data populated, correct dialog, no stray toasts, dark theme. Re-run after fixing the mock data or the script.

7. **Validate links** and **clean up**: `bunx mintlify broken-links` (no new broken image refs); remove orphaned old screenshots; **restore `vite.config.ts`**; stop the servers (kill by PID — never `pkill -f vite`, see Gotchas).

## Adding a shot

In `scripts/shoot.mjs`, navigate to the route and call `shoot(page, '<guide>/<name>.png')`. For a modal, open it then `shoot(page, '<guide>/<name>.png', { dialog: true })` (crops to `[role="dialog"]`). For an unauthenticated screen, stub the session to null first: `page.route('**/users/auth/get-session*', r => r.fulfill({ body: 'null' }))`.

Role-gated controls (Create key, scopes editor, Refund) only render when the mock session `user.email` matches an org member with role OWNER/ADMIN — keep them aligned in `mock-user-service.ts`.

## Gotchas

- **Backgrounding:** use `setsid bash -c '…' </dev/null &`. A plain `&` (or a harness "run in background") gets the server killed by a signal (exit 144) when the launching turn ends.
- **Killing servers:** never `pkill -f "vite"` / `pgrep -f "vite"` — the pattern matches the shell running your own command and kills it (also exit 144). Find the PID (`pgrep -af vite`) and `kill <pid>`.
- **Playwright MCP** leaves a stale chrome `SingletonLock` ("Browser is already in use"). This skill drives Playwright via a script instead — don't mix the two.
- **CORS:** the mock must reflect the dashboard origin and `Access-Control-Allow-Credentials: true`, and answer `OPTIONS` (the service sets `Content-Type` on GETs, triggering preflight). Already handled in `scripts/mock-user-service.ts`.

## Files

- `scripts/mock-user-service.ts` — stub user-service (edit the data constants to change what renders).
- `scripts/shoot.mjs` — the capture script (edit the shot list / viewport).
