import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth/session';
import { auditLogQuerySchema } from '@/lib/validators';

export async function GET(request: Request) {
  const session = await requireSession('SUPER_ADMIN').catch(() => null);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const parse = auditLogQuerySchema.safeParse(Object.fromEntries(url.searchParams.entries()));
  if (!parse.success) {
    return NextResponse.json({ error: 'Invalid query' }, { status: 400 });
  }

  const { actorId, entityType, action } = parse.data;
  const logs = await prisma.auditLog.findMany({
    where: {
      actorId: actorId ?? undefined,
      entityType: entityType ?? undefined,
      action: action ?? undefined
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: { actor: true }
  });

  return NextResponse.json(
    logs.map((log) => ({
      id: log.id,
      actorUsername: log.actor?.username ?? null,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      createdAt: log.createdAt.toISOString(),
      metadata: log.metadata
    }))
  );
}
