import type { Role } from '@prisma/client';

export function canManageUsers(role: Role) {
  return role === 'SUPER_ADMIN';
}

export function canManageApps(role: Role) {
  return role === 'SUPER_ADMIN';
}

export function isSuperAdmin(role: Role) {
  return role === 'SUPER_ADMIN';
}
