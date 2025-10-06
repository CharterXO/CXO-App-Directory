import { prisma } from '@/lib/prisma';
import { UsersAdmin } from '@/components/admin/UsersAdmin';

export const revalidate = 0;

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { username: 'asc' }
  });
  const serialized = users.map((user) => ({
    id: user.id,
    username: user.username,
    role: user.role,
    isActive: user.isActive,
    mustChangePassword: user.mustChangePassword,
    createdAt: user.createdAt.toISOString()
  }));
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Manage users</h1>
        <p className="mt-2 text-sm text-slate-600">Invite new teammates and control their access.</p>
      </div>
      <UsersAdmin initialUsers={serialized} />
    </section>
  );
}
