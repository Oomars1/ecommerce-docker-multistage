import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ApiError } from "@/lib/api";
import { getOrders } from "@/lib/orders";
import { formatDate, formatPrice } from "@/lib/format";
import PayPending from "@/components/PayPending";

type Search = { page?: string; status?: string };

const FILTERS = [
  { label: "Todas", value: "" },
  { label: "Pagadas", value: "paid" },
  { label: "Pendientes", value: "pending" },
];

const url = (page: number, status: string) => {
  const p = new URLSearchParams();
  if (status) p.set("status", status);
  if (page > 1) p.set("page", String(page));
  const q = p.toString();
  return q ? `/orders?${q}` : "/orders";
};

async function OrderList({ page, status }: { page: number; status: string }) {
  let result;
  try {
    result = await getOrders(page, status);
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) redirect("/login?next=/orders");
    throw e;
  }
  const { data, current_page, last_page } = result;

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
        <p className="text-5xl">📦</p>
        <p className="mt-3 font-medium">No hay órdenes para mostrar</p>
        <Link href="/products" className="mt-3 inline-block text-indigo-600 hover:underline">
          Ir al catálogo
        </Link>
      </div>
    );
  }

  return (
    <>
      <ul className="space-y-4">
        {data.map((order) => {
          const paid = order.status === "paid";
          return (
            <li key={order.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">Orden #{order.id}</p>
                  <p className="text-xs text-slate-500">{formatDate(order.created_at)}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    paid ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {paid ? "Pagada" : "Pendiente"}
                </span>
              </div>

              <ul className="my-4 divide-y text-sm">
                {order.items?.map((item) => (
                  <li key={item.id} className="flex justify-between py-1.5">
                    <span>
                      {item.quantity} × {item.product?.name ?? `Producto #${item.product_id}`}
                    </span>
                    <span>{formatPrice(Number(item.unit_price) * item.quantity)}</span>
                  </li>
                ))}
              </ul>

              <div className="flex justify-between border-t pt-3">
                <span className="text-slate-500">Total</span>
                <span className="font-bold text-indigo-600">{formatPrice(order.total)}</span>
              </div>

              {!paid && <PayPending orderId={order.id} />}
            </li>
          );
        })}
      </ul>

      {last_page > 1 && (
        <nav className="mt-6 flex items-center justify-center gap-4">
          {current_page > 1 && (
            <Link href={url(current_page - 1, status)} className="text-indigo-600 hover:underline">
              ← Anterior
            </Link>
          )}
          <span className="text-sm text-slate-500">
            Página {current_page} de {last_page}
          </span>
          {current_page < last_page && (
            <Link href={url(current_page + 1, status)} className="text-indigo-600 hover:underline">
              Siguiente →
            </Link>
          )}
        </nav>
      )}
    </>
  );
}

async function Orders({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const status = ["paid", "pending"].includes(sp.status ?? "") ? (sp.status as string) : "";

  return (
    <>
      <div className="mb-6 flex gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={url(1, f.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              status === f.value ? "bg-indigo-600 text-white" : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>
      <OrderList page={page} status={status} />
    </>
  );
}

function OrdersSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-44 animate-pulse rounded-2xl bg-slate-200" />
      ))}
    </div>
  );
}

export default function OrdersPage({ searchParams }: { searchParams: Promise<Search> }) {
  return (
    <main className="mx-auto w-full max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Mis órdenes</h1>
      <Suspense fallback={<OrdersSkeleton />}>
        <Orders searchParams={searchParams} />
      </Suspense>
    </main>
  );
}