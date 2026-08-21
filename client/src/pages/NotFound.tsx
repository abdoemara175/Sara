import React from "react";
import { ArrowLeft, Compass } from "lucide-react";
import { Link } from "wouter";
import { CartDrawer, StoreFooter, StoreHeader } from "@/components/storefront";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#fcfbf8]">
      <StoreHeader />
      <main className="container flex min-h-[58vh] items-center justify-center py-16 sm:py-24">
        <section className="w-full max-w-2xl rounded-[2rem] border border-stone-200 bg-white p-8 text-center shadow-sm sm:p-12">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#f2eee7] text-[#a76c45]"><Compass size={30} /></div>
          <p className="mt-7 text-[10px] font-black uppercase tracking-[0.2em] text-[#a76c45]">404 · Lost in the edit</p>
          <h1 className="mt-3 font-serif text-4xl font-black italic text-stone-900 sm:text-5xl">This page is not part of the ritual.</h1>
          <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-stone-600">The link may have changed, or the beauty edit is no longer available. Return to the collection and continue browsing.</p>
          <Link href="/" className="mt-8 inline-flex items-center gap-2 rounded-full bg-stone-900 px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#a76c45]"><ArrowLeft size={14} /> Return home</Link>
        </section>
      </main>
      <StoreFooter />
      <CartDrawer />
    </div>
  );
}
