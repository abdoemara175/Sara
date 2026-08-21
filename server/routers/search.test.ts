import type { Product } from "@shared/commerce/types";
import { describe, expect, it } from "vitest";
import { inferIntent, rankProducts } from "./search";

const serum: Product = {
  id: "1", handle: "serum", title: "Serene Barrier Serum", description: "A hydrating facial serum", descriptionHtml: "", productType: "Skin Care", vendor: "Noura", tags: ["Skin Care", "Serum"], options: [],
  priceRange: { min: { amount: "790", currencyCode: "EGP" }, max: { amount: "790", currencyCode: "EGP" } }, images: [], variants: [],
};
const blush: Product = {
  id: "2", handle: "blush", title: "Velvet Blush Duo", description: "Cream colour for cheeks", descriptionHtml: "", productType: "Make Up", vendor: "Noura", tags: ["Make Up", "Blush"], options: [],
  priceRange: { min: { amount: "620", currencyCode: "EGP" }, max: { amount: "620", currencyCode: "EGP" } }, images: [], variants: [],
};

describe("beauty search ranking", () => {
  it("understands an Arabic skin-care intent and ranks the matching product first", () => {
    const intent = inferIntent("عايز سيروم للبشرة");
    expect(intent.category).toBe("Skin Care");
    expect(rankProducts([blush, serum], "عايز سيروم للبشرة", intent)[0]?.handle).toBe("serum");
  });

  it("ranks a direct product keyword above unrelated beauty products", () => {
    const intent = inferIntent("blush");
    expect(rankProducts([serum, blush], "blush", intent).map(product => product.handle)).toEqual(["blush"]);
  });
});
