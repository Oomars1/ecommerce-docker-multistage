import "server-only";
import { cookies } from "next/headers";

const BASE = process.env.API_BASE_URL!;

export class ApiError extends Error {
  constructor(public status: number, message: string, public errors?: Record<string, string[]>) {
    super(message);
  }
}

type Opts = RequestInit & {
  auth?: boolean;
  tags?: string[];
  revalidate?: number | false;
};

export async function api<T>(path: string, opts: Opts = {}): Promise<T> {
  const { auth, tags, revalidate, headers, ...init } = opts;
  const h = new Headers(headers);
  h.set("Accept", "application/json");
  if (init.body) h.set("Content-Type", "application/json");

  if (auth) {
    const token = (await cookies()).get("token")?.value;
    if (token) h.set("Authorization", `Bearer ${token}`);
  }

   const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: h,
    ...((init.method && init.method !== "GET") || auth
      ? { cache: "no-store" as const }
      : { next: { tags, revalidate } }),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(res.status, data?.message ?? "Error en la API", data?.errors);
  }
  return data as T;
}