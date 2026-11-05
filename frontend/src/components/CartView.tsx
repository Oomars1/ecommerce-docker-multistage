"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";
import { formatPrice, productEmoji } from "@/lib/format";

export default function CartView() {
  const { items, total, ready, setQty, remove, clear } = useCart();

  if (!ready) return <div className="h-40 animate-pulse rounded-2xl bg-slate-200" />;

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
        <p className="text-5xl">🛒</p>
        <p className="mt-3 font-medium">Tu carrito está vacío</p>
        <Link href="/products" className="mt-4 inline-block text-indigo-600 hover:underline">
          Ver el catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <ul className="space-y-3 lg:col-span-2">
        {items.map(({ product, quantity }) => (
          <li key={product.id} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-purple-100 text-3xl">
              {productEmoji(product.name)}
            </div>
            <div className="flex-1">
              <p className="font-semibold">{product.name}</p>
              <p className="text-sm text-slate-500">{formatPrice(product.price)} c/u</p>
              <div className="mt-2 flex items-center gap-2">
                <button onClick={() => setQty(product.id, quantity - 1)} className="h-7 w-7 rounded-lg border hover:bg-slate-100" aria-label="Menos">−</button>
                <span className="w-6 text-center text-sm">{quantity}</span>
                <button onClick={() => setQty(product.id, quantity + 1)} disabled={quantity >= product.stock} className="h-7 w-7 rounded-lg border hover:bg-slate-100 disabled:opacity-40" aria-label="Más">+</button>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold">{formatPrice(Number(product.price) * quantity)}</p>
              <button onClick={() => remove(product.id)} className="mt-2 text-sm text-red-600 hover:underline">Quitar</button>
            </div>
          </li>
        ))}
      </ul>

      <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold">Resumen</h2>
        <div className="my-4 flex justify-between text-lg">
          <span>Total</span>
          <span className="font-bold text-indigo-600">{formatPrice(total)}</span>
        </div>
        <Link href="/checkout" className="block rounded-xl bg-indigo-600 px-4 py-2.5 text-center font-medium text-white hover:bg-indigo-700">
          Continuar al pago
        </Link>
        <button onClick={clear} className="mt-3 w-full text-sm text-slate-500 hover:underline">Vaciar carrito</button>
        <p className="mt-3 text-xs text-slate-500">El total final lo calcula el servidor al crear la orden.</p>
      </aside>
    </div>
  );
}