import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import { requireUserSession } from '@/lib/auth/guards';
import { AppDirectory } from '@/components/AppDirectory';
import { SkeletonGrid } from '@/components/SkeletonGrid';

export const revalidate = 0;

export default async function HomePage() {
  await requireUserSession();
  const apps = await prisma.app.findMany({
    orderBy: [{ featured: 'desc' }, { name: 'asc' }]
  });

  const clientApps = apps.map((app) => ({
    id: app.id,
    name: app.name,
    description: app.description,
    loginUrl: app.loginUrl,
    categories: Array.isArray(app.categories) ? (app.categories as string[]) : [],
    iconUrl: app.iconUrl,
    featured: app.featured
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Your applications</h1>
        <p className="mt-2 text-sm text-slate-600">Launch the tools you need every day. Use search or filters to find what you need.</p>
      </div>
      <Suspense fallback={<SkeletonGrid />}>
        <AppDirectory apps={clientApps} />
      </Suspense>
    </div>
  );
}
