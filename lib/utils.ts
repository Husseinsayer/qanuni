import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format a number with thousands separators using Western/English digits.
export function toArabicDigits(input: number | string): string {
  const str = typeof input === "number" ? String(input) : input;
  // Add thousands separators using comma (Western style)
  return str.replace(/\B(?=(?:\d{3})+(?!\d))/g, ",");
}

