import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { generateCsrfToken, getSessionFromCookies } from '@/lib/auth/session';
import { getAppConfig } from '@/lib/config';
import LoginError from '@/components/LoginError';

export const dynamic = 'force-dynamic';

export default async function LoginPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const cookieStore = cookies();
  const session = await getSessionFromCookies(cookieStore);
  if (session) {
    redirect('/');
  }
  const csrfToken = generateCsrfToken();
  const appName = getAppConfig().appName;
  const errorParam = searchParams?.error;
  const error = Array.isArray(errorParam) ? errorParam[0] : errorParam;

  return (
    <div className="rounded-2xl bg-white p-8 shadow-xl">
      <h1 className="text-2xl font-semibold text-slate-900">Welcome to {appName}</h1>
      <p className="mt-2 text-sm text-slate-600">Sign in with your company credentials to access your applications.</p>
      <LoginError message={error ? decodeURIComponent(error) : null} />
      <form method="post" action="/api/auth/login" className="mt-6 space-y-4">
        <input type="hidden" name="csrfToken" value={csrfToken} />
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-slate-700">
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            required
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm shadow-sm focus:border-primary-500"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm shadow-sm focus:border-primary-500"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-lg bg-primary-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
        >
          Sign in
        </button>
      </form>
      <p className="mt-6 text-xs text-slate-500">
        Need help? Contact the IT help desk or email <Link href="mailto:support@example.com">support@example.com</Link>.
      </p>
    </div>
  );
}
