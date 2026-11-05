"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";

export default function CartLink() {
  const { count, ready } = useCart();
  return (
    <Link href="/cart" className="relative rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-100">
      🛒 Carrito
      {ready && count > 0 && (
        <span className="absolute -right-1 -top-1 rounded-full bg-indigo-600 px-1.5 text-xs text-white">{count}</span>
      )}
    </Link>
  );
}