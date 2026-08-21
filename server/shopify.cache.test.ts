import { afterEach, describe, expect, it, vi } from "vitest";

const rawProduct = {
  id: "gid://shopify/Product/1",
  title: "Cached Serum",
  handle: "cached-serum",
  description: "A cached product",
  descriptionHtml: "<p>A cached product</p>",
  productType: "Skin Care",
  vendor: "Noura Beauty Lab",
  tags: ["Skin Care"],
  options: [],
  priceRange: {
    minVariantPrice: { amount: "100.00", currencyCode: "EGP" },
    maxVariantPrice: { amount: "100.00", currencyCode: "EGP" },
  },
  images: { edges: [{ node: { url: "https://example.test/serum.png", altText: "Serum" } }] },
  variants: {
    edges: [{
      node: {
        id: "gid://shopify/ProductVariant/1",
        title: "Default Title",
        availableForSale: true,
        price: { amount: "100.00", currencyCode: "EGP" },
        compareAtPrice: null,
        selectedOptions: [],
      },
    }],
  },
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("Shopify catalogue fallback", () => {
  it("returns the recent catalogue when a later Storefront request times out", async () => {
    vi.stubEnv("SHOPIFY_STORE_DOMAIN", "example.myshopify.com");
    vi.stubEnv("SHOPIFY_STOREFRONT_API_ACCESS_TOKEN", "test-token");
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: { products: { edges: [{ node: rawProduct }] } } }), { status: 200 }))
      .mockRejectedValueOnce(new TypeError("connect timeout"));
    vi.stubGlobal("fetch", fetchMock);

    const { listProducts } = await import("./_core/shopify");
    const liveProducts = await listProducts({ first: 10 });
    const cachedProducts = await listProducts({ first: 10 });

    expect(liveProducts[0]?.handle).toBe("cached-serum");
    expect(cachedProducts).toEqual(liveProducts);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
