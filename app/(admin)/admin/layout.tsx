import { requireSuperAdmin } from '@/lib/auth/guards';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireSuperAdmin();
  return <div className="space-y-8">{children}</div>;
}
