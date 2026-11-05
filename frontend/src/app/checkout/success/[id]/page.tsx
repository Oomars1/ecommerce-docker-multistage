import { Suspense } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ApiError } from "@/lib/api";
import { getOrder } from "@/lib/orders";
import { formatPrice, productEmoji } from "@/lib/format";
import ClearCart from "@/components/ClearCart";

// a) la firma de Confirmation
async function Confirmation({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ from?: string }>;
}) {
    const { id } = await params;
    const { from } = await searchParams;

    let order;
    try {
        order = await getOrder(id);
    } catch (e) {
        if (e instanceof ApiError) {
            if (e.status === 401) redirect(`/login?next=/checkout/success/${id}`);
            if (e.status === 403 || e.status === 404) notFound();
        }
        throw e;
    }

    const paid = order.status === "paid";

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            {paid && from !== "history" && <ClearCart />}
            <div className="text-center">
                <p className="text-5xl">{paid ? "🎉" : "⏳"}</p>
                <h1 className="mt-3 text-2xl font-bold">{paid ? "¡Compra confirmada!" : "Pago pendiente"}</h1>
                <p className="mt-1 text-slate-500">
                    Orden #{order.id} · {paid ? "Pagada" : "Pendiente de confirmación"}
                </p>
            </div>

            <ul className="my-6 divide-y text-sm">
                {order.items?.map((item) => (
                    <li key={item.id} className="flex justify-between py-2">
                        <span>
                            {productEmoji(item.product?.name ?? "")} {item.product?.name ?? `Producto #${item.product_id}`} ×{" "}
                            {item.quantity}
                        </span>
                        <span>{formatPrice(Number(item.unit_price) * item.quantity)}</span>
                    </li>
                ))}
            </ul>

            <div className="flex justify-between border-t pt-4 text-lg">
                <span>Total pagado</span>
                <span className="font-bold text-indigo-600">{formatPrice(order.total)}</span>
            </div>
            {order.payment?.stripe_payment_id && (
                <p className="mt-2 text-xs text-slate-500">Referencia Stripe: {order.payment.stripe_payment_id}</p>
            )}

            <div className="mt-6 flex justify-center gap-3">
                <Link href="/orders" className="rounded-xl bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">
                    Ver mis órdenes
                </Link>
                <Link href="/products" className="rounded-xl border px-4 py-2 hover:bg-slate-50">
                    Seguir comprando
                </Link>
            </div>
        </div>
    );
}

// c) la firma de SuccessPage
export default function SuccessPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ from?: string }>;
}) {
    return (
        <main className="mx-auto w-full max-w-2xl p-6">
            <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-slate-200" />}>

                <Confirmation params={params} searchParams={searchParams} />
            </Suspense>
        </main>
    );
}