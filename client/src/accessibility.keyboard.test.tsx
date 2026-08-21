/** @vitest-environment jsdom */
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CartDrawer, categories, shopHref, StoreFooter, StoreHeader } from "./components/storefront";
import { categoryFromSearch, filterProductsByCategory } from "./pages/Shop";
import NotFound from "./pages/NotFound";

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
  it("keeps category discovery and the empty-bag recovery action on explicit shop routes", () => {
    render(<StoreHeader />);
    expect(shopHref("Skin Care")).toBe("/shop?category=Skin%20Care");
    expect(categoryFromSearch("?category=Skin%20Care")).toBe("Skin Care");
    expect(categoryFromSearch("?category=Unknown")).toBeNull();
    for (const category of categories) {
      expect(screen.getAllByRole("link", { name: category }).some(link => link.getAttribute("href") === shopHref(category))).toBe(true);
    }

    cleanup();
    cartState.mockReturnValue({ cart: null, isOpen: true, loading: false, itemCount: 0, ...actions });
    render(<CartDrawer />);
    expect(screen.getByRole("link", { name: "Browse the edit" }).getAttribute("href")).toBe("/shop");
  });

  it("filters matching catalogue items while every other requested category receives a valid empty state", () => {
    const products = [
      { id: "skin", productType: "Skin Care", tags: [], title: "Serum" },
      { id: "makeup", productType: "Make Up", tags: ["Featured"], title: "Blush" },
    ] as any[];
    expect(filterProductsByCategory(products, "Skin Care").map(product => product.id)).toEqual(["skin"]);
    expect(filterProductsByCategory(products, "Make Up").map(product => product.id)).toEqual(["makeup"]);
    for (const category of categories.filter(category => category !== "Skin Care" && category !== "Make Up")) {
      expect(filterProductsByCategory(products, category)).toEqual([]);
    }
    expect(filterProductsByCategory(products, null)).toHaveLength(2);
  });

  it("moves from the live search field to the cart trigger and exposes the protected Admin link", async () => {
    const user = userEvent.setup();
    render(<StoreHeader />);

    const search = screen.getByPlaceholderText("Ask for a product in Arabic or English...");
    search.focus();
    await user.tab();

    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Open cart" }));
    expect(screen.getByRole("link", { name: "Admin" }).getAttribute("href")).toBe("/admin");
  });

  it("does not expose an administrator shortcut before a temporary password is changed", () => {
    authState.mockReturnValue({ user: { role: "admin", requiresPasswordChange: true } });
    render(<StoreHeader />);
    expect(screen.queryByRole("link", { name: "Admin" })).toBeNull();
  });

  it("routes global featured and about tabs back to their home-page sections", () => {
    render(<><StoreHeader /><StoreFooter /></>);
    expect(screen.getByRole("link", { name: "Featured" }).getAttribute("href")).toBe("/#featured");
    expect(screen.getByRole("link", { name: "About" }).getAttribute("href")).toBe("/#about");
    expect(screen.getByRole("link", { name: "Featured picks" }).getAttribute("href")).toBe("/#featured");
  });

  it("does not render generic social placeholders as storefront actions", () => {
    render(<StoreFooter />);
    expect(screen.getByText(/official NOURA destinations/i)).toBeTruthy();
    expect(screen.queryByRole("link", { name: "Facebook" })).toBeNull();
    expect(screen.queryByRole("link", { name: "WhatsApp" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Location" })).toBeNull();
  });

  it("opens the desktop category tab and exposes all requested category routes", async () => {
    const user = userEvent.setup();
    render(<StoreHeader />);
    await user.click(screen.getByRole("button", { name: /Categories/i }));
    expect(screen.getByRole("button", { name: /Categories/i }).getAttribute("aria-expanded")).toBe("true");
    for (const category of categories) {
      expect(screen.getAllByRole("link", { name: category }).some(link => link.getAttribute("href") === shopHref(category))).toBe(true);
    }
  });

  it("keeps a missing route inside the NOURA storefront with a working return-home action", () => {
    render(<NotFound />);
    expect(screen.getByRole("heading", { name: "This page is not part of the ritual." })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Return home" }).getAttribute("href")).toBe("/");
  });

  it("opens the mobile navigation with account and category journey links", async () => {
    const user = userEvent.setup();
    render(<StoreHeader />);
    const trigger = screen.getByRole("button", { name: "Open navigation" });
    await user.click(trigger);

    expect(screen.getByRole("button", { name: "Close navigation" }).getAttribute("aria-expanded")).toBe("true");
    const mobileNavigation = document.getElementById("mobile-store-navigation");
    expect(mobileNavigation).toBeTruthy();
    expect(mobileNavigation?.querySelector('a[href="/account"]')).toBeTruthy();
    expect(mobileNavigation?.querySelector('a[href="/shop?category=Skin%20Care"]')).toBeTruthy();
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
