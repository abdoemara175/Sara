/** @vitest-environment jsdom */
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import NouraOperations from "./NouraOperations";

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => ({ user: { id: 77, role: "admin", requiresPasswordChange: false }, loading: false }),
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    admin: {
      overview: {
        useQuery: () => ({
          data: {
            catalog: { totalProducts: 11, availableProducts: 11, discountedProducts: 2, activeCategories: 11 },
            products: [{ id: "product-1", title: "Serene Barrier Serum", productType: "Skin Care", images: [], priceRange: { min: { amount: "650.00", currencyCode: "EGP" } } }],
            shopifyAdminUrl: "https://noura-test.myshopify.com/admin",
          },
          isLoading: false,
          error: null,
          refetch: vi.fn(),
        }),
      },
    },
  },
}));

vi.mock("@/components/storefront", () => ({
  CartDrawer: () => null,
  StoreFooter: () => <footer />,
  StoreHeader: () => <header />,
  formatEgp: () => "EGP 650",
}));

describe("NOURA Operations workspace", () => {
  it("keeps a verified administrator inside clear catalogue, offer, order, and setting workflows", async () => {
    const user = userEvent.setup();
    render(<NouraOperations />);

    expect(screen.getByText("One calm place to run the store.")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Catalogue" }));
    expect(screen.getByText("Serene Barrier Serum")).toBeTruthy();
    expect(screen.getByText("Live storefront read")).toBeTruthy();
    expect(screen.getByText(/Titles, price, category, media, inventory, and publication are edited in Shopify/)).toBeTruthy();
    expect(screen.getByRole("link", { name: "Open products" }).getAttribute("href")).toBe("https://noura-test.myshopify.com/admin/products");

    await user.click(screen.getByRole("button", { name: "Offers" }));
    expect(screen.getByText("Offers live in Shopify")).toBeTruthy();
    expect(screen.getByText(/does not mirror active codes into the storefront/)).toBeTruthy();
    expect(screen.getByRole("link", { name: "Open discounts" }).getAttribute("href")).toBe("https://noura-test.myshopify.com/admin/discounts");

    await user.click(screen.getByRole("button", { name: "Orders" }));
    expect(screen.getByText("No copied order data")).toBeTruthy();
    expect(screen.getByText(/payment status, addresses, and fulfilment remain exclusively in Shopify/)).toBeTruthy();
    expect(screen.getByText(/intentional customer-data protection/)).toBeTruthy();
    expect(screen.getByRole("link", { name: "Open orders" }).getAttribute("href")).toBe("https://noura-test.myshopify.com/admin/orders");

    await user.click(screen.getByRole("button", { name: "Settings" }));
    expect(screen.getByText(/NOURA never handles card details/)).toBeTruthy();
    expect(screen.getByText(/Set Egyptian zones, rates, delivery estimates/)).toBeTruthy();
    expect(screen.getByRole("link", { name: "Open payments" }).getAttribute("href")).toBe("https://noura-test.myshopify.com/admin/settings/payments");
    expect(screen.getByRole("link", { name: "Open shipping" }).getAttribute("href")).toBe("https://noura-test.myshopify.com/admin/settings/shipping");
  });
});
