# Docs Nav Restructure Task

## Goal
Restructure the navigation in `docs.json` for the Rhinestone docs site (Mintlify).

## Current Structure
The docs currently have sections including: Home, smart-wallet (as one big SDK).

## New Structure
The nav should be reorganized into 4 top-level tabs: **Home**, **Auth**, **Wallet**, **Intents**

Here is the full new nav from the spreadsheet:

### Home tab
- Introduction
  - Welcome to Rhinestone (keep existing: /home/introduction/welcome-to-rhinestone)
  - What is Rhinestone (keep existing: /home/introduction/what-is-rhinestone)
- Get started
  - Create dev account (new blank page)
  - Configure dev dashboard (new blank page)
- Solutions
  - Wallets & Fintechs (new blank page)
  - Multichain Apps (new blank page)
  - AI Agents (new blank page)
- Use cases
  - Onboarding & Deposits (new blank page)
  - Crosschain intents (new blank page)
  - Swaps (new blank page)
  - Automation (new blank page)
- Concepts
  - Intents and ERC4337 (keep existing: /home/concepts/intents-and-erc4337)
  - Smart Accounts (keep existing: /home/concepts/smart-accounts)
  - Session keys (keep existing: /home/concepts/session-keys)
- Resources — keep entire current resources section as-is

### Auth tab
- Introduction
  - 1auth Overview (new blank page)
  - Why Passkeys (new blank page)
  - Why self-custody (new blank page)
  - Quick start (new blank page)
- Architecture
  - Components (new blank page)
  - Keystore (new blank page)
  - Recovery (new blank page)
- Features
  - Onboarding and login (new blank page)
  - Authentication (new blank page)
  - Fee sponsorship (new blank page)
  - Permissions (new blank page)
  - Checkout (new blank page)
  - Crosschain (new blank page)
  - Theming (new blank page)
- API Reference (new blank page)
- RPC Reference (new blank page)

### Wallet tab
- Overview (new blank page)
- Smart Accounts (new blank page)
- Quick start (keep existing: /smart-wallet/quickstart)
- Tutorials
  - Setting up a Smart Account (new blank page)
- Wallet Setup
  - Use EOA only (keep existing: /smart-wallet/core/eoa)
  - Create a smart account (keep existing: /smart-wallet/core/create-account)
  - Setup the signer (new blank overview page, with nested pages):
    - Passkey (/smart-wallet/core/passkeys)
    - ECDSA signer (/smart-wallet/core/ecdsa-signer)
    - Multisig (/smart-wallet/core/multisig)
    - External wallets (/smart-wallet/core/signers/external-wallet-signer)
    - Privy (/smart-wallet/core/signers/privy)
    - Dynamic (/smart-wallet/core/signers/dynamic)
    - Para (/smart-wallet/core/signers/para)
    - Magic (/smart-wallet/core/signers/magic)
    - Turnkey (/smart-wallet/core/signers/turnkey)
    - Openfort (/smart-wallet/core/signers/openfort)
  - Create first transaction (/smart-wallet/core/create-first-transaction)
- Gas sponsorship
  - Overview (/smart-wallet/gas-sponsorship/overview)
  - Set up sponsorship (/smart-wallet/gas-sponsorship/set-up-sponsorship)
  - Pay gas with ERC20 (/smart-wallet/gas-sponsorship/pay-gas-with-erc20)
- Smart Sessions
  - Overview (/smart-wallet/smart-sessions/overview)
  - Multi-chain session (/smart-wallet/smart-sessions/multi-session-signature)
  - Signature validators (nested):
    - ECDSA (/smart-wallet/smart-sessions/signature-validators/ecdsa)
    - Passkey (/smart-wallet/smart-sessions/signature-validators/passkey)
    - Multi-sig (/smart-wallet/smart-sessions/signature-validators/multisig)
  - Policies (nested):
    - Sudo (/smart-wallet/smart-sessions/policies/sudo)
    - Call (/smart-wallet/smart-sessions/policies/call)
    - Spending Limit (/smart-wallet/smart-sessions/policies/spending-limit)
    - Rate limit (new blank page)
    - Gas limit (new blank page)
    - Timeframe (/smart-wallet/smart-sessions/policies/timeframe)
    - Usage limit (/smart-wallet/smart-sessions/policies/usage-limit)
- Advanced — reuse all existing Advanced section from smart-wallet SDK
- Customize — reuse all existing Customize section from smart-wallet SDK
- Module Development — reuse all existing Module Development section from smart-wallet SDK

### Intents tab
- Overview (keep existing: /home/introduction/rhinestone-intents)
- Tutorial
  - End-to-end Intent Flow (new blank page)
- Features
  - Gas relaying (/smart-wallet/chain-abstraction/single-chain-intent) [page name change]
  - Unified balance (/smart-wallet/chain-abstraction/unified-balance)
  - Crosschain (/smart-wallet/chain-abstraction/multi-chain-intent) [page name change]
  - Swaps — combine /smart-wallet/chain-abstraction/swaps and /intents/use-cases/chain-abstracted-swaps into one page
  - Execute crosschain calls (new blank page)
  - Spend max tokens (/smart-wallet/chain-abstraction/source-token-amount) [page name change]
  - Custom recipient (/smart-wallet/chain-abstraction/custom-recipient)
  - Account deployment (/smart-wallet/chain-abstraction/account-deployment)
- Advanced
  - Automated Zaps (/intents/use-cases/automated-zaps)
  - Multi-input bridge (/intents/use-cases/multi-input-bridge)
  - Crosschain vault deposit (/intents/use-cases/vault-deposit) [page name change]
  - Local Testing (Docker) (/smart-wallet/chain-abstraction/local-orchestrator-docker)
- API Guides
  - Using the API (new blank page)
  - Set account type (new blank page)
  - Getting a Quote (/intents/guides/getting-a-quote)
  - Fulfilling Requirements (/intents/guides/token-requirements)
  - Signing the Intent (/intents/guides/signing)
  - Submitting the Intent (/intents/guides/submitting-the-intent)
  - Installing the Intent Executor (new blank page)
  - Setting Up Approvals (new blank page)
  - Portfolio Endpoint (new blank page)
  - Tracking Intents (new blank page)
  - Error handling (/intents/guides/error-handling)

## What to do

1. Read the current `docs.json` to understand the structure
2. Create a new branch: `greg/docs-nav-restructure`
3. Update `docs.json` navigation to match the new structure above
   - For pages that reference existing URLs: point to the existing MDX file path
   - For "new blank page" entries: create a minimal stub MDX file at an appropriate path with just a title and "Coming soon" content
   - Keep the anchor `pages` array format consistent with Mintlify v2 (docs.json)
4. Commit with message: "feat: restructure docs nav into Home/Auth/Wallet/Intents tabs"
5. Push the branch
6. Run: openclaw system event --text "Done: docs nav restructure pushed to greg/docs-nav-restructure" --mode now

## Notes
- Do NOT touch style.css or colors — theming is handled separately on greg/docs-theme-dark
- Mintlify v2 uses `tabs` array in docs.json for top-level navigation
- Each tab has `tab`, `groups` array; each group has `group` and `pages`
- For nested groups, use page objects with `group` and `pages` keys
