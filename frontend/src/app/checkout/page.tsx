import CheckoutForm from "@/components/CheckoutForm";

export const metadata = { title: "Checkout | Mi Tienda" };

export default function CheckoutPage() {
  return (
    <main className="mx-auto w-full max-w-5xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Finalizar compra</h1>
      <CheckoutForm />
    </main>
  );
}