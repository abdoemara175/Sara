import { listProducts } from "../_core/shopify";
import { adminProcedure, router } from "../_core/trpc";

function getShopifyAdminUrl() {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  return domain ? `https://${domain}/admin` : null;
}

export const adminRouter = router({
  overview: adminProcedure.query(async () => {
    const products = await listProducts({ first: 100 });
    const discountedProducts = products.filter(product =>
      product.variants.some(variant => Boolean(variant.compareAtPrice))
    );
    const availableProducts = products.filter(product =>
      product.variants.some(variant => variant.availableForSale)
    );
    const categoryCount = new Set(products.map(product => product.productType).filter(Boolean)).size;

    return {
      catalog: {
        totalProducts: products.length,
        availableProducts: availableProducts.length,
        discountedProducts: discountedProducts.length,
        activeCategories: categoryCount,
      },
      products: products.slice(0, 8),
      shopifyAdminUrl: getShopifyAdminUrl(),
    };
  }),
});
