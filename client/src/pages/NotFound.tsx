import React from "react";
import { ArrowLeft, Compass, Leaf } from "lucide-react";
import { Link } from "wouter";
import { CartDrawer, StoreFooter, StoreHeader } from "@/components/storefront";

export default function NotFound() {
  return <div className="min-h-screen bg-[#fcfdf9]"><StoreHeader /><main className="container flex min-h-[58vh] items-center justify-center py-16 sm:py-24"><section className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-[#dce6d7] bg-white p-8 text-center shadow-[0_16px_38px_rgb(49_76_50_/_7%)] sm:p-12"><Leaf size={96} strokeWidth={0.7} className="pointer-events-none absolute -right-5 -top-5 text-[#edf3e8]" /><div className="relative"><div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#eef4e9] text-[#4f744c]"><Compass size={28} /></div><p className="mt-7 text-[10px] font-black uppercase tracking-[0.2em] text-[#4f744c]">404 · Lost in the edit</p><h1 className="noura-display mt-3 text-5xl font-bold text-[#253a28] sm:text-6xl">This page is not part of the ritual.</h1><p className="mx-auto mt-5 max-w-md text-sm leading-7 text-[#667567]">The link may have changed, or this beauty edit is no longer available. Return to the collection and continue browsing.</p><Link href="/" className="noura-button-primary mt-8 inline-flex items-center gap-2 px-5 py-3 text-xs font-black uppercase tracking-[0.12em]"><ArrowLeft size={14} /> Return home</Link></div></section></main><StoreFooter /><CartDrawer /></div>;
}
