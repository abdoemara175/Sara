import { ArrowRight } from "lucide-react";
import React, { useMemo } from "react";
import { Link, useLocation } from "wouter";
import { CartDrawer, categories, ProductGrid, shopHref, StoreFooter, StoreHeader } from "@/components/storefront";
import { trpc } from "@/lib/trpc";
import type { Product } from "@shared/commerce/types";

export function categoryFromSearch(search: string) {
  const category = new URLSearchParams(search).get("category");
  return categories.find(item => item === category) || null;
}

export function filterProductsByCategory(products: Product[], category: string | null) {
  return category ? products.filter(product => product.productType === category || product.tags.includes(category)) : products;
}

export default function Shop() {
  const [location] = useLocation();
  const { data: products = [], isLoading } = trpc.commerce.products.list.useQuery();
  const selectedCategory = useMemo(() => categoryFromSearch(typeof window === "undefined" ? "" : window.location.search), [location]);
  const filteredProducts = useMemo(() => filterProductsByCategory(products, selectedCategory), [products, selectedCategory]);
  const productCountLabel = `${filteredProducts.length} ${filteredProducts.length === 1 ? "product" : "products"} shown`;

  return (
    <div className="min-h-screen bg-[#fcfdf9]">
      <StoreHeader />
      <main className="container py-12 sm:py-16">
        <section className="rounded-2xl border border-[#dce6d7] bg-[#eef4e9] px-6 py-12 text-center sm:px-10">
        <p className="noura-eyebrow">Your everyday edit</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.055em] text-[#253a28] sm:text-5xl">{selectedCategory || "All products"}</h1>
        <p className="mx-auto mt-4 max-w-xl text-center text-sm leading-6 text-[#667567]">
          {selectedCategory ? `A focused edit of ${selectedCategory.toLowerCase()} essentials for your next routine.` : "Browse thoughtful skincare, beauty, and care essentials for daily life."}
        </p>
        <div className="mx-auto mt-8 flex max-w-5xl flex-wrap justify-center gap-2" aria-label="Filter products by category">
          <Link href="/shop" aria-current={!selectedCategory ? "page" : undefined} className={`rounded-lg border px-4 py-2 text-xs font-bold transition ${!selectedCategory ? "border-[#253a28] bg-[#253a28] text-white" : "border-[#dce6d7] bg-white text-[#59705a] hover:border-[#6d9867]"}`}>All</Link>
          {categories.map(category => <Link key={category} href={shopHref(category)} aria-current={selectedCategory === category ? "page" : undefined} className={`rounded-lg border px-4 py-2 text-xs font-bold transition ${selectedCategory === category ? "border-[#253a28] bg-[#253a28] text-white" : "border-[#dce6d7] bg-white text-[#59705a] hover:border-[#6d9867]"}`}>{category}</Link>)}
        </div>
        </section>
        <div className="mt-9 flex items-center justify-between border-y border-[#dce6d7] py-4">
          <p className="text-sm text-[#667567]">{isLoading ? "Curating products…" : productCountLabel}</p>
          {selectedCategory && <Link href="/shop" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-[#4f744c]">Clear filter <ArrowRight size={14} /></Link>}
        </div>
        <div className="mt-9">
          {isLoading ? <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">{Array.from({ length: 8 }).map((_, index) => <div className="animate-pulse" key={index}><div className="aspect-square rounded-xl bg-[#edf3e8]" /><div className="mt-3 h-4 w-2/3 rounded bg-[#edf3e8]" /></div>)}</div> : <ProductGrid products={filteredProducts} emptyMessage={`We are preparing ${selectedCategory || "this collection"} for you. Explore another ritual while the edit grows.`} />}
        </div>
      </main>
      <StoreFooter />
      <CartDrawer />
    </div>
  );
}
