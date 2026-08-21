# Live Verification Record

## Administrator access

On 21 August 2026, the local administrator session for `abdoemara.175@gmail.com` was verified in the connected browser after the required password rotation. The account view showed the administrator navigation entry and the protected administration card.

The server-verified administration dashboard subsequently loaded the live catalogue metrics, the two configured products, commerce links, and the **Users & roles** controls. The administrator record was visible as active, with the user-management safeguards explained in the interface.

## Authentication response boundary

The `auth.me` procedure now returns only the deliberate public identity projection: identifier, display name, email, login method, role, and the user-facing `requiresPasswordChange` indicator. Credential hashes, session versions, lockout counters, timestamps, internal identifiers, and raw password-change metadata are not included in the browser contract.

## Store journey

On 21 August 2026, category links in the header, mega-menu, mobile navigation, and home-category grid were verified to preserve a category query parameter. The live `Skin Care` route selected the corresponding filter, displayed one matching product, exposed an explicit clear-filter action, and retained the normal path into the product-detail page.

The live home page was subsequently verified with the catalogue loaded: both current products appeared in the flash-sale edit, every category pointed to its own shop-filter URL, and the discovery route into product detail remained available from the product cards.

The live product-detail page for **Serene Barrier Serum** loaded its price, available format, quantity state, product-origin guidance, checkout expectation, delivery context, and detail copy. The complete add/update/remove/checkout sequence is additionally covered by the cart-context regression suite because the connected-browser extension intermittently timed out during direct interaction.

## Shopify storefront verification

After refreshing the project Shopify integration, the live Storefront probe returned the two configured products with a title, available variant, image, and non-zero EGP price. The expanded live smoke test then created a cart, changed its only line from quantity 1 to 2, removed the line, and confirmed that the resulting cart was empty. No checkout was initiated and no order or payment was created during this verification.

## Eleven-category acceptance matrix

On 21 August 2026, every `/shop?category=...` route returned HTTP 200 from the live preview. Screenshot captures verified the category title, active filter chip, and **Clear filter** action for all eleven encoded routes. The live Shopify probe now returns eleven active products, with one product assigned to each storefront category. The code-verifiable eleven-case UI acceptance matrix renders every category route and asserts the active chip, visible count and matching result, plus the return route to `/shop`. The same matrix now feeds the UI through `listProducts()` from the actual live Shopify Storefront response and logs one product result for every category.

| Category | Live catalogue result | Filter behavior | Recovery path |
|---|---:|---|---|
| Make Up | 1 product | Selected chip; Velvet Blush Duo result | Clear filter → `/shop` |
| Skin Care | 1 product | Selected chip; Serene Barrier Serum result | Clear filter → `/shop` |
| Hair Care | 1 product | Selected chip; NOURA Repair Ritual Shampoo result | Clear filter → `/shop` |
| Body Care | 1 product | Selected chip; NOURA Desert Veil Body Lotion result | Clear filter → `/shop` |
| Baby Care | 1 product | Selected chip; NOURA Little Cloud Gentle Wash result | Clear filter → `/shop` |
| Instruments & Devices | 1 product | Selected chip; NOURA Cooling Ritual Face Roller result | Clear filter → `/shop` |
| Nails & Oral Care | 1 product | Selected chip; NOURA Pearl Nail Care Oil result | Clear filter → `/shop` |
| Female Intimate | 1 product | Selected chip; NOURA Soft Balance Intimate Wash result | Clear filter → `/shop` |
| Shaving Tools | 1 product | Selected chip; NOURA Smooth Ritual Precision Razor result | Clear filter → `/shop` |
| Hair Colors | 1 product | Selected chip; NOURA Cocoa Veil Hair Color result | Clear filter → `/shop` |
| Other | 1 product | Selected chip; NOURA Cotton Cloud Makeup Pads result | Clear filter → `/shop` |
