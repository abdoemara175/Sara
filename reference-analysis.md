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
***
