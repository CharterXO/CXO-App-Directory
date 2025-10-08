'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminTable } from '@/components/AdminTable';
import { ModalForm } from '@/components/ModalForm';
import { ConfirmDialog } from '@/components/ConfirmDialog';

export interface AdminApp {
  id: string;
  name: string;
  loginUrl: string;
  description: string;
  categories: string[];
  iconUrl?: string | null;
  featured: boolean;
  updatedAt: string;
}

interface AppsAdminProps {
  initialApps: AdminApp[];
}

const emptyForm = {
  name: '',
  loginUrl: '',
  description: '',
  categories: '' as string | string[],
  iconUrl: '',
  featured: false
};

export function AppsAdmin({ initialApps }: AppsAdminProps) {
  const router = useRouter();
  const [apps, setApps] = useState(initialApps);
  const [query, setQuery] = useState('');
  const [activeApp, setActiveApp] = useState<AdminApp | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [confirmDelete, setConfirmDelete] = useState<AdminApp | null>(null);

  const filtered = useMemo(() => {
    return apps.filter((app) =>
      `${app.name} ${app.description}`.toLowerCase().includes(query.toLowerCase())
    );
  }, [apps, query]);

  useEffect(() => {
    setApps(initialApps);
  }, [initialApps]);

  const openCreate = () => {
    setActiveApp(null);
    setForm({ ...emptyForm });
    setModalOpen(true);
  };

  const openEdit = (app: AdminApp) => {
    setActiveApp(app);
    setForm({
      name: app.name,
      loginUrl: app.loginUrl,
      description: app.description,
      categories: app.categories.join(', '),
      iconUrl: app.iconUrl ?? '',
      featured: app.featured
    });
    setModalOpen(true);
  };

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = {
      name: (event.currentTarget.elements.namedItem('name') as HTMLInputElement).value,
      loginUrl: (event.currentTarget.elements.namedItem('loginUrl') as HTMLInputElement).value,
      description: (event.currentTarget.elements.namedItem('description') as HTMLTextAreaElement).value,
      iconUrl: (event.currentTarget.elements.namedItem('iconUrl') as HTMLInputElement).value,
      categories: (event.currentTarget.elements.namedItem('categories') as HTMLInputElement)
        .value.split(',')
        .map((value) => value.trim())
        .filter(Boolean),
      featured: (event.currentTarget.elements.namedItem('featured') as HTMLInputElement).checked
    };

    const response = await fetch(activeApp ? `/api/admin/apps/${activeApp.id}` : '/api/admin/apps', {
      method: activeApp ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json', 'x-csrf-token': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      alert('Unable to save application.');
      return;
    }

    setModalOpen(false);
    router.refresh();
  };

  const deleteApp = async () => {
    if (!confirmDelete) return;
    const response = await fetch(`/api/admin/apps/${confirmDelete.id}`, {
      method: 'DELETE',
      headers: { 'x-csrf-token': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '' }
    });
    if (!response.ok) {
      alert('Unable to delete application.');
      return;
    }
    setConfirmDelete(null);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          placeholder="Search apps"
          className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm shadow-sm focus:border-primary-500 sm:w-72"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button
          type="button"
          onClick={openCreate}
          className="self-start rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700"
        >
          New app
        </button>
      </div>
      <AdminTable
        columns={[
          { header: 'Name', accessor: (app) => app.name },
          { header: 'Categories', accessor: (app) => app.categories.join(', ') || '—' },
          { header: 'Featured', accessor: (app) => (app.featured ? 'Yes' : 'No'), className: 'w-24' },
          {
            header: 'Actions',
            className: 'w-40',
            accessor: (app) => (
              <div className="flex gap-2">
                <button className="text-xs font-semibold text-primary-600" onClick={() => openEdit(app)}>
                  Edit
                </button>
                <button className="text-xs font-semibold text-red-600" onClick={() => setConfirmDelete(app)}>
                  Delete
                </button>
              </div>
            )
          }
        ]}
        data={filtered}
        emptyMessage="No apps yet. Create your first app to populate the directory."
      />

      <ModalForm title={activeApp ? 'Edit application' : 'Add application'} isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
        <form className="space-y-4" onSubmit={submitForm}>
          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="name">
              Name
            </label>
            <input id="name" name="name" defaultValue={form.name} required className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm shadow-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="loginUrl">
              Login URL
            </label>
            <input id="loginUrl" name="loginUrl" type="url" defaultValue={form.loginUrl} required className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm shadow-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="description">
              Description
            </label>
            <textarea id="description" name="description" defaultValue={form.description} required className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm shadow-sm" rows={3} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="categories">
              Categories (comma separated)
            </label>
            <input id="categories" name="categories" defaultValue={typeof form.categories === 'string' ? form.categories : form.categories.join(', ')} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm shadow-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="iconUrl">
              Icon URL (optional)
            </label>
            <input id="iconUrl" name="iconUrl" type="url" defaultValue={form.iconUrl} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm shadow-sm" />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input id="featured" name="featured" type="checkbox" defaultChecked={form.featured} className="h-4 w-4 rounded border-slate-300" />
            Featured tile
          </label>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-100">
              Cancel
            </button>
            <button type="submit" className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700">
              Save
            </button>
          </div>
        </form>
      </ModalForm>

      <ConfirmDialog
        title="Delete application"
        description={`Are you sure you want to delete ${confirmDelete?.name ?? 'this app'}?`}
        isOpen={!!confirmDelete}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={deleteApp}
        confirmLabel="Delete"
      />
    </div>
  );
}
