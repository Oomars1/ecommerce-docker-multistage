export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-3xl p-6">
      <div className="mb-6 h-8 w-40 animate-pulse rounded bg-slate-200" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-44 animate-pulse rounded-2xl bg-slate-200" />
        ))}
      </div>
    </main>
  );
}