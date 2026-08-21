export const operationViews = ["Overview", "Catalogue", "Offers", "Orders", "Settings"] as const;

export type OperationView = (typeof operationViews)[number];

export type OperationTask = {
  title: string;
  detail: string;
  source: "NOURA" | "Shopify";
};

export const orderFollowUpTasks: OperationTask[] = [
  { title: "Review the order", detail: "Check line items, address, and customer notes in Shopify Admin.", source: "Shopify" },
  { title: "Confirm payment", detail: "Use Shopify's financial status before packing or shipping anything.", source: "Shopify" },
  { title: "Prepare fulfilment", detail: "Record packing and shipment updates where the order record lives.", source: "Shopify" },
];

export const offerPlanningTasks: OperationTask[] = [
  { title: "Define the offer", detail: "Choose approved scope, customer value, and timing before publishing.", source: "NOURA" },
  { title: "Create in Shopify", detail: "Publish the actual code or automatic discount in Shopify Admin.", source: "Shopify" },
  { title: "Verify the customer path", detail: "Confirm the promotion is visible only where Shopify intends it to be.", source: "Shopify" },
];
