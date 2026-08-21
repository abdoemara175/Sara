import { useMemo } from "react";
import { CartDrawer, ProductGrid, StoreFooter, StoreHeader } from "@/components/storefront";
import { trpc } from "@/lib/trpc";

export default function Shop() {
  const { data: products = [], isLoading } = trpc.commerce.products.list.useQuery();
  const allProducts = useMemo(() => products, [products]);
  return <div className="min-h-screen bg-[#fcfbf8]"><StoreHeader /><main className="container py-12 sm:py-16"><p className="text-center text-[10px] font-black uppercase tracking-[0.22em] text-[#a76c45]">Beauty edit</p><h1 className="mt-3 text-center font-serif text-4xl font-black italic text-stone-900 sm:text-5xl">ALL PRODUCTS</h1><p className="mx-auto mt-4 max-w-xl text-center text-sm leading-6 text-stone-500">Browse the full beauty collection, curated for rituals big and small.</p><div className="mt-11">{isLoading ? <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">{Array.from({ length: 8 }).map((_, index) => <div className="animate-pulse" key={index}><div className="aspect-square rounded-3xl bg-stone-200" /><div className="mt-3 h-4 w-2/3 rounded bg-stone-200" /></div>)}</div> : <ProductGrid products={allProducts} emptyMessage="Products will appear here as they are published to the storefront." />}</div></main><StoreFooter /><CartDrawer /></div>;
}
