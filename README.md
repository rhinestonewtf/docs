# docs

Source for **[docs.rhinestone.dev](https://docs.rhinestone.dev)** — Rhinestone's developer
documentation. Built with [Mintlify](https://mintlify.com).

## Layout

| Path | What |
|---|---|
| `home/` | Introduction and orientation |
| `intents/` | Intents and orchestration |
| `smart-wallet/` | Smart wallet and smart account guides |
| `deposits/` | Deposit service and the deposit widget |
| `dashboard/` | Dashboard guides |
| `sdk-reference/` | SDK reference |
| `api-reference/` | API reference |
| `snippets/` | Reusable MDX fragments |
| `docs.json` | Navigation, theme and redirects |
| `styles/`, `style.css` | Custom styling |
| `.vale.ini` | Prose linting configuration |
| `images/`, `logo/`, `public/` | Assets |

## Running locally

```sh
bunx mintlify dev                  # local preview on :3000
bunx mintlify dev --port 3333      # custom port
bunx mintlify broken-links         # check for broken links
```

Mintlify requires Node 22 LTS — if you have several Node versions installed, make sure 22
is active before running the preview.

## Publishing

Changes deploy automatically on push to the default branch, via the Mintlify GitHub App.

## Where to go next

[AGENTS.md](./AGENTS.md) — writing conventions, component usage, and Mintlify gotchas
(including a stale-compile trap where `mintlify dev` reports a parsing error for MDX that
is actually valid).
