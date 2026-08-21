# NOURA Beauty Store

NOURA is a responsive Egyptian beauty-commerce application with an original editorial storefront, Shopify-backed catalogue and cart, AI-assisted product discovery, local email/password authentication, and protected user administration.

## Live application

The fully functional storefront runs at [cosmobeauty-nx34uya9.manus.space](https://cosmobeauty-nx34uya9.manus.space). It requires the application server for authentication, server-validated roles and sessions, Shopify Storefront credentials, cart operations, and AI search.

## GitHub Pages

The `docs/` directory contains the GitHub Pages landing page. It is intentionally a static project overview that links visitors to the managed application. It does **not** host the functional checkout, database, authentication, or Shopify server integration.

## Local development

Install dependencies and start the development environment:

```bash
pnpm install
pnpm dev
```

Run the quality gate before publishing changes:

```bash
pnpm check
pnpm exec vitest run --pool=threads --poolOptions.threads.singleThread=true
pnpm build
```

## Architecture

| Layer | Technology | Responsibility |
|---|---|---|
| Storefront | React 19, Tailwind CSS 4, Wouter | Responsive catalogue, product, cart, account, and admin interfaces |
| Application API | Express 4, tRPC 11 | Typed commerce, search, authentication, and administration procedures |
| Data | Drizzle ORM, MySQL/TiDB | Users, roles, authentication state, and operational records |
| Commerce | Shopify Storefront API | Catalogue, variants, cart lifecycle, checkout handoff |
| Quality | Vitest, Testing Library | User-flow, role, cart, navigation, category, and live Storefront acceptance coverage |

## Operating notes

The project includes operating handoffs and acceptance records in `ADMIN_OPERATIONS.md`, `CATALOG_SETUP.md`, `SHOPIFY_HANDOFF.md`, `USER_FLOW_QA.md`, and `QA_VERIFICATION.md`. Read `DEPLOYMENT_GUIDE.md` before changing hosting or GitHub Pages settings.
