# Administrative Operations Model

The application separates **customer storefront capabilities** from **store-management capabilities**. Customers can browse published products, use the cart, and proceed through Shopify checkout. The application’s server verifies a user’s role before exposing the protected `/admin` route or the `admin.*` procedure family.

## Role boundary

| Role | In-app access | Commerce-management access |
| --- | --- | --- |
| Public visitor | Browse published products and discover categories. | None. |
| Customer | Account view, cart, and Shopify checkout. | None. |
| Administrator | Protected overview dashboard and operational links. | Shopify Admin controls for products, inventory, orders, payments, shipping, and fulfilment. |

> Product, order, payment, and fulfilment mutations are intentionally delegated to **Shopify Admin**. The deployed storefront is configured with a Storefront API credential, which is appropriate for product discovery and cart creation but must not be used to perform privileged store-administration actions.

This design keeps elevated actions in Shopify’s authenticated administrative environment, avoids exposing an Admin API secret to browser code, and preserves Shopify’s own permission and audit controls. The in-app dashboard is a protected operational entry point and catalogue health view; its administrator links open the corresponding Shopify Admin area in a separate tab.

For a future custom in-app operations console, use a dedicated server-side Shopify Admin API integration with narrowly scoped credentials, immutable audit logging, explicit mutation schemas, and a separate security review. Do not repurpose Storefront API credentials for that work.
