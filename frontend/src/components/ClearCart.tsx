"use client";

import { useEffect } from "react";
import { useCart } from "./CartProvider";

export default function ClearCart() {
  const { clear, ready } = useCart();

  useEffect(() => {
    if (ready) clear();
    // solo cuando el carrito termina de cargar; clear cambia de identidad y causaría un bucle
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  return null;
}