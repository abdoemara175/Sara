/** @vitest-environment jsdom */
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Home from "./Home";

vi.mock("@/components/storefront", () => ({
  CartDrawer: () => null,
  StoreHeader: () => null,
  StoreFooter: () => null,
  TrustBar: () => null,
  ProductGrid: () => null,
  HERO_IMAGE: "https://example.test/hero.jpg",
  categories: ["Make Up", "Skin Care"],
  shopHref: (category?: string) => category ? `/shop?category=${encodeURIComponent(category)}` : "/shop",
}));
vi.mock("@/lib/trpc", () => ({
  trpc: { commerce: { products: { list: { useQuery: () => ({ data: [], isLoading: false }) } } } },
}));

afterEach(() => cleanup());

describe("home discovery controls", () => {
  it("moves through hero collections and keeps primary discovery calls-to-action on the shop route", () => {
    render(<Home />);
    expect(screen.getByText("The Ordinary")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Next slide" }));
    expect(screen.getByText("Anua")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Show Sheglam" }));
    expect(screen.getByText("Sheglam")).toBeTruthy();
    expect(screen.getByRole("link", { name: /Shop collection/i }).getAttribute("href")).toBe("/shop");
    expect(screen.getByRole("link", { name: /Shop all products/i }).getAttribute("href")).toBe("/shop");
  });
});
