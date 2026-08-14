// Mock user-service for dashboard screenshots. Pure Bun.serve, no deps.
// Returns stubbed JSON for every endpoint the dashboard hits, with CORS that
// satisfies credentials:'include' from the Vite dev origin.
//
// It also answers the dashboard-api surface (`/api/*`: the chain catalog and the
// metrics overview), which the console calls same-origin — its Vite dev server
// proxies `/api` to this port, so one server covers both origins.
//
// Run: bun run mock-user-service.ts   (listens on :3000)
// Edit the data constants below to change what renders in the screenshots.

const ORIGIN = process.env.DASHBOARD_ORIGIN || 'http://localhost:5173'
const ORG_ID = 'cmpv8v6wa0000ht5ilfoh2tp4' // set equal to VITE_RHINESTONE_ORG_ID for the brand mark
const PROJECT_ID = 'proj_rhinestone_prod'

const ago = (ms: number) => new Date(Date.now() - ms).toISOString()
const MIN = 60_000
const HOUR = 60 * MIN
const DAY = 24 * HOUR

// The signed-in user. Their email MUST match an ACTIVE OWNER/ADMIN member in
// ORG below, or role-gated controls (Create key, scopes, Refund) won't render.
const USER = {
  id: 'user_kurt',
  name: 'Kurt Larsen',
  email: 'kurt@rhinestone.dev',
  emailVerified: true,
  image: null,
  createdAt: ago(120 * DAY),
  updatedAt: ago(1 * DAY),
}

const SESSION = {
  session: {
    id: 'sess_1',
    token: 'mock-session-token',
    userId: USER.id,
    expiresAt: new Date(Date.now() + 7 * DAY).toISOString(),
    createdAt: ago(1 * HOUR),
    updatedAt: ago(1 * HOUR),
    ipAddress: '127.0.0.1',
    userAgent: 'mock',
  },
  user: USER,
}

const SCOPES_FULL = { allowMainnet: true, intents: 'write', deposits: 'write' }
const SCOPES_LIMITED = { allowMainnet: false, intents: 'read', deposits: 'none' }

const API_KEYS = [
  { id: 'key_prod', name: 'prod', lastChars: 'a4f9', createdAt: ago(12 * DAY), lastUsedAt: ago(2 * HOUR), revokedAt: null, scopes: SCOPES_FULL },
  { id: 'key_ci', name: 'ci-staging', lastChars: '7b2e', createdAt: ago(5 * DAY), lastUsedAt: ago(3 * DAY), revokedAt: null, scopes: SCOPES_LIMITED },
]

const PROJECT = { id: PROJECT_ID, name: 'Production', org: { name: 'Rhinestone' }, apiKeys: API_KEYS }

const ORG = {
  name: 'Rhinestone',
  members: [
    { id: 'm_kurt', role: 'OWNER', status: 'ACTIVE', email: 'kurt@rhinestone.dev', user: { name: 'Kurt Larsen', image: '', email: 'kurt@rhinestone.dev' } },
    { id: 'm_konrad', role: 'ADMIN', status: 'ACTIVE', email: 'konrad@rhinestone.dev', user: { name: 'Konrad Kopp', image: '', email: 'konrad@rhinestone.dev' } },
    { id: 'm_dana', role: 'OPERATOR', status: 'ACTIVE', email: 'dana@rhinestone.dev', user: { name: 'Dana Reid', image: '', email: 'dana@rhinestone.dev' } },
    { id: 'm_alex', role: 'MEMBER', status: 'PENDING', email: 'alex@rhinestone.dev', user: null },
  ],
}

const JWT_KEYS = [
  { id: 'jwt_prod', kid: 'prod-2026-06', integratorId: 'rhinestone', algorithm: 'ES256', enabled: true, createdAt: ago(5 * DAY) },
]

// Balances are micro-USD strings (1_000_000 = $1), as user-service serves them.
// `provisioned` + a non-null `address` gate the funding actions; PROJECT_ID must
// appear in `projects` or the limits panel renders its empty state.
const ORG_SPONSORSHIP = {
  orgId: ORG_ID,
  provisioned: true,
  address: '0x8a911a7e3a0bff0f9f0e9b2d3b9f1c2d4e5f6a7b',
  balance: { total: '12480500000', credits: '2500000000', spent: '7519500000', creditLimit: '5000000000' },
  projects: [{ projectId: PROJECT_ID }],
}

// Per-intent caps in plain USD (null renders as "Unlimited"). Required: with
// sponsorship configured the page fetches this, and the catch-all's undefined
// caps throw while rendering.
const POLICY_CONFIG = { gasLimitPerIntentUsd: 0.5, bridgeFeeLimitPerIntentUsd: null, limitPerIntentUsd: 5, version: 3 }

// Chain catalog, as the dashboard api serves it (deposit-service `/chains`,
// normalized). The console takes chain names, the native symbol and the explorer
// paths from here; with it missing, chain columns fall back to raw CAIP-2 ids and
// explorer links render as plain text.
const evmChain = (name: string, explorer: string, native = 'ETH') => ({
  name, testnet: false, deposit: true, destination: true, vmType: 'evm' as const,
  nativeToken: { symbol: native, address: '0x0000000000000000000000000000000000000000', decimals: 18 },
  explorer: { url: explorer, addressPath: '/address/', txPath: '/tx/' },
  supportedTokens: 'all' as const,
})

const CHAINS = {
  'eip155:1': evmChain('Ethereum', 'https://etherscan.io'),
  'eip155:10': evmChain('OP Mainnet', 'https://optimistic.etherscan.io'),
  'eip155:56': evmChain('BNB Smart Chain', 'https://bscscan.com', 'BNB'),
  'eip155:8453': evmChain('Base', 'https://basescan.org'),
  'eip155:42161': evmChain('Arbitrum One', 'https://arbiscan.io'),
}

// Metrics overview (dashboard api), which the Overview page needs to render
// anything but its "Data not available" fallback. The console asks for 30 daily
// buckets by default; the walk is seeded rather than random so a re-capture
// reproduces the same bars instead of churning the PNGs.
const OVERVIEW_DAYS = 30

function walk(seed: number, mean: number, spread: number): number[] {
  let state = seed >>> 0
  const next = (): number => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 0x1_0000_0000
  }
  let level = mean
  const values: number[] = []
  for (let i = 0; i < OVERVIEW_DAYS; i++) {
    level += (mean - level) * 0.3 + (next() - 0.5) * spread
    values.push(Math.max(0, Math.round(level)))
  }
  return values
}

function bucketStart(daysAgo: number): string {
  const date = new Date(Date.now() - daysAgo * DAY)
  date.setUTCHours(0, 0, 0, 0)
  return date.toISOString()
}

// `total` defaults to the sum of the buckets. Distinct-count metrics (users) pass
// their own window-wide count, which has to be BELOW that sum — a total above it
// reads as a data bug to anyone who looks at the chart closely.
const series = (values: number[], delta: number | null, total?: number) => ({
  points: values.map((value, i) => ({ date: bucketStart(OVERVIEW_DAYS - 1 - i), value })),
  total: total ?? values.reduce((sum, value) => sum + value, 0),
  delta,
})

const distinct = (values: number[], share: number) =>
  Math.round(values.reduce((sum, value) => sum + value, 0) * share)

const INTENT_USERS = walk(31, 96, 70)
const DEPOSIT_USERS = walk(61, 61, 44)

const OVERVIEW = {
  range: { start: bucketStart(OVERVIEW_DAYS - 1), end: bucketStart(0) },
  metrics: {
    intents: {
      volume: series(walk(11, 40_500, 26_000), 0.14),
      count: series(walk(21, 313, 190), 0.09),
      users: series(INTENT_USERS, 0.21, distinct(INTENT_USERS, 0.48)),
    },
    deposits: {
      volume: series(walk(41, 14_100, 9_000), -0.07),
      count: series(walk(51, 104, 62), 0.05),
      users: series(DEPOSIT_USERS, 0.12, distinct(DEPOSIT_USERS, 0.49)),
    },
    chains: {
      sources: [
        { label: 'Base', value: 486_200 },
        { label: 'Arbitrum One', value: 312_400 },
        { label: 'OP Mainnet', value: 168_900 },
        { label: 'Ethereum', value: 121_500 },
        { label: 'Other', value: 74_300, isOther: true },
      ],
      destinations: [
        { label: 'Base', value: 552_800 },
        { label: 'Arbitrum One', value: 274_100 },
        { label: 'Ethereum', value: 194_600 },
        { label: 'OP Mainnet', value: 96_400 },
        { label: 'Other', value: 45_400, isOther: true },
      ],
    },
    revenue: series(walk(71, 121, 84), 0.26),
  },
}

const USDC_BASE = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
const USDC_ARB = '0xaf88d065e77c8cC2239327C5EDb3A432268e5831'
const USDT_BSC = '0x55d398326f99059fF775485246999027B3197955'

// Deposit rows as deposit-service serves them: addressed by a numeric `id`, with
// the deposit address and the recipient as separate fields, and the token symbol
// and decimals resolved per row. A null symbol renders as a short address and null
// decimals render raw base units — correct product behavior, but both read as
// breakage in a guide, so every fixture carries them.
const deposit = (o: Record<string, unknown>) => ({
  id: '90210', chain: 'eip155:42161', txHash: '0x' + '00'.repeat(32), token: USDC_ARB, amount: '100000000',
  tokenSymbol: 'USDC', tokenDecimals: 6, targetTokenSymbol: 'USDC', targetTokenDecimals: 6,
  sender: '0x1111111111111111111111111111111111111111',
  depositAddress: '0x2222222222222222222222222222222222222222',
  recipient: '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0',
  targetChain: 'eip155:8453', targetToken: USDC_BASE, status: 'completed', errorCode: null, retryable: false,
  sourceTxHash: '0x' + '11'.repeat(32), destinationTxHash: '0x' + '22'.repeat(32),
  sourceAmount: '100000000', destinationAmount: '99800000',
  sponsoredGasUsd: '0.18', sponsoredBridgeFeeUsd: '0.09',
  createdAt: ago(2 * HOUR), completedAt: ago(2 * HOUR + 30_000), ...o,
})

// failed on an EVM chain -> carries both Retry and Refund (Refund needs
// OWNER/ADMIN/OPERATOR). Also what the deposit detail route serves. A deposit
// that never settled has no sponsorship accounting, so those fields stay off and
// the sponsored-value panel hides itself.
const FAILED_DEPOSIT = deposit({
  id: '90244', txHash: '0xc3' + '00'.repeat(31), chain: 'eip155:56', token: USDT_BSC,
  tokenSymbol: 'USDT', tokenDecimals: 18, status: 'failed', retryable: true, errorCode: 'BRIDGE-1',
  amount: '120000000000000000000', sourceAmount: '120000000000000000000', destinationAmount: null,
  sourceTxHash: '0x' + '33'.repeat(32), destinationTxHash: null, completedAt: null, createdAt: ago(50 * MIN),
  depositAddress: '0x5555555555555555555555555555555555555555',
  recipient: '0x9f2c4b8de3a1057e6b0c8d4f2a9e7b135c60d8a4',
  sponsoredGasUsd: undefined, sponsoredBridgeFeeUsd: undefined,
})

const DEPOSITS = [
  deposit({ id: '90251', txHash: '0xa1' + '00'.repeat(31), amount: '250000000', sourceAmount: '250000000', destinationAmount: '249500000', createdAt: ago(35 * MIN), completedAt: ago(34 * MIN), depositAddress: '0x3333333333333333333333333333333333333333', recipient: '0x4c1b6f0d92a7e8534bb0cd1e7f6a2093d85be417' }),
  deposit({ id: '90248', txHash: '0xb2' + '00'.repeat(31), chain: 'eip155:8453', token: USDC_BASE, targetChain: 'eip155:42161', targetToken: USDC_ARB, status: 'processing', amount: '50000000', sourceAmount: '50000000', destinationAmount: null, destinationTxHash: null, completedAt: null, createdAt: ago(6 * MIN), depositAddress: '0x4444444444444444444444444444444444444444', recipient: '0xe3708a6b41d95c27f0a4d2b9e56718cf3d0a9b52' }),
  FAILED_DEPOSIT,
  deposit({ id: '90232', txHash: '0xd4' + '00'.repeat(31), createdAt: ago(3 * HOUR), completedAt: ago(3 * HOUR - 40_000), depositAddress: '0x6666666666666666666666666666666666666666', recipient: '0xb85d2f0a6c194e73df85a0b4c72e9163fa2d5e08' }),
]

const DEPOSIT_STATS = { totalDeposits: 1284, uniqueUsers: 342, volumeUsd: '48213.55' }

// Deposit detail is fetched by id. Matched on a digits-only pattern so it can't
// shadow the sibling `/deposits/stats` and `/deposits/config` paths.
const DEPOSIT_BY_ID = /^\/users\/me\/deposits\/\d+$/

let intentSeq = 0
const intent = (o: Record<string, unknown>) => ({
  id: 'int_' + (intentSeq++).toString(36).padStart(6, '0'),
  status: 'COMPLETED', fromChains: [42161], toChain: 8453, token: USDC_BASE, amount: '100000000',
  account: '0x2222222222222222222222222222222222222222', createdAt: Math.floor((Date.now() - 2 * HOUR) / 1000), ...o,
})

const INTENTS = {
  data: [
    intent({ createdAt: Math.floor((Date.now() - 12 * MIN) / 1000), amount: '250000000' }),
    intent({ status: 'PENDING', token: USDC_ARB, toChain: 42161, fromChains: [8453], amount: '100000000', createdAt: Math.floor((Date.now() - 40 * MIN) / 1000) }),
    intent({ amount: '75000000', createdAt: Math.floor((Date.now() - 3 * HOUR) / 1000) }),
    intent({ status: 'FAILED', amount: '500000000', createdAt: Math.floor((Date.now() - 8 * HOUR) / 1000) }),
  ],
  pagination: { nextCursor: null, hasNextPage: false },
}

const createdApiKey = {
  id: 'key_new', name: 'mobile-app', lastChars: 'e2c8', createdAt: new Date().toISOString(),
  lastUsedAt: null, revokedAt: null, scopes: SCOPES_FULL,
  plaintext: 'rh_sk_live_9Hb3kQ7tWmZ2pX4vN8sLcRf6yJ0aD1gUe2c8',
}

const CORS = {
  'Access-Control-Allow-Origin': ORIGIN,
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  })
}

Bun.serve({
  port: 3000,
  fetch(req) {
    const p = new URL(req.url).pathname
    const m = req.method
    // 204 is a null-body status — return an empty body so the preflight is
    // spec-compliant on strict Fetch runtimes (Bun tolerates a body; others reject).
    if (m === 'OPTIONS') return new Response(null, { status: 204, headers: CORS })
    if (p === '/users/auth/get-session') return json(SESSION)
    if (p === '/users/me' && m === 'GET') return json({ org: { orgId: ORG_ID, org: { name: 'Rhinestone' } } })
    if (p === '/users/me/projects' && m === 'GET') return json([PROJECT])
    if (p === '/users/me/org' && m === 'GET') return json(ORG)
    if (p === '/users/me/invite') return json({ message: 'no invite' }, 404)
    if (p === '/users/me/org/sponsorship' && m === 'GET') return json(ORG_SPONSORSHIP)
    if (p.endsWith('/policy-config') && m === 'GET') return json(POLICY_CONFIG)
    if (p === '/users/me/deposits' && m === 'GET') return json({ deposits: DEPOSITS, nextCursor: null })
    if (p === '/users/me/deposits/stats') return json(DEPOSIT_STATS)
    if (DEPOSIT_BY_ID.test(p) && m === 'GET') return json(FAILED_DEPOSIT)
    if (p === '/api/chains' && m === 'GET') return json(CHAINS)
    if (p.endsWith('/overview') && m === 'GET') return json(OVERVIEW)
    if (p.endsWith('/integrator-keys') && m === 'GET') return json(JWT_KEYS)
    if (p === '/users/me/intents' && m === 'GET') return json(INTENTS)
    if (p.endsWith('/api-keys') && m === 'POST') return json(createdApiKey)
    if (p.endsWith('/integrator-keys') && m === 'POST') return json({ ...JWT_KEYS[0], id: 'jwt_new', kid: 'mobile-2026-06' })
    if (p.includes('/api-keys/') && m === 'PATCH') return json({ ...API_KEYS[0] })
    if (p.includes('/revoke')) return json({ ...API_KEYS[0], revokedAt: new Date().toISOString() })
    return json({ ok: true })
  },
})

console.log('mock user-service on http://localhost:3000')
