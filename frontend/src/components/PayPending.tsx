"use client";

import { useState, useTransition } from "react";
import { payOrder } from "@/app/action/orders";
import { METHODS } from "@/lib/payment-methods";

export default function PayPending({ orderId }: { orderId: number }) {
    const [method, setMethod] = useState(METHODS[0].id);
    const [error, setError] = useState<string | null>(null);
    const [pending, startTransition] = useTransition();

    function pay() {
        setError(null);
        startTransition(async () => {
            const res = await payOrder(orderId, method, "history");
            if (res && !res.ok) setError(res.error);
        });
    }

    return (
        <div className="mt-4 rounded-xl bg-amber-50 p-3">
            <div className="flex flex-wrap items-center gap-2">
                <select
                    aria-label="Método de pago"
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    disabled={pending}
                    className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm"
                >
                    {METHODS.map((m) => (
                        <option key={m.id} value={m.id}>
                            {m.label}
                        </option>
                    ))}
                </select>
                <button
                    onClick={pay}
                    disabled={pending}
                    className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                    {pending ? "Procesando..." : "Pagar ahora"}
                </button>
            </div>
            {error && (
                <p role="alert" className="mt-2 text-sm text-red-700">
                    {error}
                </p>
            )}
        </div>
    );
}