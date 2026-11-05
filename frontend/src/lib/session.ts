import "server-only";
import { cookies } from "next/headers";
import type { User } from "./types";

const OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60, // 1 hora, igual que el JWT
};

export async function setSession(token: string, user: User) {
  const jar = await cookies();
  jar.set("token", token, OPTIONS);
  jar.set("user", JSON.stringify({ id: user.id, name: user.name, email: user.email }), OPTIONS);
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete("token");
  jar.delete("user");
}

export async function getUser(): Promise<User | null> {
  const jar = await cookies();
  if (!jar.get("token")?.value) return null;
  try {
    return JSON.parse(jar.get("user")?.value ?? "null");
  } catch {
    return null;
  }
}