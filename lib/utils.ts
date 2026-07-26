import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const AR_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

// Force Arabic-Indic numerals regardless of the runtime's Intl/ICU data.
// Accepts a number or numeric string and returns Arabic digits with groups of
// 3 separated by the Arabic thousands separator "٬". Non-digit chars pass through.
export function toArabicDigits(input: number | string): string {
  const str = typeof input === "number" ? String(input) : input;
  // Group Latin digits by thousands first (operates on Latin digits only).
  const grouped = str.replace(/\d(?=(?:\d{3})+(?!\d))/g, (d) => d + "٬");
  // Map every Latin digit to its Arabic counterpart in a single pass.
  return grouped.replace(/\d/g, (d) => AR_DIGITS[Number(d)]);
}

