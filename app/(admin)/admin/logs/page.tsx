import { prisma } from '@/lib/prisma';
import { AuditLogViewer } from '@/components/admin/AuditLogViewer';

export const revalidate = 0;

export default async function AdminLogsPage() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: {
      actor: true
    }
  });
  const entries = logs.map((log) => ({
    id: log.id,
    actorUsername: log.actor?.username ?? null,
    action: log.action,
    entityType: log.entityType,
    entityId: log.entityId,
    createdAt: log.createdAt.toISOString(),
    metadata: log.metadata as Record<string, unknown> | null
  }));
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Audit logs</h1>
        <p className="mt-2 text-sm text-slate-600">Track changes to users, apps, and authentication events.</p>
      </div>
      <AuditLogViewer initialLogs={entries} />
    </section>
  );
}
