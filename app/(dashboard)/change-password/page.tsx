import { requireUserSession } from '@/lib/auth/guards';
import { generateCsrfToken } from '@/lib/auth/session';
import ChangePasswordNotice from '@/components/ChangePasswordNotice';

export default async function ChangePasswordPage() {
  const session = await requireUserSession({ allowWhenMustChange: true });
  const csrfToken = generateCsrfToken();

  return (
    <div className="mx-auto max-w-xl space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <ChangePasswordNotice mustChange={session.user.mustChangePassword} />
      <form method="post" action="/api/auth/change-password" className="space-y-4">
        <input type="hidden" name="csrfToken" value={csrfToken} />
        {!session.user.mustChangePassword ? (
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-700">
              Current password
            </label>
            <input
              id="currentPassword"
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm shadow-sm focus:border-primary-500"
            />
          </div>
        ) : null}
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700">
            New password
          </label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            required
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm shadow-sm focus:border-primary-500"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-lg bg-primary-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-700"
        >
          Update password
        </button>
      </form>
    </div>
  );
}
