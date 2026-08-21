/** @vitest-environment jsdom */
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AdminDashboard from "./AdminDashboard";

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
            products: [],
            shopifyAdminUrl: "https://noura-test.myshopify.com/admin",
          },
          isLoading: false,
          error: null,
        }),
      },
    },
  },
}));

vi.mock("@/components/storefront", () => ({
  CartDrawer: () => null,
  StoreFooter: () => <footer />,
  StoreHeader: () => <header />,
  formatEgp: () => "EGP 0",
}));

vi.mock("@/components/UserManagement", () => ({
  UserManagement: () => <section aria-label="User management" />,
}));

describe("administrator Shopify operations handoff", () => {
  it("provides the protected administrator with operational Shopify destinations", () => {
    render(<AdminDashboard />);

    expect(screen.getByRole("link", { name: "Catalogue manager" }).getAttribute("href")).toBe("https://noura-test.myshopify.com/admin/products");
    expect(screen.getByRole("link", { name: "Orders & fulfilment" }).getAttribute("href")).toBe("https://noura-test.myshopify.com/admin/orders");
    expect(screen.getByRole("link", { name: "Discounts & offers" }).getAttribute("href")).toBe("https://noura-test.myshopify.com/admin/discounts");
    expect(screen.getByRole("link", { name: "Payments & checkout" }).getAttribute("href")).toBe("https://noura-test.myshopify.com/admin/settings/payments");
    expect(screen.getByRole("link", { name: "Shipping & delivery" }).getAttribute("href")).toBe("https://noura-test.myshopify.com/admin/settings/shipping");
    expect(screen.getByRole("link", { name: "Open orders workspace" }).getAttribute("href")).toBe("https://noura-test.myshopify.com/admin/orders");
    expect(screen.getByText(/There are no stored order snapshots in NOURA/)).toBeTruthy();
  });
});
