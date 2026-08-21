# NOURA Frontend Refinement Log

## Baseline visual audit

The olive-and-ivory foundation, hero split, category navigation, account card, and branded 404 route remain visually coherent. The main refinement priorities are to make the catalogue feel intentionally curated while Shopify data is loading, give product and discovery views stronger editorial hierarchy, and remove technical or generic wording from customer-facing surfaces.

### Observed gaps

| Surface | Observation | Refinement target |
| --- | --- | --- |
| Home discovery grids | Loading skeletons dominate the first visual frame while catalogue data is pending. | Add compact, branded loading guidance and preserve a useful discovery route. |
| Shop and product routes | Their first frame can appear as a largely blank skeleton grid or gallery. | Strengthen loading and failure recovery with helpful context, back-to-shop actions, and consistent visual rhythm. |
| Product merchandising | Most newly seeded products have no dedicated Shopify media yet. | Use the existing editorial fallback consistently, with intentional visual framing and meaningful alt text. |
| Account language | The sign-in surface still includes server-verification wording that reads as implementation detail. | Use customer-friendly account language while preserving the secure server-side logic. |
| Brand system | The botanical direction is present but needs a recurring NOURA signature beyond color. | Apply ritual-step numbering, botanical lines, and a deliberate display accent consistently. |

## Refinements applied

The shared navigation now preserves every category in a horizontally scrollable desktop index instead of clipping the first or final entry. Storefront loading states now identify what is being prepared, expose sensible recovery actions, and use a consistent olive shimmer rather than a blank neutral grid. The catalogue, product, and account screens use calmer customer-facing language, the product fallback image has an explicit visual treatment, and the account journey now opens with a branded NOURA space rather than implementation language.

Desktop and mobile checks confirmed that the discovery, category, product, and account layouts retain their hierarchy at the updated breakpoints. Loading-state screenshots intentionally capture the first frame before each independent live catalogue request resolves; live Shopify and UI acceptance tests continue to confirm the catalogue data and eleven category routes.

## Guardrails

All refinements must retain the live Shopify catalogue, cart, checkout handoff, account security, category routes, and server-enforced administration. No customer reviews, ratings, testimonials, discount codes, or unverified commercial claims will be added.
***
