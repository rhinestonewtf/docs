// Mock user-service for dashboard screenshots. Pure Bun.serve, no deps.
// Returns stubbed JSON for every endpoint the dashboard hits, with CORS that
// satisfies credentials:'include' from the Vite dev origin.
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
    { id: 'm_alex', role: 'MEMBER', status: 'PENDING', email: 'alex@rhinestone.dev', user: null },
  ],
}

const JWT_KEYS = [
  { id: 'jwt_prod', kid: 'prod-2026-06', integratorId: 'rhinestone', algorithm: 'ES256', enabled: true, createdAt: ago(5 * DAY) },
]

const SPONSORSHIPS = [
  { projectId: PROJECT_ID, address: '0x8a911a7e3a0bff0f9f0e9b2d3b9f1c2d4e5f6a7b', pendingDisbursements: 0, credits: '0' },
]

const USDC_BASE = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
const USDC_ARB = '0xaf88d065e77c8cC2239327C5EDb3A432268e5831'

const deposit = (o: Record<string, unknown>) => ({
  chain: 'eip155:42161', txHash: '0x' + '00'.repeat(32), token: USDC_ARB, amount: '100000000',
  sender: '0x1111111111111111111111111111111111111111', account: '0x2222222222222222222222222222222222222222',
  targetChain: 'eip155:8453', targetToken: USDC_BASE, status: 'completed', errorCode: null, retryable: false,
  sourceTxHash: '0x' + '11'.repeat(32), destinationTxHash: '0x' + '22'.repeat(32),
  sourceAmount: '100000000', destinationAmount: '99800000', createdAt: ago(2 * HOUR), completedAt: ago(2 * HOUR + 30_000), ...o,
})

const DEPOSITS = [
  deposit({ txHash: '0xa1' + '00'.repeat(31), amount: '250000000', sourceAmount: '250000000', destinationAmount: '249500000', createdAt: ago(35 * MIN), completedAt: ago(34 * MIN), account: '0x3333333333333333333333333333333333333333' }),
  deposit({ txHash: '0xb2' + '00'.repeat(31), chain: 'eip155:8453', token: USDC_BASE, status: 'processing', amount: '50000000', sourceAmount: '50000000', destinationAmount: null, destinationTxHash: null, completedAt: null, createdAt: ago(6 * MIN), account: '0x4444444444444444444444444444444444444444' }),
  // failed + retryable on an EVM chain -> shows both Retry and Refund (OWNER/ADMIN)
  deposit({ txHash: '0xc3' + '00'.repeat(31), chain: 'eip155:56', token: '0x55d398326f99059fF775485246999027B3197955', status: 'failed', retryable: true, errorCode: 'BRIDGE-1', amount: '120000000000000000000', sourceAmount: '120000000000000000000', destinationAmount: null, sourceTxHash: '0x' + '33'.repeat(32), destinationTxHash: null, completedAt: null, createdAt: ago(50 * MIN), account: '0x5555555555555555555555555555555555555555' }),
  deposit({ txHash: '0xd4' + '00'.repeat(31), createdAt: ago(3 * HOUR), completedAt: ago(3 * HOUR - 40_000), account: '0x6666666666666666666666666666666666666666' }),
]

const DEPOSIT_STATS = { totalDeposits: 1284, uniqueUsers: 342, volumeUsd: '48213.55' }

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
    if (p === '/users/me/sponsorships') return json(SPONSORSHIPS)
    if (p === '/users/me/deposits' && m === 'GET') return json({ deposits: DEPOSITS, nextCursor: null })
    if (p === '/users/me/deposits/stats') return json(DEPOSIT_STATS)
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
