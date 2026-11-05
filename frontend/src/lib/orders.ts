import "server-only";
import { api } from "./api";
import type { ApiResponse, Order, Paginated } from "./types";

export async function getOrder(id: string) {
  const res = await api<ApiResponse<Order>>(`/orders/${id}`, { auth: true });
  return res.data;
}

export async function getOrders(page = 1, status = "") {
  const params = new URLSearchParams({ page: String(page) });
  if (status) params.set("status", status);
  const res = await api<ApiResponse<Paginated<Order>>>(`/orders?${params}`, { auth: true });
  return res.data;
}