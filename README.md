# docs

Source for **[docs.rhinestone.dev](https://docs.rhinestone.dev)** — Rhinestone's developer
documentation. Pages are MDX, grouped into a directory per product area; prose is linted
with [Vale](https://vale.sh).

`docs.json` defines navigation, theming and redirects. **A new page needs an entry there
or it will not appear on the site** — adding the file alone is not enough.

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
