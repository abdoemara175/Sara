# NOURA Shopify Operations

## Current operating model

NOURA uses Shopify as the source of truth for checkout, payments, orders, fulfilment, inventory, discounts, and catalogue publication. The storefront reads the live catalogue through the Storefront API and sends customers to Shopify-hosted checkout. This keeps payment credentials and checkout compliance inside Shopify rather than the public storefront.

The protected NOURA administrator area provides the operational overview, authenticated user administration, catalogue visibility, and direct, role-safe paths to the relevant Shopify Admin surfaces. Product, discount, order, payment, and fulfilment mutations remain in Shopify Admin until an owner-approved server integration is provisioned.

## Administrator workflow

| Task | Current safe route | Required information |
| --- | --- | --- |
| Add or edit a product | Shopify Admin → Products | Title, category, product description, price, compare-at price if on sale, inventory, publication state, and imagery. |
| Set a category | Shopify Admin product type and tags | Use one of NOURA's eleven established category names exactly. |
| Add a product-level sale | Edit the variant price and compare-at price | Compare-at price must be greater than the sale price. |
| Create a discount code | Shopify Admin → Discounts | Promotion name, code, type, start/end time, use limit, and product or collection scope. |
| Review an order | Shopify Admin → Orders | Payment state, delivery address, line items, and fulfilment status. |
| Configure payment | Shopify Admin → Settings → Payments | Approved provider and, if needed, Cash on Delivery settings. |
| Configure delivery | Shopify Admin → Settings → Shipping and delivery | Egyptian zones, rates, delivery estimates, and fulfilment location. |

## Customer payment journey

1. The customer adds an available product variant to the cart.
2. The cart drawer opens Shopify's hosted checkout URL.
3. Shopify displays the configured payment and delivery choices, validates the address, and calculates shipping.
4. Shopify creates the order after the customer completes checkout.
5. The administrator reviews payment and fulfilment status in Shopify Admin and completes packing, shipment, or customer service there.

## Before accepting live orders

The owner must complete the following inside Shopify Admin. These actions are intentionally not executed automatically because they can activate financial collection, delivery charges, and customer communications.

- Claim the connected Shopify store and select the required Shopify plan.
- Choose the Egyptian payment mix: Cash on Delivery only, or Cash on Delivery plus an approved online provider.
- Configure delivery zones, rates, estimated delivery windows, tax treatment, fulfilment location, and inventory levels.
- Create one owner-approved low-value test order, then confirm its payment, shipping price, order notification, and fulfilment workflow.
- Add only official business contact channels to NOURA's footer after they have been confirmed by the owner.

## Future in-site operational controls

To expose write actions directly inside NOURA instead of Shopify Admin, the owner must approve a dedicated Shopify app integration with least-privilege scopes and signed webhooks. The integration must cover product, discount, order, and fulfilment access, validate Shopify signatures, reject replayed events, and preserve Shopify as the source of truth. It must be reviewed and enabled only after the owner supplies the secure credentials through project settings.

> **Safety boundary:** NOURA does not store card details, payment-provider credentials, or checkout session secrets. Customer payments remain on Shopify-hosted checkout.
***
