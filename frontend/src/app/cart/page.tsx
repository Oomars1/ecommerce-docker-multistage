import CartView from "@/components/CartView";

export const metadata = { title: "Carrito | Mi Tienda" };

export default function CartPage() {
  return (
    <main className="mx-auto w-full max-w-6xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Tu carrito</h1>
      <CartView />
    </main>
  );
}