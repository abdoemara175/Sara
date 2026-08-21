import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, useRoute } from "wouter";
import { lazy, Suspense } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

const Home = lazy(() => import("./pages/Home"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Shop = lazy(() => import("./pages/Shop"));
const Account = lazy(() => import("./pages/Account"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));

function RouteLoadingState() {
  return (
    <main className="min-h-screen bg-[#fcfbf8] px-6 py-16 text-[#211d1a]">
      <div className="mx-auto max-w-xl rounded-[2rem] border border-[#e4ddd4] bg-white px-8 py-12 text-center shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a76c45]">NOURA</p>
        <p className="mt-3 font-serif text-2xl">Preparing your beauty edit…</p>
      </div>
    </main>
  );
}

function ProductRoute() {
  const [, params] = useRoute("/product/:handle");
  return <ProductDetail handle={params?.handle ?? ""} />;
}

function Router() {
  return <Suspense fallback={<RouteLoadingState />}><Switch><Route path="/" component={Home} /><Route path="/shop" component={Shop} /><Route path="/account" component={Account} /><Route path="/admin" component={AdminDashboard} /><Route path="/product/:handle" component={ProductRoute} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch></Suspense>;
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
