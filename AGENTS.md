# Rhinestone Docs

Mintlify-based documentation site for the Rhinestone smart wallet platform, module development kit, and intents API.

Docs: https://docs.rhinestone.dev

## Commands

- `bunx mintlify dev` - Run local preview (port 3000)
- `bunx mintlify dev --port 3333` - Custom port
- `bunx mintlify broken-links` - Check for broken links

## Stack

- Framework: Mintlify
- Content: MDX (Markdown + JSX)
- Configuration: `docs.json`
- Icons: Lucide

## Structure

- `/home` - Landing pages: intro, concepts, resources
- `/smart-wallet` - Smart Wallet SDK docs (accounts, signers, chain abstraction, sessions)
- `/intents` - Intents API docs (quotes, signing, submitting)
- `/build-modules` - Module Development Kit (tutorials, guides, API reference)
- `/snippets` - Reusable MDX components (cards, icons)
- `/images` - Documentation images and screenshots
- `docs.json` - Mintlify site config (navigation, theme, tabs)

## Patterns

- All content files use `.mdx` extension with YAML frontmatter (`title`, `description`)
- Use Mintlify components: `<Note>`, `<Tip>`, `<Info>`, `<Steps>`, `<Step>`, `<CodeGroup>`, `<Card>`, `<CardGroup>`, `<AccordionGroup>`, `<Accordion>`, `<Frame>`
- Navigation structure is defined in `docs.json` under `navigation.tabs`
- Reusable snippets live in `/snippets` and are imported as MDX components
- Code examples use `<CodeGroup>` with tabs for npm/pnpm/bun
