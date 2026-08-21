/** @vitest-environment jsdom */
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { categories } from "@/components/storefront";
import { isShopifyConfigured, listProducts } from "../../../server/_core/shopify";
import Shop from "./Shop";

const catalogueState = vi.hoisted(() => ({ products: [] as any[] }));

const fixtureCatalogue = [
  {
    id: "skin-1", handle: "serene-barrier-serum", title: "Serene Barrier Serum", description: "Barrier care", productType: "Skin Care", tags: [], images: [], options: [],
    priceRange: { min: { amount: "790", currencyCode: "EGP" }, max: { amount: "790", currencyCode: "EGP" } },
    variants: [{ id: "skin-variant", title: "Default Title", availableForSale: true, price: { amount: "790", currencyCode: "EGP" }, compareAtPrice: null, selectedOptions: [] }],
  },
  {
    id: "makeup-1", handle: "velvet-blush-duo", title: "Velvet Blush Duo", description: "Colour duo", productType: "Make Up", tags: ["Featured"], images: [], options: [],
    priceRange: { min: { amount: "620", currencyCode: "EGP" }, max: { amount: "620", currencyCode: "EGP" } },
    variants: [{ id: "makeup-variant", title: "Rose", availableForSale: true, price: { amount: "620", currencyCode: "EGP" }, compareAtPrice: null, selectedOptions: [] }],
  },
];
let liveCatalogue: any[] = [];
let useLiveCatalogue = false;

vi.mock("@/contexts/CartContext", () => ({
  useCart: () => ({ cart: null, isOpen: false, loading: false, itemCount: 0, openCart: vi.fn(), closeCart: vi.fn(), addItem: vi.fn(), updateQuantity: vi.fn(), removeItem: vi.fn(), clearCart: vi.fn(), proceedToCheckout: vi.fn() }),
}));
vi.mock("@/_core/hooks/useAuth", () => ({ useAuth: () => ({ user: null }) }));
vi.mock("@/lib/trpc", () => ({
  trpc: {
    commerce: { products: { list: { useQuery: () => ({ data: catalogueState.products, isLoading: false }) } } },
    search: { products: { useQuery: () => ({ data: { products: [] }, isFetching: false }) } },
  },
}));

function assertCategoryRoute(category: string, products: any[], source: "fixture" | "live") {
  window.history.replaceState({}, "", `/shop?category=${encodeURIComponent(category)}`);
  render(<Shop />);

  const matching = products.filter(product => product.productType === category || product.tags.includes(category));
  expect(screen.getByRole("heading", { name: category })).toBeTruthy();
  expect(screen.getAllByRole("link", { name: category }).some(link => link.getAttribute("aria-current") === "page")).toBe(true);
  expect(screen.getByRole("link", { name: "Clear filter" }).getAttribute("href")).toBe("/shop");
  expect(screen.getByText(`${matching.length} ${matching.length === 1 ? "product" : "products"} shown`)).toBeTruthy();
  if (matching.length) {
    expect(screen.getByText(matching[0].title)).toBeTruthy();
  } else {
    expect(screen.getByText(`We are preparing ${category} for you. Explore another ritual while the edit grows.`)).toBeTruthy();
  }
  console.log("[category-ui-acceptance]", JSON.stringify({ source, category, resultCount: matching.length, state: matching.length ? "product-result" : "empty-recovery", clearFilterHref: "/shop" }));
  cleanup();
}

beforeEach(() => { catalogueState.products = useLiveCatalogue ? liveCatalogue : fixtureCatalogue; });
afterEach(() => cleanup());

describe("shop category acceptance matrix", () => {
  for (const category of categories) {
    it(`renders ${category} as an active route with a result or a recoverable empty state`, () => {
      assertCategoryRoute(category, fixtureCatalogue, "fixture");
    });
  }
});

const liveShopifyEnabled = isShopifyConfigured();
describe.skipIf(!liveShopifyEnabled)("live Shopify category UI acceptance matrix", () => {
  beforeAll(async () => {
    liveCatalogue = await listProducts({ first: 25 });
    useLiveCatalogue = true;
    catalogueState.products = liveCatalogue;
  }, 30_000);

  afterAll(() => { useLiveCatalogue = false; catalogueState.products = fixtureCatalogue; });

  for (const category of categories) {
    it(`renders the live ${category} route with its actual result state and recovery path`, () => {
      assertCategoryRoute(category, liveCatalogue, "live");
    });
  }
});
