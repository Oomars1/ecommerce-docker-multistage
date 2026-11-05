"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "@/app/action/auth";
import { usePersistedForm } from "@/lib/usePersistedForm";
import { AuthCard, FormErrors, inputClass, buttonClass } from "./ui";

export default function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(login, undefined);
  const [values, onChange] = usePersistedForm("draft:login", { email: "", password: "" });

  return (
    <AuthCard title="Bienvenido de nuevo" subtitle="Inicia sesión para comprar y ver tus órdenes">
      <form action={action} className="flex flex-col gap-3">
        <input type="hidden" name="next" value={next} />
        <input name="email" type="email" placeholder="Correo" required value={values.email} onChange={onChange} className={inputClass} />
        <input name="password" type="password" placeholder="Contraseña" required value={values.password} onChange={onChange} className={inputClass} />
        <FormErrors error={state?.error} fieldErrors={state?.fieldErrors} />
        <button disabled={pending} className={buttonClass}>{pending ? "Entrando..." : "Entrar"}</button>
        <p className="text-center text-sm text-slate-500">
          ¿No tienes cuenta? <Link href="/register" className="font-medium text-indigo-600 hover:underline">Regístrate</Link>
        </p>
      </form>
    </AuthCard>
  );
}