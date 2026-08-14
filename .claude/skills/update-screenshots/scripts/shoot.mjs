// Capture dashboard screenshots into images/dashboard/<guide>/.
// Run: node shoot.mjs   (after the mock + dashboard dev servers are up)
//
// Resolves Playwright + chromium automatically; override with PLAYWRIGHT_PATH /
// CHROME_BIN. Output dir defaults to the docs images dir (resolved relative to
// this script); override with SCREENSHOT_OUT. Dashboard URL: DASHBOARD_URL.

import { createRequire } from 'node:module'
import { readdirSync, existsSync, mkdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const __dirname = dirname(fileURLToPath(import.meta.url))

function findPlaywright() {
  if (process.env.PLAYWRIGHT_PATH) return process.env.PLAYWRIGHT_PATH
  try {
    return require.resolve('playwright')
  } catch {}
  const npx = join(homedir(), '.npm/_npx')
  if (existsSync(npx))
    for (const d of readdirSync(npx)) {
      const p = join(npx, d, 'node_modules/playwright/index.js')
      if (existsSync(p)) return p
    }
  throw new Error('playwright not found — set PLAYWRIGHT_PATH')
}

function findChrome() {
  if (process.env.CHROME_BIN) return process.env.CHROME_BIN
  const base = join(homedir(), '.cache/ms-playwright')
  if (!existsSync(base)) return undefined
  const subs = ['chrome-linux64/chrome', 'chrome-linux/chrome', 'chrome-mac/Chromium.app/Contents/MacOS/Chromium']
  for (const d of readdirSync(base).filter((x) => x.startsWith('chromium-')).sort().reverse())
    for (const s of subs) {
      const p = join(base, d, s)
      if (existsSync(p)) return p
    }
  return undefined // fall back to Playwright's own download
}

const { chromium } = require(findPlaywright())
const EXEC = findChrome()
const BASE = process.env.DASHBOARD_URL || 'http://localhost:5173'
const OUT = process.env.SCREENSHOT_OUT || join(__dirname, '../../../../images/dashboard')
const GROUPS = ['access', 'api-keys', 'team', 'jwt-keys', 'deposits', 'sponsorship']
for (const d of GROUPS) mkdirSync(`${OUT}/${d}`, { recursive: true })

// SHOTS=sponsorship[,team] limits the run to those groups, so a scoped refresh
// can't overwrite unrelated images. Empty = capture everything.
const ONLY = new Set((process.env.SHOTS ?? '').split(',').filter(Boolean))
const want = (group) => ONLY.size === 0 || ONLY.has(group)

// The failed row in mock-user-service.ts, which is also what its deposit-by-id
// route serves — keep them in sync.
const FAILED_DEPOSIT_ID = '90244'

const results = []
async function shoot(page, file, { dialog = false } = {}) {
  try {
    await page.waitForTimeout(450)
    if (dialog) {
      const d = page.locator('[role="dialog"]').first()
      await d.waitFor({ timeout: 4000 })
      await d.screenshot({ path: `${OUT}/${file}` })
    } else {
      await page.screenshot({ path: `${OUT}/${file}` })
    }
    results.push(`OK   ${file}`)
  } catch (e) {
    results.push(`FAIL ${file} — ${e.message.split('\n')[0]}`)
  }
}

async function appReady(page) {
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
  await page.getByText('API keys').first().waitFor({ timeout: 8000 })
  // `/` redirects to Overview when metrics are enabled; wait for a chart bar so
  // the shot can't catch a metric block still in its loading state.
  await page.locator('svg path.bar').first().waitFor({ timeout: 8000 })
  await page.waitForTimeout(400)
}

const browser = await chromium.launch({ executablePath: EXEC, headless: true })
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, colorScheme: 'dark' })
const page = await ctx.newPage()
page.setDefaultTimeout(8000)
// Belt-and-suspenders: also disable the Vue devtools plugin in vite.config.ts.
await page.addInitScript(() => {
  const s = document.createElement('style')
  s.textContent = '#vue-devtools-anchor,vue-devtools-anchor,#vue-inspector-container{display:none!important}'
  ;(document.head || document.documentElement).appendChild(s)
})

// ---------- LOGIN (unauthenticated) ----------
if (want('access')) {
  try {
    await page.route('**/users/auth/get-session*', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: 'null' }))
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' })
    await shoot(page, 'access/invite-code.png')
    await page.getByPlaceholder('Invite code').fill('RHINESTONE-2026')
    await page.getByRole('button', { name: /continue/i }).click()
    await page.waitForTimeout(700)
    await shoot(page, 'access/sso.png')
    await page.unroute('**/users/auth/get-session*')
  } catch (e) { results.push(`FAIL login flow — ${e.message.split('\n')[0]}`) }

  // ---------- NAV / app shell ----------
  await appReady(page)
  await shoot(page, 'access/nav.png')
}

// ---------- API KEYS ----------
if (want('api-keys')) {
  await page.goto(`${BASE}/keys`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)
  await shoot(page, 'api-keys/list.png')
  try {
    await page.getByText('prod', { exact: true }).first().click()
    await page.waitForTimeout(400)
    await shoot(page, 'api-keys/scopes.png')
    await page.getByRole('button', { name: /^revoke$/i }).first().click()
    await shoot(page, 'api-keys/revoke.png', { dialog: true })
    await page.keyboard.press('Escape')
    await page.waitForTimeout(250)
    await page.keyboard.press('Escape')
    await page.waitForTimeout(250)
  } catch (e) { results.push(`FAIL api-keys scopes/revoke — ${e.message.split('\n')[0]}`) }
  try {
    await page.goto(`${BASE}/keys`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(500)
    await page.getByRole('button', { name: /create key/i }).first().click()
    await shoot(page, 'api-keys/create.png', { dialog: true })
    await page.getByPlaceholder(/prod/i).fill('mobile-app')
    await page.getByRole('button', { name: /^create$/i }).click()
    await shoot(page, 'api-keys/reveal.png', { dialog: true })
    await page.keyboard.press('Escape')
    await page.waitForTimeout(300)
  } catch (e) { results.push(`FAIL api-keys create — ${e.message.split('\n')[0]}`) }
}

// ---------- TEAM ----------
if (want('team')) {
  await page.goto(`${BASE}/settings`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)
  await shoot(page, 'team/list.png')
  try {
    await page.getByRole('button', { name: /invite member/i }).click()
    await shoot(page, 'team/invite.png', { dialog: true })
    await page.keyboard.press('Escape')
  } catch (e) { results.push(`FAIL team invite — ${e.message.split('\n')[0]}`) }
}

// ---------- JWT KEYS ----------
if (want('jwt-keys')) {
  await page.goto(`${BASE}/keys/jwt`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)
  try {
    await page.getByRole('button', { name: /register key/i }).click()
    await page.waitForTimeout(300)
    await shoot(page, 'jwt-keys/generate.png', { dialog: true })
    await page.getByPlaceholder(/application identifier/i).fill('rhinestone')
    await page.getByPlaceholder(/unique name for this key/i).fill('mobile-2026-06')
    await page.getByRole('button', { name: /create key/i }).click()
    await page.waitForTimeout(800)
    await shoot(page, 'jwt-keys/download.png', { dialog: true })
    await page.keyboard.press('Escape')
    await page.waitForTimeout(300)
    await page.getByRole('button', { name: /register key/i }).click()
    await page.waitForTimeout(300)
    await page.getByText(/upload public key/i).click()
    await page.waitForTimeout(300)
    await shoot(page, 'jwt-keys/upload.png', { dialog: true })
    await page.keyboard.press('Escape')
  } catch (e) { results.push(`FAIL jwt add — ${e.message.split('\n')[0]}`) }
  try {
    // Disable lives in the key's side drawer, not the table row. Open it from the
    // Created cell — the id cells swallow the click to copy their value.
    await page.locator('tbody tr').first().locator('td.col-date').click()
    await page.waitForTimeout(400)
    await page.getByRole('button', { name: /^disable$/i }).first().click()
    await shoot(page, 'jwt-keys/disable.png', { dialog: true })
    await page.keyboard.press('Escape')
    await page.waitForTimeout(250)
    await page.keyboard.press('Escape')
  } catch (e) { results.push(`FAIL jwt disable — ${e.message.split('\n')[0]}`) }
}

// ---------- DEPOSITS ----------
if (want('deposits')) {
  await page.goto(`${BASE}/deposits`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(700)
  await shoot(page, 'deposits/list.png')
  try {
    // Retry is a single-deposit action with no confirmation dialog, so the guide's
    // retry step shows the failed deposit's page, where Retry and Refund live.
    await page.goto(`${BASE}/deposits/${FAILED_DEPOSIT_ID}`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(700)
    await shoot(page, 'deposits/retry.png')
    await page.getByRole('button', { name: /^refund$/i }).first().click()
    await shoot(page, 'deposits/refund.png', { dialog: true })
    await page.keyboard.press('Escape')
  } catch (e) { results.push(`FAIL deposits detail/refund — ${e.message.split('\n')[0]}`) }
}

// ---------- SPONSORSHIP ----------
if (want('sponsorship')) {
  await page.goto(`${BASE}/settings/sponsorship`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(700)
  await shoot(page, 'sponsorship/balance.png')
  try {
    await page.getByRole('button', { name: /^deposit$/i }).first().click()
    await shoot(page, 'sponsorship/deposit-amount.png', { dialog: true })
    await page.keyboard.press('Escape')
  } catch (e) { results.push(`FAIL sponsorship deposit — ${e.message.split('\n')[0]}`) }
}

await browser.close()
console.log(results.join('\n'))

// Exit non-zero if any shot failed, so a caller (or CI) doesn't treat a
// partial/failed refresh as success.
const failed = results.filter((r) => r.startsWith('FAIL'))
if (failed.length) {
  console.error(`\n${failed.length} capture(s) failed`)
  process.exitCode = 1
}
