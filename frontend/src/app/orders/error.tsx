"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto w-full max-w-3xl p-6 text-center">
      <h2 className="mb-2 text-xl font-bold">No pudimos cargar tus órdenes</h2>
      <p className="mb-4 text-slate-500">{error.message}</p>
      <button onClick={reset} className="rounded-xl bg-indigo-600 px-4 py-2 text-white">
        Reintentar
      </button>
    </main>
  );
}