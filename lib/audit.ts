import { prisma } from '@/lib/prisma';

interface AuditOptions {
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}

export async function logAudit({ actorId, action, entityType, entityId, metadata }: AuditOptions) {
  await prisma.auditLog.create({
    data: {
      actorId: actorId ?? null,
      action,
      entityType,
      entityId: entityId ?? null,
      metadata: metadata ? metadata : undefined
    }
  });
}
