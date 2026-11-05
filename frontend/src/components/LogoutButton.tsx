"use client";

import { logout } from "@/app/action/auth";
import { useCart } from "./CartProvider";

export default function LogoutButton() {
  const { clear } = useCart();

  return (
    <form action={logout} onSubmit={clear}>
      <button className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
        Salir
      </button>
    </form>
  );
}