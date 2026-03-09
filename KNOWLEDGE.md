# KNOWLEDGE.md — Rhinestone Docs Feature Index

A living index of documented features. Updated whenever docs change. Used for DevTools checks, gap analysis, and general docs advancement.

Last updated: 2026-03-09

---

## Smart Wallet

### Account Setup
- Create a smart account (counterfactual) → `smart-wallet/core/create-account.mdx`
- Create first transaction → `smart-wallet/core/create-first-transaction.mdx`
- EOA (plain, no modules) → `smart-wallet/core/eoa.mdx`
- EIP-7702 smart EOA → `smart-wallet/core/eip-7702.mdx`
- Batch transactions → `smart-wallet/advanced/batch-transactions.mdx`
- Custom modules → `smart-wallet/advanced/custom-modules.mdx`
- Migration guide → `smart-wallet/advanced/migration-guide.mdx`
- Message signing → `smart-wallet/advanced/message-signing.mdx`
- ERC-4337 opt-in → `smart-wallet/advanced/erc4337.mdx`
- Bring your own account → `smart-wallet/customize/bring-your-own-account.mdx`
- JSON-RPC providers → `smart-wallet/customize/json-rpc-providers.mdx`
- Smart account providers → `smart-wallet/customize/smart-account-providers.mdx`

### Transaction Flow
- `sendTransaction` — primary high-level method, documented throughout core guides
- `prepareTransaction` / `submitTransaction` — lower-level two-step flow → `smart-wallet/advanced/custom-signing.mdx`, `smart-wallet/core/create-first-transaction.mdx`
  - Note: `signTransaction` referenced in migration guide and signer pages; `prepareTransaction` + `submitTransaction` are the main split-flow pair
- `deploy` action — account deployment → `smart-wallet/chain-abstraction/account-deployment.mdx`
- `installModule` / `uninstallModule` — documented implicitly via module setup guides

### Signers
- ECDSA signer → `smart-wallet/core/ecdsa-signer.mdx`
- Passkeys (WebAuthn) → `smart-wallet/core/passkeys.mdx`
- Multisig → `smart-wallet/core/multisig.mdx`
- Multi-factor authentication → `smart-wallet/advanced/multi-factor-authentication.mdx`
- Custom signing → `smart-wallet/advanced/custom-signing.mdx`
- Setup signer (overview) → `smart-wallet/core/setup-signer.mdx`
- **Embedded wallet signers:** Privy, Dynamic, Para, Magic, Turnkey, Openfort → `smart-wallet/core/signers/`
- **External wallet signers:** MetaMask/WalletConnect → `smart-wallet/core/signers/external-wallet-signer.mdx`

### Gas Sponsorship
- Sponsor fees setup → `smart-wallet/gas-sponsorship/set-up-sponsorship.mdx`
- Pay gas with ERC-20 → `smart-wallet/gas-sponsorship/pay-gas-with-erc20.mdx`
- Gas sponsorship overview → `smart-wallet/gas-sponsorship/overview.mdx`
- Gas fee sponsorship (core) → `smart-wallet/core/gas-fee-sponsorship.mdx`

### Smart Sessions
- Overview + `experimental_isSessionEnabled` (content exists) → `smart-wallet/smart-sessions/overview.mdx`
- Multi-session signature → `smart-wallet/smart-sessions/multi-session-signature.mdx`
- **Policies:** Call, Gas Limit, Spending Limit, Sudo, Timeframe, Usage Limit → `smart-wallet/smart-sessions/policies/`
- **Signature validators:** ECDSA, Multisig, Passkey → `smart-wallet/smart-sessions/signature-validators/`
- **Tutorials:** Session keys, Sponsor fees → `smart-wallet/tutorials/`

### Security / Advanced
- Recovery → `smart-wallet/advanced/recovery.mdx`
- Security → `smart-wallet/advanced/security.mdx`, `smart-wallet/security.mdx`

---

## Chain Abstraction (Smart Wallet SDK)

### Intents via SDK
- Single-chain intent → `smart-wallet/chain-abstraction/single-chain-intent.mdx`
  - `auxiliaryFunds` option — declare additional token balances for routing
  - Intent status polling (`getIntentStatus`)
- Multi-chain intent → `smart-wallet/chain-abstraction/multi-chain-intent.mdx`
  - `splitIntents` — split large amounts across settlement layers for parallel routing
  - `auxiliaryFunds` option
  - Liquidity splitting section
- Account deployment → `smart-wallet/chain-abstraction/account-deployment.mdx`
  - Deploy from another account
- Unified balance → `smart-wallet/chain-abstraction/unified-balance.mdx`
- Custom recipient → `smart-wallet/chain-abstraction/custom-recipient.mdx`
- Source token amount → `smart-wallet/chain-abstraction/source-token-amount.mdx`
- Swaps → `smart-wallet/chain-abstraction/swaps.mdx`
- Error handling → `smart-wallet/chain-abstraction/error-handling.mdx`
- Local orchestrator (Docker) → `smart-wallet/chain-abstraction/local-orchestrator-docker.mdx`

### Intent Status Values (SDK)
`PENDING` | `FILLED` | `PRECONFIRMED` | `CLAIMED` | `COMPLETED` | `FAILED` | `EXPIRED`
- `PENDING` — in progress
- `PRECONFIRMED` — confirmed by solver, not yet onchain
- `FILLED` — executed on destination, funds not yet claimed on source
- `CLAIMED` — source funds claimed by solver, not yet executed on destination
- `COMPLETED` — fully done
- `FAILED` — execution failed
- `EXPIRED` — missed execution deadline

---

## Intents API (REST)

### Guides
- API Quickstart → `intents/quickstart.mdx`
- Getting a quote → `intents/guides/getting-a-quote.mdx`
- Set account type (smart account / EOA / EIP-7702) → `intents/guides/set-account-type.mdx`
- Token requirements / approvals → `intents/guides/token-requirements.mdx`
- Setting up approvals → `intents/guides/setting-up-approvals.mdx`
- Signing the intent → `intents/guides/signing.mdx`
- Submitting the intent → `intents/guides/submitting-the-intent.mdx`
  - Intent status polling
  - Status values: `PENDING`, `PRECONFIRMED`, `FILLED`, `CLAIMED`, `COMPLETED`, `FAILED`, `EXPIRED`
- Tracking intents → `intents/guides/tracking-intents.mdx` (**Coming soon** — stub only)
- Error handling → `intents/guides/error-handling.mdx`
- Using the API → `intents/guides/using-the-api.mdx`
- Portfolio endpoint → `intents/guides/portfolio-endpoint.mdx` *(new)*
- Installing the intent executor → `intents/guides/installing-intent-executor.mdx` *(new)*

### Use Cases
- Chain-abstracted swaps → `intents/use-cases/chain-abstracted-swaps.mdx`
- Multi-input bridge → `intents/use-cases/multi-input-bridge.mdx`
- Crosschain vault deposit → `intents/use-cases/vault-deposit.mdx`
- Automated zaps → `intents/use-cases/automated-zaps.mdx`

### Features
- Execute crosschain calls → `intents/features/execute-crosschain-calls.mdx` *(new)*

### Tutorial
- End-to-end intent flow → `intents/tutorial/end-to-end-intent-flow.mdx` (**Coming soon** — stub only)

---

## Known Gaps / Stubs

| Page | Status | Notes |
|---|---|---|
| `intents/guides/tracking-intents.mdx` | Coming soon | Should contain full intent status lifecycle. Status values currently documented in `submitting-the-intent.mdx`. Nav position: after "Submitting the intent" |
| `intents/tutorial/end-to-end-intent-flow.mdx` | Coming soon | Full E2E walkthrough |
| `intents/guides/using-the-api.mdx` | Stub | API guide overview |
| `home/get-started/create-dev-account.mdx` | Stub | RHI-3311 |
| `home/get-started/configure-dev-dashboard.mdx` | Stub | RHI-3311 |
| Various `home/solutions/` and `home/use-cases/` pages | Stub | Marketing/solutions content |

---

## Update Protocol

Whenever a doc is added or significantly changed:
1. Update the relevant section above
2. Move items out of "Known Gaps" if filled
3. Add new gaps if discovered
4. Bump the "Last updated" date at the top
