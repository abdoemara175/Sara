import { ArrowRight, Leaf, Sparkles } from "lucide-react";
import React, { useMemo } from "react";
import { Link, useLocation } from "wouter";
import { CartDrawer, categories, ProductGrid, ProductSkeletonGrid, shopHref, StoreFooter, StoreHeader } from "@/components/storefront";
import { trpc } from "@/lib/trpc";
import type { Product } from "@shared/commerce/types";

export function categoryFromSearch(search: string) {
  const category = new URLSearchParams(search).get("category");
  return categories.find(item => item === category) || null;
}

export function filterProductsByCategory(products: Product[], category: string | null) {
  return category ? products.filter(product => product.productType === category || product.tags.includes(category)) : products;
}

function CatalogueError({ onRetry }: { onRetry: () => void }) {
  return <div className="noura-card rounded-2xl px-6 py-14 text-center"><Sparkles size={23} className="mx-auto text-[#697b3c]" /><h2 className="mt-4 text-2xl font-semibold text-[#253a28]">The edit needs a moment.</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#667567]">We could not refresh the live catalogue right now. Your chosen filter is still ready when the connection returns.</p><button onClick={onRetry} className="noura-button-primary mt-6 px-5 py-3 text-xs font-black uppercase tracking-[0.12em]">Refresh products</button></div>;
}

export default function Shop() {
  const [location] = useLocation();
  const catalogue = trpc.commerce.products.list.useQuery();
  const products = catalogue.data ?? [];
  const selectedCategory = useMemo(() => categoryFromSearch(typeof window === "undefined" ? "" : window.location.search), [location]);
  const filteredProducts = useMemo(() => filterProductsByCategory(products, selectedCategory), [products, selectedCategory]);
  const productCountLabel = `${filteredProducts.length} ${filteredProducts.length === 1 ? "product" : "products"} shown`;

  return <div className="min-h-screen bg-[#fcfdf9]"><StoreHeader /><main className="container py-12 sm:py-16"><section className="relative overflow-hidden rounded-2xl border border-[#dce6d7] bg-[#eef4e9] px-6 py-12 text-center sm:px-10"><Leaf size={78} strokeWidth={0.8} className="pointer-events-none absolute -right-4 -top-4 text-[#dce5c5]" /><p className="noura-eyebrow">Your everyday edit</p><h1 className="mt-3 text-4xl font-semibold tracking-[-0.055em] text-[#253a28] sm:text-5xl">{selectedCategory || "All products"}</h1><p className="mx-auto mt-4 max-w-xl text-center text-sm leading-6 text-[#667567]">{selectedCategory ? `A focused edit of ${selectedCategory.toLowerCase()} essentials for your next routine.` : "Browse thoughtful skincare, beauty, and care essentials for daily life."}</p><div className="mx-auto mt-8 flex max-w-5xl flex-wrap justify-center gap-2" aria-label="Filter products by category"><Link href="/shop" aria-current={!selectedCategory ? "page" : undefined} className={`rounded-lg border px-4 py-2 text-xs font-bold transition ${!selectedCategory ? "border-[#253a28] bg-[#253a28] text-white" : "border-[#dce6d7] bg-white text-[#59705a] hover:border-[#6d9867]"}`}>All</Link>{categories.map(category => <Link key={category} href={shopHref(category)} aria-current={selectedCategory === category ? "page" : undefined} className={`rounded-lg border px-4 py-2 text-xs font-bold transition ${selectedCategory === category ? "border-[#253a28] bg-[#253a28] text-white" : "border-[#dce6d7] bg-white text-[#59705a] hover:border-[#6d9867]"}`}>{category}</Link>)}</div></section><div className="mt-9 flex items-center justify-between border-y border-[#dce6d7] py-4"><p className="text-sm text-[#667567]">{catalogue.isLoading ? "Curating products…" : productCountLabel}</p>{selectedCategory && <Link href="/shop" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-[#4f744c]">Clear filter <ArrowRight size={14} /></Link>}</div><div className="mt-9">{catalogue.isLoading ? <ProductSkeletonGrid count={8} label="Curating products…" /> : catalogue.error ? <CatalogueError onRetry={() => catalogue.refetch()} /> : <ProductGrid products={filteredProducts} emptyMessage={`We are preparing ${selectedCategory || "this collection"} for you. Explore another ritual while the edit grows.`} />}</div></main><StoreFooter /><CartDrawer /></div>;
}
