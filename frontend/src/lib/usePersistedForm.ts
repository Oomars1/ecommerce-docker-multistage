"use client";

import { useEffect, useState, type ChangeEvent } from "react";

export function usePersistedForm<T extends Record<string, string>>(key: string, initial: T) {
  const [values, setValues] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);

  // Cargar el borrador al montar
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setValues((v) => ({ ...v, ...JSON.parse(raw) }));
    } catch {}
    setLoaded(true);
  }, [key]);

  // Guardar en cada cambio (sin contraseñas)
  useEffect(() => {
    if (!loaded) return;
    const safe = Object.fromEntries(Object.entries(values).filter(([k]) => !/password/i.test(k)));
    try {
      localStorage.setItem(key, JSON.stringify(safe));
    } catch {}
  }, [values, loaded, key]);

  const onChange = (e: ChangeEvent<HTMLInputElement>) =>
    setValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  return [values, onChange] as const;
}