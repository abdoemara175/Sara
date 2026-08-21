# Deployment Guide

## Full application runtime

The production NOURA application requires an Express server, tRPC procedures, database-backed local authentication, server-side session validation, Shopify Storefront API credentials, and server-held AI search credentials. It is therefore deployed on the managed application host at `https://cosmobeauty-nx34uya9.manus.space`.

The current quality gate covers the application build, local authentication lifecycle, role enforcement, user administration, product discovery, Shopify catalogue retrieval, cart create/update/remove behavior, and checkout URL handoff. Payment activation and live-order acceptance remain a Shopify-owner action after the owner chooses a Shopify plan and configures payment and shipping settings.

## GitHub repository and Pages

The complete source is synchronized to [`abdoemara175/Sara`](https://github.com/abdoemara175/Sara). GitHub Pages can host static files but cannot run this application's Express server, database, server-side session checks, or protected Shopify Storefront credential. It must therefore not be presented as the working production storefront.

The published overview is available at [abdoemara175.github.io/Sara](https://abdoemara175.github.io/Sara/). GitHub Pages currently uses the `main` branch repository root; the root `index.html` deliberately redirects to `docs/`, which contains the labeled static project overview and link to the managed full-stack application. The functional deployment remains the managed application host.

## Post-launch owner checklist

1. Add the production catalogue, product imagery, prices, and category assignments in Shopify.
2. Configure Egypt shipping zones, delivery rates, payments, policies, and checkout settings in Shopify Admin.
3. Create a second trusted administrator through **Users & roles**, then retain at least one active administrator at all times.
4. Keep the managed full-stack deployment as the live store; use GitHub only for source control and optional static documentation.
