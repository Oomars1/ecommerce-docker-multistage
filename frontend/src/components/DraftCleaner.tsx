"use client";

import { useEffect } from "react";

export default function DraftCleaner() {
  useEffect(() => {
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k?.startsWith("draft:")) localStorage.removeItem(k);
      }
    } catch {}
  }, []);
  return null;
}