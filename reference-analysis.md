# Reference Storefront Notes

## Observed home-page structure

1. A compact cream/white top header combines brand mark, utility navigation, search control, and cart count.
2. A second row provides an all-category navigation treatment with a shop entry and eleven product categories.
3. The home page sequence is: search field, full-width promotional carousel, trust statements, discounted products, category directory, featured-product grid, social footer.
4. Product cards are image-led and minimal: small sale indicator, product name, struck-through price, sale price, quick-view entry, and cart action.
5. The visual language uses a pale neutral background, dark serif/italic display headings, warm tan/gold action accents, compact typography, and generous white card space.

## Observed shop-page structure

1. The shop page preserves both navigation tiers and uses a centered `ALL PRODUCTS` section title.
2. The desktop product grid displays four product cards per row, with a responsive card layout expected for smaller screens.
3. Cards support direct add-to-cart where no variants are required and an option-selection path when variants exist.
4. The source page uses discount-first merchandising and pagination below the grid.

## Observed product-detail structure

1. The product page places product media alongside the purchasing panel in a right-to-left visual composition.
2. The purchasing panel includes the product name, breadcrumb-style category links, sale badge, sale price with an original-price strike-through, short description, variant selector, quantity stepper, and add-to-cart button.
3. Long-form content appears in description and additional-information tabs, followed by a related-products grid.

## Required original implementation boundaries

- Preserve the hierarchy, interaction patterns, and general visual rhythm while using independent code, original assets, and a distinct storefront identity.
- Build all requested category labels, trust messages, carousel brands, and commerce interactions in the new project.

## Implementation verification

- The Shopify Storefront endpoint returns the two original demonstration products with images, active sale prices, and buyable variants.
- The built home view presents the requested hero brands, trust statements, flash-sale module, category directory, featured products, AI search entry point, and Shopify-backed card links.
- The shop screen initially shows a non-blocking loading skeleton while the remote catalog resolves, then displays the published product cards with original and discounted prices.
- The AI search typeahead was verified with the Arabic query `عايز سيروم للبشرة` and returned the relevant Serene Barrier Serum suggestion.
- The product-detail view was verified after load with sale pricing, product description, quantity stepper, add-to-cart control, and a related-product card.
- Adding the Serene Barrier Serum opened the cart drawer with quantity controls, a subtotal of EGP 790, and the checkout call to action.
- The Shopify product endpoint for Velvet Blush Duo now exposes a two-image gallery and three live shades: Dawn, Rose, and Peach.
- Keyboard tab navigation visibly focuses the storefront brand/navigation controls, and cart/search controls carry accessible labels.
- During final visual verification, the Shopify Storefront endpoint intermittently timed out for the variant product; its direct tRPC response still confirmed the gallery and shade payload, and the interface retains a loading skeleton during such transient remote failures.
- The administrative route was opened from an unauthenticated browser session; no operational metrics or catalogue data were rendered before session evaluation, while automated server tests enforce the underlying role boundary.
- After the owner signed in, the global navigation exposed the Admin entry and the protected route rendered the server-verified administrator dashboard shell without exposing it to an unauthenticated session.
- With the owner session active and the catalogue connection restored, the dashboard displayed two products and its four live metrics. Keyboard Tab navigation visibly focused the branded navigation control, while the dashboard exposed named operational links and a named storefront link.
- The dashboard now applies a high-contrast ochre focus outline to links and controls. Keyboard focus advanced visibly from Home to Shop in the administrator session; the operational controls are semantic named anchors and buttons using the same focus treatment.
- A final attempt to render Velvet Blush Duo in the browser remained on the loading skeleton because the Shopify storefront connection again timed out; the protected dashboard had previously confirmed the same live catalogue contained the product.
- The signed-in owner has access to the connected Shopify Admin store, including Products, Orders, Analytics, sales channels, and Settings. This is the appropriate privileged console for payments, shipping, inventory, and fulfilment operations.
- Shopify currently has one default shipping profile covering all products, one fulfilment location, and two shipping zones. Estimated delivery dates, local delivery, and pickup are disabled; no carrier account is connected. These settings were reviewed without modification while payment activation remains deferred.
- Shopify Checkout has an active configuration using email as the customer contact method, order tracking enabled, and no required customer sign-in. Customer account sign-in links are enabled, while self-serve returns are disabled; no configuration was changed.
- After a successful catalogue load seeded the short-lived fallback cache, Velvet Blush Duo rendered with its sale price, three selectable shades (Dawn, Rose, Peach), a variant-aware add-to-cart control, and the related product section.
- The product page exposes two labelled thumbnail buttons. Selecting the second thumbnail visibly changed the main product image and highlighted the selected thumbnail, confirming the gallery interaction works.
- Final visual confirmation: after selecting thumbnail 2, the main PDP image displayed the open compact product artwork instead of the original still-life image, while the shade controls and add-to-cart controls remained available.
- DOM confirmation after the interaction: the first rendered product-image source was `KxmKJKSJagfFzLcK.png` (the compact artwork), and the same source appeared for the second gallery thumbnail; the original still-life source remained the other thumbnail. This confirms thumbnail 2 was selected and supplied the active main image.
- The AI search field accepted the focused query `blush` on the product page while the PDP retained accessible named shade, quantity, and cart controls. The store applies the same focus-visible treatment to these native controls.
- With Rose selected, pressing Tab moved the visible focus ring to the adjacent Peach shade control. This confirms keyboard progression through the product variant buttons.
- Keyboard-only checks covered the shared header navigation, focused AI-search field, PDP variant progression, and named administrator links. The cart drawer had previously been verified with named close, quantity, and checkout controls; all of these native controls share the explicit `:focus-visible` outline treatment.
- The Rose variant remains visibly selected and the add-to-cart control enters its loading state when invoked; the cart count did not update during the immediate visual check, so the asynchronous cart response requires observation before treating the interaction as complete.
***
