import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(value: Date | string) {
  const date = typeof value === 'string' ? new Date(value) : value;
  return date.toLocaleString();
}

export function omit<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: readonly K[]
): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) {
    if (key in result) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete result[key];
    }
  }
  return result;
}
