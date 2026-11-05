"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CartItem, Product } from "@/lib/types";

type CartCtx = {
  items: CartItem[];
  count: number;
  total: number;
  ready: boolean;
  add: (p: Product, qty?: number) => void;
  setQty: (id: number, qty: number) => void;
  remove: (id: number) => void;
  clear: () => void;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "cart:v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {}
  }, [items, ready]);

  const value = useMemo<CartCtx>(() => ({
    items,
    ready,
    count: items.reduce((n, i) => n + i.quantity, 0),
    total: items.reduce((s, i) => s + Number(i.product.price) * i.quantity, 0),
    add: (product, qty = 1) =>
      setItems((prev) => {
        const found = prev.find((i) => i.product.id === product.id);
        if (!found) return [...prev, { product, quantity: Math.min(qty, product.stock) }];
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, product, quantity: Math.min(i.quantity + qty, product.stock) }
            : i,
        );
      }),
    setQty: (id, qty) =>
      setItems((prev) =>
        prev.map((i) => (i.product.id === id ? { ...i, quantity: Math.max(1, Math.min(qty, i.product.stock)) } : i)),
      ),
    remove: (id) => setItems((prev) => prev.filter((i) => i.product.id !== id)),
    clear: () => setItems([]),
  }), [items, ready]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}