import "server-only";
import { api } from "./api";
import type { ApiResponse, Paginated, Product } from "./types";

export async function getProducts(page = 1) {
  const res = await api<ApiResponse<Paginated<Product>>>(`/products?page=${page}`, {
    tags: ["products"],
    revalidate: 60,
  });
  return res.data;
}

export async function getProduct(id: string) {
  const res = await api<ApiResponse<Product>>(`/products/${id}`, {
    tags: ["products", `product-${id}`],
    revalidate: 60,
  });
  return res.data;
} 