import Link from "next/link";
import { formatPrice, productEmoji } from "@/lib/format";
import type { Product } from "@/lib/types";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="flex aspect-square items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100">
        <span className="text-6xl transition group-hover:scale-110">{productEmoji(product.name)}</span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold">{product.name}</h3>
        <p className="line-clamp-2 text-sm text-slate-500">{product.description}</p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-lg font-bold text-indigo-600">{formatPrice(product.price)}</span>
          <span className={`rounded-full px-2 py-0.5 text-xs ${product.stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {product.stock > 0 ? `${product.stock} disp.` : "Agotado"}
          </span>
        </div>
      </div>
    </Link>
  );
}