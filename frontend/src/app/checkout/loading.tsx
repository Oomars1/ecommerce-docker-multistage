export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-5xl p-6">
      <div className="mb-6 h-8 w-56 animate-pulse rounded bg-slate-200" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="h-72 animate-pulse rounded-2xl bg-slate-200 lg:col-span-2" />
        <div className="h-72 animate-pulse rounded-2xl bg-slate-200" />
      </div>
    </main>
  );
}