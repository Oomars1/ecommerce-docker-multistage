import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ApiError } from "@/lib/api";
import { getProduct } from "@/lib/products";
import { formatPrice, productEmoji } from "@/lib/format";
import AddToCartButton from "@/components/AddToCartButton";

async function Detail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let product;
  try {
    product = await getProduct(id);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }

  return (
    <div className="mt-4 grid gap-8 md:grid-cols-2">
      <div className="flex aspect-square items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-100 text-8xl">
        {productEmoji(product.name)}
      </div>
      <div>
        <h1 className="text-3xl font-bold">{product.name}</h1>
        <p className="mt-2 text-2xl font-bold text-indigo-600">{formatPrice(product.price)}</p>
        <p className="mt-4 text-slate-600">{product.description}</p>
        <p className="mt-4 text-sm text-slate-500">
          {product.stock > 0 ? `Stock: ${product.stock}` : "Agotado"}
        </p>
        <AddToCartButton product={product} />
      </div>
    </div>
  );
}

export default function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  return (
    <main className="mx-auto w-full max-w-4xl p-6">
      <Link href="/products" className="text-sm text-slate-500 hover:underline">
        ← Volver al catálogo
      </Link>
      <Suspense fallback={<div className="mt-4 h-96 animate-pulse rounded-2xl bg-slate-200" />}>
        <Detail params={params} />
      </Suspense>
    </main>
  );
}