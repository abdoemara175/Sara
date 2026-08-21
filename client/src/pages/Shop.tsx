import { ArrowRight } from "lucide-react";
import { useMemo } from "react";
import { Link, useLocation } from "wouter";
import { CartDrawer, categories, ProductGrid, shopHref, StoreFooter, StoreHeader } from "@/components/storefront";
import { trpc } from "@/lib/trpc";

export function categoryFromSearch(search: string) {
  const category = new URLSearchParams(search).get("category");
  return categories.find(item => item === category) || null;
}

export default function Shop() {
  const [location] = useLocation();
  const { data: products = [], isLoading } = trpc.commerce.products.list.useQuery();
  const selectedCategory = useMemo(() => categoryFromSearch(typeof window === "undefined" ? "" : window.location.search), [location]);
  const filteredProducts = useMemo(() => selectedCategory ? products.filter(product => product.productType === selectedCategory || product.tags.includes(selectedCategory)) : products, [products, selectedCategory]);
  const productCountLabel = `${filteredProducts.length} ${filteredProducts.length === 1 ? "product" : "products"} shown`;

  return (
    <div className="min-h-screen bg-[#fcfbf8]">
      <StoreHeader />
      <main className="container py-12 sm:py-16">
        <p className="text-center text-[10px] font-black uppercase tracking-[0.22em] text-[#a76c45]">Beauty edit</p>
        <h1 className="mt-3 text-center font-serif text-4xl font-black italic text-stone-900 sm:text-5xl">{selectedCategory || "All products"}</h1>
        <p className="mx-auto mt-4 max-w-xl text-center text-sm leading-6 text-stone-500">
          {selectedCategory ? `A focused edit of ${selectedCategory.toLowerCase()} essentials for your next ritual.` : "Browse the full beauty collection, curated for rituals big and small."}
        </p>
        <div className="mx-auto mt-8 flex max-w-5xl flex-wrap justify-center gap-2" aria-label="Filter products by category">
          <Link href="/shop" aria-current={!selectedCategory ? "page" : undefined} className={`rounded-full border px-4 py-2 text-xs font-bold transition ${!selectedCategory ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 bg-white text-stone-600 hover:border-[#a76c45]"}`}>All</Link>
          {categories.map(category => <Link key={category} href={shopHref(category)} aria-current={selectedCategory === category ? "page" : undefined} className={`rounded-full border px-4 py-2 text-xs font-bold transition ${selectedCategory === category ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 bg-white text-stone-600 hover:border-[#a76c45]"}`}>{category}</Link>)}
        </div>
        <div className="mt-9 flex items-center justify-between border-y border-stone-200 py-4">
          <p className="text-sm text-stone-500">{isLoading ? "Curating products…" : productCountLabel}</p>
          {selectedCategory && <Link href="/shop" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-[#a76c45]">Clear filter <ArrowRight size={14} /></Link>}
        </div>
        <div className="mt-9">
          {isLoading ? <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">{Array.from({ length: 8 }).map((_, index) => <div className="animate-pulse" key={index}><div className="aspect-square rounded-3xl bg-stone-200" /><div className="mt-3 h-4 w-2/3 rounded bg-stone-200" /></div>)}</div> : <ProductGrid products={filteredProducts} emptyMessage={`We are preparing ${selectedCategory || "this collection"} for you. Explore another ritual while the edit grows.`} />}
        </div>
      </main>
      <StoreFooter />
      <CartDrawer />
    </div>
  );
}
