"use server";

import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { api, ApiError } from "@/lib/api";
import { clearSession } from "@/lib/session";
import type { ApiResponse, Order } from "@/lib/types";

type Item = { product_id: number; quantity: number };
export type OrderResult = { ok: true; orderId: number } | { ok: false; error: string };
export type PayResult = { ok: false; error: string } | undefined;

// Métodos de prueba de Stripe permitidos (validación en el servidor)
const ALLOWED_METHODS = [
    "pm_card_visa",
    "pm_card_mastercard",
    "pm_card_chargeDeclined",
    "pm_card_chargeDeclinedInsufficientFunds",
];

async function fail(e: unknown): Promise<{ ok: false; error: string }> {
    if (e instanceof ApiError) {
        if (e.status === 401) {
            await clearSession(); // token vencido
            redirect("/login?next=/checkout");
        }
        return { ok: false, error: e.message };
    }
    throw e;
}

export async function placeOrder(items: Item[]): Promise<OrderResult> {
    const valid =
        Array.isArray(items) &&
        items.length > 0 &&
        items.every((i) => Number.isInteger(i.product_id) && Number.isInteger(i.quantity) && i.quantity > 0);
    if (!valid) return { ok: false, error: "Tu carrito está vacío o es inválido" };

    try {
        const res = await api<ApiResponse<Order>>("/orders", {
            method: "POST",
            auth: true,
            body: JSON.stringify({ items }),
        });
        updateTag("products"); // el stock bajó: el catálogo debe verse al día
        revalidatePath("/products");
        revalidatePath("/orders");
        return { ok: true, orderId: res.data.id };
    } catch (e) {
        return fail(e);
    }
}

export async function payOrder(
    orderId: number,
    paymentMethod: string,
    source: "checkout" | "history" = "checkout",
): Promise<PayResult> {
    if (!Number.isInteger(orderId) || !ALLOWED_METHODS.includes(paymentMethod)) {
        return { ok: false, error: "Método de pago inválido" };
    }

    try {
        await api(`/orders/${orderId}/pay`, {
            method: "POST",
            auth: true,
            body: JSON.stringify({ payment_method: paymentMethod }),
        });
    } catch (e) {
        return fail(e);
    }

    revalidatePath("/orders");
    redirect(`/checkout/success/${orderId}${source === "history" ? "?from=history" : ""}`);
}