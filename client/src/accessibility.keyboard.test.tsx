/** @vitest-environment jsdom */
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CartDrawer, StoreHeader } from "./components/storefront";

const cartState = vi.fn();
const authState = vi.fn();

vi.mock("@/contexts/CartContext", () => ({ useCart: () => cartState() }));
vi.mock("@/_core/hooks/useAuth", () => ({ useAuth: () => authState() }));
vi.mock("@/lib/trpc", () => ({
  trpc: { search: { products: { useQuery: () => ({ data: { products: [] }, isFetching: false }) } } },
}));

const cart = {
  id: "cart-1",
  checkoutUrl: "https://example.test/checkout",
  itemCount: 1,
  subtotal: { amount: "620.00", currencyCode: "EGP" },
  items: [{
    lineId: "line-1",
    quantity: 1,
    productTitle: "Velvet Blush Duo",
    variantTitle: "Rose",
    image: null,
    lineTotal: { amount: "620.00", currencyCode: "EGP" },
  }],
} as const;

const actions = {
  openCart: vi.fn(), closeCart: vi.fn(), addItem: vi.fn(), updateQuantity: vi.fn(),
  removeItem: vi.fn(), clearCart: vi.fn(), proceedToCheckout: vi.fn(),
};

beforeEach(() => {
  cartState.mockReturnValue({ cart, isOpen: false, loading: false, itemCount: 1, ...actions });
  authState.mockReturnValue({ user: { role: "admin" } });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("real storefront keyboard navigation", () => {
  it("moves from the live search field to the cart trigger and exposes the protected Admin link", async () => {
    const user = userEvent.setup();
    render(<StoreHeader />);

    const search = screen.getByPlaceholderText("Ask for a product in Arabic or English...");
    search.focus();
    await user.tab();

    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Open cart" }));
    expect(screen.getByRole("link", { name: "Admin" }).getAttribute("href")).toBe("/admin");
  });

  it("keeps the live cart drawer close, quantity, removal, and checkout controls reachable by Tab", async () => {
    const user = userEvent.setup();
    cartState.mockReturnValue({ cart, isOpen: true, loading: false, itemCount: 1, ...actions });
    render(<CartDrawer />);

    const closeBackdrop = screen.getByLabelText("Close cart");
    closeBackdrop.focus();
    await user.tab();
    expect(document.activeElement).toBe(screen.getByLabelText("Close cart panel"));
    await user.tab();
    expect(document.activeElement).toBe(screen.getByLabelText("Decrease Velvet Blush Duo quantity"));
    await user.tab();
    expect(document.activeElement).toBe(screen.getByLabelText("Increase Velvet Blush Duo quantity"));
    await user.tab();
    expect(document.activeElement).toBe(screen.getByLabelText("Remove Velvet Blush Duo"));
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Secure checkout" }));
  });
});
