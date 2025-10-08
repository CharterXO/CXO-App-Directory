'use client';

import { useEffect, useMemo, useState } from 'react';
import { AdminTable } from '@/components/AdminTable';
import { formatDateTime } from '@/lib/utils';

export interface AuditLogEntry {
  id: string;
  actorUsername: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  createdAt: string;
  metadata: Record<string, unknown> | null;
}

interface AuditLogViewerProps {
  initialLogs: AuditLogEntry[];
}

export function AuditLogViewer({ initialLogs }: AuditLogViewerProps) {
  const [logs, setLogs] = useState(initialLogs);
  const [query, setQuery] = useState('');

  useEffect(() => {
    setLogs(initialLogs);
  }, [initialLogs]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return logs.filter((log) =>
      [log.actorUsername ?? '', log.action, log.entityType, log.entityId ?? '', JSON.stringify(log.metadata ?? {})]
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [logs, query]);

  return (
    <div className="space-y-4">
      <input
        type="search"
        placeholder="Search logs"
        className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm shadow-sm focus:border-primary-500 sm:w-80"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <AdminTable
        columns={[
          { header: 'Timestamp', accessor: (log) => formatDateTime(log.createdAt), className: 'w-48' },
          { header: 'Actor', accessor: (log) => log.actorUsername ?? 'System' },
          { header: 'Action', accessor: (log) => log.action },
          { header: 'Entity', accessor: (log) => `${log.entityType}${log.entityId ? ` (${log.entityId})` : ''}` },
          {
            header: 'Metadata',
            accessor: (log) => (
              <pre className="max-w-xs overflow-x-auto whitespace-pre-wrap text-xs text-slate-500">
                {log.metadata ? JSON.stringify(log.metadata, null, 2) : '—'}
              </pre>
            )
          }
        ]}
        data={filtered}
        emptyMessage="No audit log entries yet. Actions will appear here."
      />
    </div>
  );
}
