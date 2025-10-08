'use client';

import { cn } from '@/lib/utils';

interface Column<T> {
  header: string;
  accessor: (row: T) => React.ReactNode;
  className?: string;
}

interface AdminTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage: string;
}

export function AdminTable<T>({ columns, data, emptyMessage }: AdminTableProps<T>) {
  if (data.length === 0) {
    return <p className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.header}
                scope="col"
                className={cn('px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500', column.className)}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="odd:bg-white even:bg-slate-50">
              {columns.map((column) => (
                <td key={column.header} className={cn('px-4 py-3 text-sm text-slate-700', column.className)}>
                  {column.accessor(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
