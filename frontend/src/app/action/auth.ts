"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { api, ApiError } from "@/lib/api";
import { setSession, clearSession } from "@/lib/session";
import type { ApiResponse, AuthData } from "@/lib/types";

export type FormState = { error?: string; fieldErrors?: Record<string, string[]> } | undefined;

// Evita redirecciones a otros sitios (open redirect)
function safeNext(value: FormDataEntryValue | null) {
  const next = String(value ?? "");
  return next.startsWith("/") && !next.startsWith("//") ? next : "/products";
}

async function doLogin(email: string, password: string) {
  const res = await api<ApiResponse<AuthData>>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  await setSession(res.data.authorization.token, res.data.user);
}

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    await doLogin(String(formData.get("email")), String(formData.get("password")));
  } catch (e) {
    if (e instanceof ApiError) return { error: e.message, fieldErrors: e.errors };
    throw e;
  }
  revalidatePath("/", "layout");
  redirect(safeNext(formData.get("next"))); // fuera del try/catch: redirect lanza una excepción
}

export async function register(_prev: FormState, formData: FormData): Promise<FormState> {
  const body = Object.fromEntries(
    ["name", "email", "phone", "address", "password", "password_confirmation"].map((k) => [
      k,
      String(formData.get(k) ?? ""),
    ]),
  );
  try {
    await api("/auth/register", { method: "POST", body: JSON.stringify(body) });
    await doLogin(body.email, body.password);
  } catch (e) {
    if (e instanceof ApiError) return { error: e.message, fieldErrors: e.errors };
    throw e;
  }
  revalidatePath("/", "layout");
  redirect("/products");
}

export async function logout() {
  try {
    await api("/auth/logout", { method: "POST", auth: true });
  } catch {
    // si el token ya expiró, igual cerramos la sesión local
  }
  await clearSession();
  revalidatePath("/", "layout");
  redirect("/login");
}