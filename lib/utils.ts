import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price)
}

export function formatOrderNumber(id: string, createdAt: string, serial?: number) {
  if (!serial) {
    return id.slice(0, 8); // Fallback for old orders or before SQL migration
  }
  const date = new Date(createdAt);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const serialStr = String(serial).padStart(4, '0');
  return `${year}-${month}-${serialStr}`;
}

export function calculateEstimatedReadyTime(prepTimeMinutes: number) {
  const now = new Date()
  now.setMinutes(now.getMinutes() + prepTimeMinutes)
  return now
}

export function generateAnonymousId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
