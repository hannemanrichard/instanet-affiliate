import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (amount: number | null) => {
  if (amount === null) return "-"
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "DZD",
  }).format(amount)
} 