import { prisma } from '@/lib/prisma';
import { AppsAdmin } from '@/components/admin/AppsAdmin';

export const revalidate = 0;

export default async function AdminAppsPage() {
  const apps = await prisma.app.findMany({ orderBy: { name: 'asc' } });
  const serialized = apps.map((app) => ({
    id: app.id,
    name: app.name,
    loginUrl: app.loginUrl,
    description: app.description,
    categories: Array.isArray(app.categories) ? (app.categories as string[]) : [],
    iconUrl: app.iconUrl,
    featured: app.featured,
    updatedAt: app.updatedAt.toISOString()
  }));
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Manage applications</h1>
        <p className="mt-2 text-sm text-slate-600">Create, edit, or remove apps from the launchpad.</p>
      </div>
      <AppsAdmin initialApps={serialized} />
    </section>
  );
}
