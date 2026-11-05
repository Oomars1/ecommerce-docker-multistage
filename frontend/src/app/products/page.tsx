import { Suspense } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getProducts } from "@/lib/products";

async function ProductList({ page }: { page: number }) {
  const { data, current_page, last_page } = await getProducts(page);

  return (
    <>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {data.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      {last_page > 1 && (
        <nav className="mt-6 flex items-center justify-center gap-4">
          {current_page > 1 && (
            <Link href={`/products?page=${current_page - 1}`} className="text-indigo-600 hover:underline">
              ← Anterior
            </Link>
          )}
          <span className="text-sm text-slate-500">
            Página {current_page} de {last_page}
          </span>
          {current_page < last_page && (
            <Link href={`/products?page=${current_page + 1}`} className="text-indigo-600 hover:underline">
              Siguiente →
            </Link>
          )}
        </nav>
      )}
    </>
  );
}

function ProductListSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-64 animate-pulse rounded-2xl bg-slate-200" />
      ))}
    </div>
  );
}

async function Catalog({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page } = await searchParams;
  const current = Math.max(1, Number(page) || 1);
  return <ProductList page={current} />;
}

export default function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  return (
    <main className="mx-auto w-full max-w-6xl p-6">
      <section className="mb-8 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white">
        <h1 className="text-3xl font-bold">Catálogo</h1>
        <p className="mt-1 text-indigo-100">Encuentra lo que necesitas con compra segura.</p>
      </section>
      <Suspense fallback={<ProductListSkeleton />}>
        <Catalog searchParams={searchParams} />
      </Suspense>
    </main>
  );
}