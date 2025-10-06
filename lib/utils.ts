import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(value: Date | string) {
  const date = typeof value === 'string' ? new Date(value) : value;
  return date.toLocaleString();
}
