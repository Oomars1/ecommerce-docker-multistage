import { Suspense } from "react";
import Link from "next/link";
import { getUser } from "@/lib/session";
import LogoutButton from "./LogoutButton";
import CartLink from "./CartLink";
import DraftCleaner from "./DraftCleaner";

async function AuthMenu() {
  const user = await getUser();

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/login" className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-100">Entrar</Link>
        <Link href="/register" className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700">Registrarse</Link>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <DraftCleaner />
      <Link href="/orders" className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-100">Mis órdenes</Link>
      <span className="hidden text-sm text-slate-500 sm:inline">Hola, {user.name.split(" ")[0]}</span>
      <LogoutButton />
    </div>
  );
}

export default function Navbar() {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between p-4">
        <Link href="/products" className="text-lg font-bold text-indigo-600">🛍️ Mi Tienda</Link>
        <div className="flex items-center gap-2">
          <CartLink />
          <Suspense fallback={<div className="h-9 w-28" />}>
            <AuthMenu />
          </Suspense>
        </div>
      </nav>
    </header>
  );
}