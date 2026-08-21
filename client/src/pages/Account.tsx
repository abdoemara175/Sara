import React, { FormEvent, useState } from "react";
import { Link } from "wouter";
import { KeyRound, LogIn, LogOut, ShieldCheck, ShoppingBag, UserRound } from "lucide-react";
import { startLogin } from "@/const";
import { CartDrawer, StoreFooter, StoreHeader } from "@/components/storefront";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

export default function Account() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const utils = trpc.useUtils();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const signIn = trpc.localAuth.signIn.useMutation({ onSuccess: () => utils.auth.me.invalidate() });
  const changePassword = trpc.localAuth.changePassword.useMutation({ onSuccess: () => { setCurrentPassword(""); setNewPassword(""); utils.auth.me.invalidate(); } });

  const submitSignIn = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await signIn.mutateAsync({ email, password });
    } catch {
      // The mutation state already carries a safe, user-visible error message.
    }
  };
  const submitPasswordChange = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await changePassword.mutateAsync({ currentPassword, newPassword });
    } catch {
      // The mutation state already carries a safe, user-visible error message.
    }
  };

  return <div className="min-h-screen bg-[#fcfdf9]"><StoreHeader /><main className="container py-16 sm:py-24"><div className="mx-auto max-w-2xl rounded-2xl border border-[#dce6d7] bg-white p-7 shadow-[0_16px_38px_rgb(49_76_50_/_8%)] sm:p-10"><p className="noura-eyebrow">Your account</p>{loading ? <div className="mt-5 space-y-3"><div className="h-8 w-2/3 animate-pulse rounded bg-[#edf3e8]" /><div className="h-4 w-full animate-pulse rounded bg-[#edf3e8]" /></div> : !isAuthenticated ? <><h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[#253a28]">Welcome back</h1><p className="mt-4 max-w-lg text-sm leading-7 text-[#667567]">Sign in with your store email and password to access your account. Administrator permissions are verified on the server.</p><form onSubmit={submitSignIn} className="mt-7 grid gap-4"><label className="grid gap-2 text-sm font-bold text-[#405642]">Email<input value={email} onChange={event => setEmail(event.target.value)} type="email" autoComplete="email" required className="rounded-lg border border-[#dce6d7] px-4 py-3 font-normal outline-none focus:border-[#6d9867]" /></label><label className="grid gap-2 text-sm font-bold text-[#405642]">Password<input value={password} onChange={event => setPassword(event.target.value)} type="password" autoComplete="current-password" required className="rounded-lg border border-[#dce6d7] px-4 py-3 font-normal outline-none focus:border-[#6d9867]" /></label>{signIn.error && <p role="alert" className="text-sm text-rose-700">{signIn.error.message}</p>}<button disabled={signIn.isPending} className="noura-button-primary inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-black uppercase tracking-[0.12em] disabled:opacity-50"><LogIn size={15} /> {signIn.isPending ? "Signing in" : "Sign in"}</button></form><div className="mt-6 border-t border-[#edf2e9] pt-5"><button onClick={startLogin} className="text-xs font-bold text-[#667567] hover:text-[#4f744c]">Or continue with your Manus account</button></div></> : <><div className="mt-6 flex items-center gap-4"><div className="grid h-14 w-14 place-items-center rounded-xl bg-[#e7f0e2] text-[#4f744c]"><UserRound size={25} /></div><div><h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#253a28]">{user?.name || "Your profile"}</h1><p className="text-sm text-[#667567]">{user?.email || "Signed in customer"}</p></div></div>{user?.requiresPasswordChange && <section className="mt-8 rounded-xl border border-[#d7e5d0] bg-[#f3f8ef] p-5"><div className="flex gap-3"><KeyRound className="shrink-0 text-[#4f744c]" size={19} /><div><h2 className="text-xl font-semibold text-[#253a28]">Change your temporary password</h2><p className="mt-1 text-sm leading-6 text-[#667567]">Create a password with at least 10 characters, including letters and numbers, before continuing with administrator work.</p></div></div><form onSubmit={submitPasswordChange} className="mt-5 grid gap-3"><input value={currentPassword} onChange={event => setCurrentPassword(event.target.value)} type="password" autoComplete="current-password" placeholder="Current password" required className="rounded-lg border border-[#dce6d7] bg-white px-4 py-3 text-sm outline-none focus:border-[#6d9867]" /><input value={newPassword} onChange={event => setNewPassword(event.target.value)} type="password" autoComplete="new-password" placeholder="New password" required className="rounded-lg border border-[#dce6d7] bg-white px-4 py-3 text-sm outline-none focus:border-[#6d9867]" />{changePassword.error && <p role="alert" className="text-sm text-rose-700">{changePassword.error.message}</p>}<button disabled={changePassword.isPending} className="noura-button-primary justify-self-start px-5 py-3 text-xs font-bold disabled:opacity-50">{changePassword.isPending ? "Updating" : "Update password"}</button></form></section>}<div className="mt-8 grid gap-3 sm:grid-cols-2"><Link href="/shop" className="rounded-xl border border-[#dce6d7] p-5 transition hover:border-[#8daf88] hover:bg-[#f7faf4]"><ShoppingBag className="text-[#4f744c]" size={20} /><p className="mt-4 text-xl font-semibold text-[#253a28]">Continue shopping</p><p className="mt-1 text-xs leading-5 text-[#667567]">Browse current product collections.</p></Link>{user?.role === "admin" && !user?.requiresPasswordChange && <Link href="/admin" className="rounded-xl border border-[#dce6d7] p-5 transition hover:border-[#8daf88] hover:bg-[#f7faf4]"><ShieldCheck className="text-[#4f744c]" size={20} /><p className="mt-4 text-xl font-semibold text-[#253a28]">Administration</p><p className="mt-1 text-xs leading-5 text-[#667567]">Open protected operational controls.</p></Link>}</div><button onClick={() => logout()} className="mt-8 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-[#667567] hover:text-rose-600"><LogOut size={14} /> Sign out</button></>}</div></main><StoreFooter /><CartDrawer /></div>;
}
