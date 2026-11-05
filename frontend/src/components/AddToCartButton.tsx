"use client";

import { useState } from "react";
import { useCart } from "./CartProvider";
import type { Product } from "@/lib/types";

export default function AddToCartButton({ product }: { product: Product }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <button
      disabled={product.stock === 0}
      onClick={() => {
        add(product);
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
      }}
      className="mt-6 w-full rounded-xl bg-indigo-600 px-6 py-3 font-medium text-white transition hover:bg-indigo-700 disabled:bg-slate-300"
    >
      {product.stock === 0 ? "Agotado" : added ? "✓ Agregado" : "Agregar al carrito"}
    </button>
  );
}