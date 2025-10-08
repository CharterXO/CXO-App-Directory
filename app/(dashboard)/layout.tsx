import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { generateCsrfToken, getCsrfTokenFromCookies, getSessionFromCookies } from '@/lib/auth/session';
import { getAppConfig } from '@/lib/config';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies();
  const session = await getSessionFromCookies(cookieStore);
  if (!session || !session.user.isActive) {
    redirect('/login');
  }

  const csrfToken = getCsrfTokenFromCookies(cookieStore) ?? generateCsrfToken();

  const appName = getAppConfig().appName;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-semibold text-slate-900">
            {appName}
          </Link>
          <nav className="flex items-center gap-4 text-sm text-slate-600">
            {session.user.role === 'SUPER_ADMIN' ? (
              <>
                <Link href="/admin/apps" className="hover:text-primary-600">
                  Apps
                </Link>
                <Link href="/admin/users" className="hover:text-primary-600">
                  Users
                </Link>
                <Link href="/admin/logs" className="hover:text-primary-600">
                  Audit Logs
                </Link>
              </>
            ) : null}
            <Link href="/change-password" className="hover:text-primary-600">
              Change password
            </Link>
            <form method="post" action="/api/auth/logout">
              <input type="hidden" name="csrfToken" value={csrfToken} />
              <button type="submit" className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100">
                Log out
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
