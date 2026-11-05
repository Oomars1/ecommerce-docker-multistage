import type { ReactNode } from "react";

export const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200";
export const buttonClass =
  "w-full rounded-xl bg-indigo-600 px-4 py-2.5 font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50";

export function AuthCard({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 items-center p-6">
      <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="mb-6 mt-1 text-sm text-slate-500">{subtitle}</p>
        {children}
      </div>
    </main>
  );
}

export function FormErrors({ error, fieldErrors }: { error?: string; fieldErrors?: Record<string, string[]> }) {
  const messages = fieldErrors ? Object.values(fieldErrors).flat() : [];
  if (!error && messages.length === 0) return null;
  return (
    <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      {error && <p className="font-medium">{error}</p>}
      {messages.map((m, i) => <p key={i}>{m}</p>)}
    </div>
  );
}