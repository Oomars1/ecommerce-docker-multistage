"use client";

import { useActionState } from "react";
import Link from "next/link";
import { register } from "@/app/action/auth";
import { usePersistedForm } from "@/lib/usePersistedForm";
import { AuthCard, FormErrors, inputClass, buttonClass } from "./ui";

const FIELDS = [
  { name: "name", label: "Nombre completo", type: "text" },
  { name: "email", label: "Correo", type: "email" },
  { name: "phone", label: "Teléfono", type: "tel" },
  { name: "address", label: "Dirección", type: "text" },
  { name: "password", label: "Contraseña", type: "password" },
  { name: "password_confirmation", label: "Confirmar contraseña", type: "password" },
] as const;

export default function RegisterForm() {
  const [state, action, pending] = useActionState(register, undefined);
  const [values, onChange] = usePersistedForm("draft:register", {
    name: "", email: "", phone: "", address: "", password: "", password_confirmation: "",
  });

  return (
    <AuthCard title="Crea tu cuenta" subtitle="Solo toma un minuto">
      <form action={action} className="flex flex-col gap-3">
        {FIELDS.map((f) => (
          <div key={f.name}>
            <input
              name={f.name}
              type={f.type}
              placeholder={f.label}
              required
              value={values[f.name]}
              onChange={onChange}
              className={inputClass}
            />
            {state?.fieldErrors?.[f.name]?.map((m, i) => (
              <p key={i} className="mt-1 text-xs text-red-600">{m}</p>
            ))}
          </div>
        ))}
        <FormErrors error={state?.error} />
        <button disabled={pending} className={buttonClass}>{pending ? "Creando..." : "Registrarme"}</button>
        <p className="text-center text-sm text-slate-500">
          ¿Ya tienes cuenta? <Link href="/login" className="font-medium text-indigo-600 hover:underline">Inicia sesión</Link>
        </p>
      </form>
    </AuthCard>
  );
}