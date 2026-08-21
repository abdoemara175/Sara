# User Flow Quality Matrix

This matrix records the supported NOURA journeys and the server or UI boundary that protects each one. It is maintained alongside the automated test suite.

| Persona or state | Expected journey | Enforced outcome |
| --- | --- | --- |
| Visitor | Discover collections, select a category, open a product, add an item to a cart, and continue to Shopify checkout. | Storefront and cart procedures are public; checkout is handed to the Shopify checkout URL only after a cart exists. |
| Customer | Sign in locally, shop, maintain a persisted cart, and sign out. | Local sign-in has password verification and lockout protection; sign-out increments the server-side session version. |
| Temporary-password user | Sign in, then replace the temporary password before administration. | The account page presents the password-change step; administrator navigation is hidden and server procedures return `FORBIDDEN` until completion. |
| Administrator | Sign in with a completed password state, review catalogue metrics, and manage user roles and statuses. | `adminProcedure` verifies the stored administrator role on the server; client-side links are only convenience, not authorization. |
| Disabled user | Attempt to reuse an existing local session after being disabled. | Request authentication rejects the session before any protected procedure runs. |
| Anonymous or customer attempting administration | Open or invoke administration operations. | Requests are rejected before administration data is returned. |

## Session lifecycle checks

The automated suite validates sign-in, password hashing, temporary-password completion, password-change session rotation, sign-out revocation, and disabled-account rejection. Password-change now increments the server-side session version, invalidates every prior local session token, and issues a new session cookie for the successful request.

## Commerce journey checks

Category links preserve the selected category in the shop URL. The shop view filters to matching items, product cards lead to the product-detail view, and adding an available variant opens the cart drawer. The cart supports quantity changes, removals, rehydration from local storage, and a checkout handoff to the Storefront API checkout URL.
***
