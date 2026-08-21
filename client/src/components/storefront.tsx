import { Link, useLocation } from "wouter";
import React, { useEffect, useState } from "react";
import {
  Banknote, ChevronDown, Heart, Menu, Minus, Plus, Search, ShieldCheck, ShoppingBag,
  Sparkles, Trash2, Truck, X,
} from "lucide-react";
import type { Money, Product } from "@shared/commerce/types";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

export const HERO_IMAGE = "/manus-storage/beauty-hero-reference_546efc38.png";

export const categories = [
  "Make Up", "Skin Care", "Hair Care", "Body Care", "Baby Care", "Instruments & Devices",
  "Nails & Oral Care", "Female Intimate", "Shaving Tools", "Hair Colors", "Other",
] as const;

export function formatEgp(money: Money | null | undefined) {
  if (!money) return "EGP —";
  return `EGP ${Number(money.amount).toLocaleString("en-EG", { maximumFractionDigits: 0 })}`;
}

export function shopHref(category?: string) {
  return category ? `/shop?category=${encodeURIComponent(category)}` : "/shop";
}

function productImage(product: Product) {
  return product.images[0]?.url || HERO_IMAGE;
}

export function StoreHeader() {
  const [megaOpen, setMegaOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [location] = useLocation();
  const { itemCount, openCart } = useCart();
  const { user } = useAuth();
  const { data: searchData, isFetching } = trpc.search.products.useQuery(
    { query: debounced, first: 5 },
    { enabled: debounced.trim().length > 1 }
  );
  const showSearchResults = query.trim().length > 1;

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(query.trim()), 280);
    return () => window.clearTimeout(timer);
  }, [query]);

  return (
    <header className="sticky top-0 z-40 border-b border-[#dce6d7] bg-[#fcfdf9]/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-4 lg:h-20">
        <button className="grid h-10 w-10 place-items-center rounded-lg transition hover:bg-[#edf3e8] lg:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} aria-controls="mobile-store-navigation">
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
        <Link href="/" className="shrink-0 text-2xl font-black tracking-[-0.09em] text-[#253a28] sm:text-3xl" aria-label="NOURA home">
          NOURA<span className="text-[#6d9867]">.</span>
        </Link>
        <nav className="hidden items-center gap-6 text-[11px] font-bold uppercase tracking-[0.14em] text-[#5f725f] lg:flex">
          <Link href="/" className={location === "/" ? "text-[#4f744c]" : "hover:text-[#4f744c]"}>Home</Link>
          <Link href="/shop" className={location.startsWith("/shop") ? "text-[#4f744c]" : "hover:text-[#4f744c]"}>Shop</Link>
          <button className="flex items-center gap-1" onClick={() => setMegaOpen(!megaOpen)} aria-expanded={megaOpen}>
            Categories <ChevronDown size={13} />
          </button>
          <a href="/#featured">Featured</a>
          <a href="/#about">About</a>
          <Link href="/account" className={location.startsWith("/account") ? "text-[#4f744c]" : "hover:text-[#4f744c]"}>Account</Link>
          {user?.role === "admin" && !user?.requiresPasswordChange && <Link href="/admin" className="text-[#4f744c]">Admin</Link>}
        </nav>
        <div className="relative hidden min-w-0 max-w-md flex-1 lg:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#4f744c]" size={17} />
          <input
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Ask for a product in Arabic or English..."
            aria-label="Search products"
            className="h-10 w-full rounded-lg border border-[#dce6d7] bg-white pl-10 pr-4 text-sm text-[#253a28] outline-none transition focus:border-[#6d9867]"
          />
          {showSearchResults && (
            <div className="absolute left-0 right-0 top-12 overflow-hidden rounded-xl border border-[#dce6d7] bg-white p-2 shadow-xl">
              <div className="flex items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#4f744c]">
                <Sparkles size={13} /> {isFetching ? "Finding your match" : "AI product matches"}
              </div>
              {searchData?.products.length ? searchData.products.map(product => (
                <Link key={product.id} href={`/product/${product.handle}`} onClick={() => setQuery("")} className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-stone-50">
                  <img src={productImage(product)} alt="" className="h-10 w-10 rounded-lg object-cover" />
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-stone-800">{product.title}</span>
                  <span className="text-xs text-stone-500">{formatEgp(product.priceRange.min)}</span>
                </Link>
              )) : !isFetching && <p className="px-3 py-4 text-sm text-stone-500">Try a different beauty concern or product type.</p>}
            </div>
          )}
        </div>
        <button onClick={openCart} className="relative grid h-10 w-10 place-items-center rounded-lg transition hover:bg-[#edf3e8]" aria-label="Open cart">
          <ShoppingBag size={19} />
          <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#4f744c] px-1 text-[9px] font-black text-white">{itemCount}</span>
        </button>
      </div>
      <div className="hidden border-t border-[#edf2e9] lg:block">
        <div className="container flex h-10 items-center justify-center gap-6 overflow-hidden text-[10px] font-semibold uppercase tracking-[0.09em] text-[#617562]">
          {categories.map(category => <Link key={category} href={shopHref(category)} className="whitespace-nowrap transition hover:text-[#4f744c]">{category}</Link>)}
        </div>
      </div>
      {megaOpen && (
        <div className="absolute inset-x-0 top-full border-b border-[#dce6d7] bg-white shadow-xl">
          <div className="container grid grid-cols-2 gap-x-10 gap-y-1 py-7 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((category, index) => <Link key={category} href={shopHref(category)} onClick={() => setMegaOpen(false)} className="group flex items-center justify-between border-b border-[#edf2e9] py-2 text-sm text-[#475a48] hover:text-[#4f744c]">
              {category}<span className="text-xs text-[#b2c7ad]">0{index + 1}</span>
            </Link>)}
          </div>
        </div>
      )}
      {menuOpen && (
        <div id="mobile-store-navigation" className="border-t border-stone-200 bg-white px-5 py-5 shadow-lg lg:hidden">
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b2794f]" size={17} />
            <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search beauty products" aria-label="Search products on mobile" className="h-10 w-full rounded-full border border-stone-200 pl-10 pr-4 text-sm" />
          </div>
          {showSearchResults && (
            <div className="mb-5 overflow-hidden rounded-2xl border border-stone-200 bg-stone-50 p-2">
              <div className="flex items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#a76c45]">
                <Sparkles size={13} /> {isFetching ? "Finding your match" : "AI product matches"}
              </div>
              {searchData?.products.length ? searchData.products.map(product => (
                <Link key={product.id} href={`/product/${product.handle}`} onClick={() => { setQuery(""); setMenuOpen(false); }} className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-white">
                  <img src={productImage(product)} alt="" className="h-10 w-10 rounded-lg object-cover" />
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-stone-800">{product.title}</span>
                  <span className="text-xs text-stone-500">{formatEgp(product.priceRange.min)}</span>
                </Link>
              )) : !isFetching && <p className="px-3 py-4 text-sm text-stone-500">Try a different beauty concern or product type.</p>}
            </div>
          )}
          <div className="mb-5 grid grid-cols-3 gap-2 border-b border-stone-100 pb-5 text-xs font-bold uppercase tracking-[0.1em] text-stone-700"><Link href="/" onClick={() => setMenuOpen(false)} className="rounded-xl bg-stone-50 px-3 py-3 text-center">Home</Link><Link href="/shop" onClick={() => setMenuOpen(false)} className="rounded-xl bg-stone-50 px-3 py-3 text-center">Shop</Link><Link href="/account" onClick={() => setMenuOpen(false)} className="rounded-xl bg-stone-50 px-3 py-3 text-center">Account</Link></div>
          <p className="mb-3 text-[10px] font-black uppercase tracking-[0.16em] text-[#a76c45]">Shop by category</p>
          <div className="grid grid-cols-2 gap-2 text-sm text-stone-700">{categories.map(category => <Link key={category} href={shopHref(category)} onClick={() => setMenuOpen(false)} className="rounded-xl bg-stone-50 px-3 py-2.5 transition hover:bg-[#f2eee7]">{category}</Link>)}</div>
        </div>
      )}
    </header>
  );
}

export function CartDrawer() {
  const { cart, closeCart, isOpen, loading, proceedToCheckout, removeItem, updateQuantity } = useCart();
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-stone-950/30" role="dialog" aria-modal="true" aria-label="Shopping cart">
      <button className="absolute inset-0 cursor-default" onClick={closeCart} aria-label="Close cart" />
      <aside className="relative flex h-full w-full max-w-md flex-col bg-[#fcfdf9] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#dce6d7] px-6 py-5">
          <div><p className="noura-eyebrow">Your selection</p><h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-[#253a28]">Shopping bag</h2></div>
          <button onClick={closeCart} aria-label="Close cart panel" className="grid h-9 w-9 place-items-center rounded-lg hover:bg-[#edf3e8]"><X size={19} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {!cart?.items.length ? <div className="grid h-full place-items-center text-center"><div><ShoppingBag size={38} strokeWidth={1.2} className="mx-auto mb-3 text-[#b4cbb0]" /><p className="text-xl font-semibold text-[#253a28]">Your bag is waiting.</p><p className="mx-auto mt-1 max-w-xs text-sm leading-6 text-[#667567]">Explore everyday routines, then return here whenever you are ready.</p><Link href="/shop" onClick={closeCart} className="mt-6 inline-flex rounded-lg bg-[#253a28] px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#4f744c]">Browse the edit</Link></div></div> : cart.items.map(item => (
            <article className="flex gap-3 border-b border-[#edf2e9] py-4" key={item.lineId}>
              <img src={item.image?.url || HERO_IMAGE} alt="" className="h-20 w-20 rounded-lg object-cover" />
              <div className="min-w-0 flex-1"><p className="font-semibold text-[#253a28]">{item.productTitle}</p>{item.variantTitle !== "Default Title" && <p className="mt-0.5 text-xs text-[#667567]">{item.variantTitle}</p>}<p className="mt-1 text-sm font-bold text-[#4f744c]">{formatEgp(item.lineTotal)}</p>
                <div className="mt-3 flex items-center justify-between"><div className="flex items-center rounded-lg border border-[#dce6d7]"><button disabled={loading} onClick={() => updateQuantity(item.lineId, item.quantity - 1)} aria-label={`Decrease ${item.productTitle} quantity`} className="grid h-7 w-7 place-items-center"><Minus size={13} /></button><span className="w-6 text-center text-xs font-bold" aria-live="polite">{item.quantity}</span><button disabled={loading} onClick={() => updateQuantity(item.lineId, item.quantity + 1)} aria-label={`Increase ${item.productTitle} quantity`} className="grid h-7 w-7 place-items-center"><Plus size={13} /></button></div><button disabled={loading} onClick={() => removeItem(item.lineId)} aria-label={`Remove ${item.productTitle}`} className="p-2 text-[#97aa96] hover:text-rose-600"><Trash2 size={15} /></button></div>
              </div>
            </article>
          ))}
        </div>
        <div className="border-t border-[#dce6d7] px-6 py-5"><div className="mb-4 flex items-center justify-between text-sm"><span className="text-[#667567]">Subtotal</span><span className="text-xl font-semibold text-[#253a28]">{formatEgp(cart?.subtotal)}</span></div><button disabled={!cart?.itemCount || loading} onClick={proceedToCheckout} className="noura-button-primary w-full py-3.5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40">Secure checkout</button><p className="mt-3 text-center text-[11px] leading-5 text-[#667567]">You will review delivery and payment choices securely in checkout.</p></div>
      </aside>
    </div>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const [quickOpen, setQuickOpen] = useState(false);
  const { addItem, loading } = useCart();
  const variant = product.variants[0];
  const compare = variant?.compareAtPrice;
  return (
    <article className="group relative min-w-0">
      <div className="relative overflow-hidden rounded-xl border border-[#dce6d7] bg-[#edf3e8]">
        {compare && <span className="absolute left-3 top-3 z-10 rounded-md bg-[#4f744c] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-white">Sale</span>}
        <Link href={`/product/${product.handle}`}><img src={productImage(product)} alt={product.title} className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105" /></Link>
        <button onClick={() => setQuickOpen(true)} className="absolute bottom-3 left-1/2 hidden -translate-x-1/2 rounded-full bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-stone-800 opacity-0 shadow-md transition group-hover:opacity-100 focus-visible:opacity-100 md:block">Quick view</button>
      </div>
      <div className="px-1 pt-3"><p className="mb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#4f744c]">{product.productType || "Beauty"}</p><Link href={`/product/${product.handle}`} className="block min-h-11 text-lg font-semibold leading-5 tracking-[-0.03em] text-[#253a28] hover:text-[#4f744c]">{product.title}</Link><div className="mt-2 flex items-center gap-2"><span className="text-sm font-black text-[#253a28]">{formatEgp(variant?.price || product.priceRange.min)}</span>{compare && <span className="text-xs text-[#97aa96] line-through">{formatEgp(compare)}</span>}</div>
        <button disabled={!variant?.availableForSale || loading} onClick={() => variant && addItem(variant.id)} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-[#aec9a9] bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.13em] text-[#253a28] transition hover:bg-[#253a28] hover:text-white disabled:opacity-40"><Plus size={13} /> Add to Cart</button>
      </div>
      {quickOpen && <div className="fixed inset-0 z-50 grid place-items-center bg-stone-950/40 p-4"><button className="absolute inset-0" onClick={() => setQuickOpen(false)} aria-label="Close quick view" /><div className="relative grid w-full max-w-2xl overflow-hidden rounded-[1.5rem] bg-white shadow-2xl sm:grid-cols-2"><button className="absolute right-4 top-4 z-10 grid h-8 w-8 place-items-center rounded-full bg-white shadow" onClick={() => setQuickOpen(false)}><X size={15} /></button><img src={productImage(product)} alt={product.title} className="h-full min-h-64 w-full object-cover" /><div className="p-7"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#a76c45]">{product.productType}</p><h3 className="mt-2 font-serif text-3xl font-black leading-none">{product.title}</h3><p className="mt-4 text-sm leading-6 text-stone-600">{product.description || "A considered beauty essential for your everyday ritual."}</p><p className="mt-5 text-lg font-black">{formatEgp(variant?.price || product.priceRange.min)}</p><button onClick={() => variant && addItem(variant.id)} disabled={!variant || loading} className="mt-5 rounded-full bg-stone-900 px-5 py-3 text-xs font-bold text-white">Add to Cart</button></div></div></div>}
    </article>
  );
}

export function ProductGrid({ products, emptyMessage }: { products: Product[]; emptyMessage?: string }) {
  if (!products.length) return <div className="rounded-3xl border border-dashed border-stone-300 bg-stone-50 px-6 py-14 text-center text-stone-500">{emptyMessage || "The collection is being prepared."}</div>;
  return <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">{products.map(product => <ProductCard product={product} key={product.id} />)}</div>;
}

export function StoreFooter() {
  return (
    <footer id="about" className="mt-24 bg-[#253a28] text-[#e4eee0]">
      <div className="container grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="text-3xl font-black tracking-[-0.09em] text-white">NOURA<span className="text-[#b9d4b4]">.</span></p>
          <p className="mt-4 max-w-sm text-sm leading-6 text-[#c3d3bf]">Everyday beauty, thoughtfully chosen for calm routines and small moments of care.</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#b9d4b4]">Explore</p>
          <div className="mt-4 grid gap-2 text-sm text-[#c3d3bf]">
            <Link href="/shop">All products</Link>
            <Link href={shopHref("Skin Care")}>Skin care</Link>
            <Link href={shopHref("Make Up")}>Make up</Link>
            <a href="/#featured">Featured picks</a>
          </div>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#b9d4b4]">Official contact channels</p>
          <p className="mt-4 max-w-xs text-sm leading-6 text-[#c3d3bf]">Social, WhatsApp, and location links will appear here after the store owner confirms the official NOURA destinations.</p>
        </div>
      </div>
      <div className="border-t border-white/10"><div className="container flex flex-col gap-2 py-5 text-[10px] uppercase tracking-[0.12em] text-[#91a990] sm:flex-row sm:justify-between"><span>© 2026 Noura Beauty Store</span><span>Egypt · Everyday skincare rituals</span></div></div>
    </footer>
  );
}

export function TrustBar() {
  const entries = [[ShieldCheck, "100% Original Products"], [Truck, "Fast Shipping across Egypt"], [Banknote, "Cash on Delivery"]] as const;
  return <section className="border-y border-[#dce6d7] bg-white"><div className="container grid grid-cols-1 divide-y divide-[#edf2e9] sm:grid-cols-3 sm:divide-x sm:divide-y-0">{entries.map(([Icon, label]) => <div key={label} className="flex items-center justify-center gap-3 px-5 py-4 text-center text-xs font-black uppercase tracking-[0.1em] text-[#405642]"><Icon size={18} className="text-[#4f744c]" />{label}</div>)}</div></section>;
}
