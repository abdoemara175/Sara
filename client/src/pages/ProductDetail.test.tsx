/** @vitest-environment jsdom */
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ProductDetail from "./ProductDetail";

const addItem = vi.fn();
const testProduct = {
  id: "product-1",
  title: "Velvet Blush Duo",
  productType: "Make Up",
  description: "A soft colour duo.",
  images: [{ url: "https://example.test/one.jpg", altText: "First" }, { url: "https://example.test/two.jpg", altText: "Second" }],
  options: [{ name: "Shade", values: ["Rose", "Peach"] }],
  priceRange: { min: { amount: "620", currencyCode: "EGP" }, max: { amount: "620", currencyCode: "EGP" } },
  variants: [
    { id: "rose", title: "Rose", availableForSale: true, price: { amount: "620", currencyCode: "EGP" }, compareAtPrice: null, selectedOptions: [{ name: "Shade", value: "Rose" }] },
    { id: "peach", title: "Peach", availableForSale: true, price: { amount: "620", currencyCode: "EGP" }, compareAtPrice: null, selectedOptions: [{ name: "Shade", value: "Peach" }] },
  ],
};

vi.mock("@/contexts/CartContext", () => ({
  useCart: () => ({ addItem, loading: false, cart: null, isOpen: false, itemCount: 0, openCart: vi.fn(), closeCart: vi.fn(), updateQuantity: vi.fn(), removeItem: vi.fn(), clearCart: vi.fn(), proceedToCheckout: vi.fn() }),
}));
vi.mock("@/components/storefront", () => ({
  CartDrawer: () => null,
  StoreHeader: () => null,
  StoreFooter: () => null,
  ProductGrid: () => null,
  formatEgp: (money: { amount: string }) => `EGP ${money.amount}`,
}));
vi.mock("@/lib/trpc", () => ({
  trpc: {
    commerce: {
      products: {
        byHandle: { useQuery: () => ({ data: testProduct, isLoading: false, error: null, refetch: vi.fn() }) },
        list: { useQuery: () => ({ data: [] }) },
      },
    },
  },
}));

afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe("product detail completion flow", () => {
  it("lets a customer select an available variant, adjust quantity, inspect images, and add the chosen line to cart", () => {
    render(<ProductDetail handle="velvet-blush-duo" />);
    expect(screen.getByRole("heading", { name: "Velvet Blush Duo" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "View product image 2" }));
    expect(screen.getAllByAltText("Velvet Blush Duo")[0].getAttribute("src")).toBe("https://example.test/two.jpg");

    fireEvent.click(screen.getByRole("button", { name: "Peach" }));
    fireEvent.click(screen.getByRole("button", { name: "Increase quantity" }));
    fireEvent.click(screen.getByRole("button", { name: "Add to Cart" }));
    expect(addItem).toHaveBeenCalledWith("peach", 2);
  });
});
