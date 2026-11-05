"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useCart } from "./CartProvider";
import { placeOrder, payOrder } from "@/app/action/orders";
import { formatPrice, productEmoji } from "@/lib/format";
import { METHODS } from "@/lib/payment-methods";

export default function CheckoutForm() {
  const { items, total, ready } = useCart();
  const [method, setMethod] = useState(METHODS[0].id);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    setError(null);
    startTransition(async () => {
      let id = orderId;

      // 1) Crear la orden (solo si no existe ya una pendiente de este intento)
      if (id === null) {
        const created = await placeOrder(
          items.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
        );
        if (!created.ok) {
          setError(created.error);
          return;
        }
        id = created.orderId;
        setOrderId(id);
      }

      // 2) Pagar. Si sale bien, la acción redirige a la confirmación.
      const paid = await payOrder(id, method);
      if (paid && !paid.ok) setError(paid.error);
    });
  }

  if (!ready) return <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />;

  if (items.length === 0 && orderId === null) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
        <p className="font-medium">No hay productos para pagar</p>
        <Link href="/products" className="mt-3 inline-block text-indigo-600 hover:underline">
          Ir al catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
        <h2 className="font-semibold">Método de pago</h2>
        <p className="mb-4 text-xs text-slate-500">Modo de prueba: tokens de Stripe, no se cobra dinero real.</p>

        <div className="space-y-2">
          {METHODS.map((m) => (
            <label
              key={m.id}
              className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition ${
                method === m.id ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:bg-slate-50"
              }`}
            >
              <span className="flex items-center gap-3">
                <input
                  type="radio"
                  name="method"
                  value={m.id}
                  checked={method === m.id}
                  onChange={() => setMethod(m.id)}
                  disabled={pending}
                />
                <span className="text-sm font-medium">💳 {m.label}</span>
              </span>
              <span className="text-xs text-slate-500">{m.hint}</span>
            </label>
          ))}
        </div>

        {orderId !== null && (
          <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
            Tu orden #{orderId} quedó creada y pendiente de pago. Elige otro método y vuelve a intentar: no se
            creará otra orden.
          </p>
        )}
        {error && (
          <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}
      </section>

      <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-3 font-semibold">Tu pedido</h2>
        <ul className="space-y-2 text-sm">
          {items.map(({ product, quantity }) => (
            <li key={product.id} className="flex justify-between gap-2">
              <span>
                {productEmoji(product.name)} {product.name} × {quantity}
              </span>
              <span>{formatPrice(Number(product.price) * quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="my-4 flex justify-between border-t pt-4 text-lg">
          <span>Total</span>
          <span className="font-bold text-indigo-600">{formatPrice(total)}</span>
        </div>
        <button
          onClick={submit}
          disabled={pending}
          className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
        >
          {pending ? "Procesando pago..." : orderId ? "Reintentar pago" : `Pagar ${formatPrice(total)}`}
        </button>
        <p className="mt-3 text-xs text-slate-500">El total final lo calcula el servidor.</p>
      </aside>
    </div>
  );
}