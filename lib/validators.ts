import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().trim().min(1).max(100),
  password: z.string().min(8).max(128),
  csrfToken: z.string().min(8)
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(8).max(128).optional(),
  newPassword: z.string().min(12).max(128),
  csrfToken: z.string().min(8)
});

export const appCreateSchema = z.object({
  name: z.string().trim().min(2).max(100),
  loginUrl: z.string().url(),
  description: z.string().trim().min(2).max(255),
  categories: z.array(z.string().trim().min(1)).max(10),
  iconUrl: z.string().url().optional().or(z.literal('').transform(() => undefined)),
  featured: z.boolean().optional()
});

export const appUpdateSchema = appCreateSchema.partial().extend({
  featured: z.boolean().optional()
});

export const userCreateSchema = z.object({
  username: z.string().trim().min(3).max(100),
  password: z.string().min(12).max(128),
  role: z.enum(['SUPER_ADMIN', 'USER']).default('USER'),
  isActive: z.boolean().default(true)
});

export const userUpdateSchema = z.object({
  username: z.string().trim().min(3).max(100).optional(),
  role: z.enum(['SUPER_ADMIN', 'USER']).optional(),
  isActive: z.boolean().optional(),
  mustChangePassword: z.boolean().optional(),
  password: z.string().min(12).max(128).optional(),
  clearLock: z.boolean().optional()
});

export const auditLogQuerySchema = z.object({
  actorId: z.string().optional(),
  entityType: z.string().optional(),
  action: z.string().optional()
});
