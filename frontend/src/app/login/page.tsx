import { Suspense } from "react";
import LoginForm from "@/components/LoginForm";

async function LoginContent({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return <LoginForm next={next ?? "/products"} />;
}

export default function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  return (
    <Suspense fallback={<div className="mx-auto mt-10 h-72 w-full max-w-md animate-pulse rounded-2xl bg-slate-200" />}>
      <LoginContent searchParams={searchParams} />
    </Suspense>
  );
}