# Shopify Ownership and Checkout Handoff

The storefront is connected to a Shopify store created for this project. The product catalogue, cart, and checkout link are already routed through Shopify. Before accepting real customer orders, the store owner must claim the connected store from the project settings, then configure payment providers, delivery regions and rates for Egypt, tax settings, and fulfilment locations inside Shopify Admin.

The checkout button intentionally opens Shopify’s hosted checkout. A live payment transaction has not been performed in preview because payment configuration and any final purchase require the owner’s approval. After claiming the store, the owner should run a low-value test order, confirm successful payment or cash-on-delivery selection, verify the shipping fee, and ensure the order appears in Shopify Admin for fulfilment.

## Operational checklist

| Area | Owner action | Expected outcome |
| --- | --- | --- |
| Store ownership | Claim the Shopify connection in project settings. | Administrative control of the storefront and sales channel. |
| Payments | Enable an approved payment provider and Cash on Delivery where applicable. | Checkout exposes the intended Egyptian payment choices. |
| Shipping | Configure Egypt zones, rates, and delivery estimates. | Buyers receive accurate delivery charges and options. |
| Fulfilment | Add fulfilment location and inventory quantities. | Buyable products can be packed and dispatched. |
| Final validation | Place one owner-approved test order. | Checkout, order creation, notification, and fulfilment path are confirmed end to end. |
