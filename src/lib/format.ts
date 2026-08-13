import type { Profile } from "@/lib/types";

export function formatTRY(amount: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatTime(time: string) {
  return time.slice(0, 5);
}

export function whatsappLink(phone: string | null | undefined, message: string) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  const normalized = digits.startsWith("90")
    ? digits
    : `90${digits.replace(/^0/, "")}`;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export function telLink(phone: string | null | undefined) {
  if (!phone) return null;
  return `tel:${phone.replace(/\s/g, "")}`;
}

export type { Profile };
