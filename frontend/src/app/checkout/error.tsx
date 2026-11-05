"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto w-full max-w-5xl p-6 text-center">
      <h2 className="mb-2 text-xl font-bold">Algo salió mal en el checkout</h2>
      <p className="mb-4 text-slate-500">{error.message}</p>
      <button onClick={reset} className="rounded-xl bg-indigo-600 px-4 py-2 text-white">
        Reintentar
      </button>
    </main>
  );
}