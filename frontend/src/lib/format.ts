export const formatPrice = (value: string | number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value));

const EMOJIS: [RegExp, string][] = [
  [/camiseta/i, "👕"], [/gorra/i, "🧢"], [/zapatill/i, "👟"], [/mochila/i, "🎒"],
  [/reloj/i, "⌚"], [/aud[ií]fonos/i, "🎧"], [/botella/i, "🍶"], [/chaqueta/i, "🧥"],
];
export const productEmoji = (name: string) => EMOJIS.find(([r]) => r.test(name))?.[1] ?? "🛍️";

export const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("es", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));