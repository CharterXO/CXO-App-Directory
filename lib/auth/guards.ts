import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getSessionFromCookies } from '@/lib/auth/session';

export async function requireUserSession({ allowWhenMustChange = false }: { allowWhenMustChange?: boolean } = {}) {
  const cookieStore = cookies();
  const session = await getSessionFromCookies(cookieStore);
  if (!session || !session.user.isActive) {
    redirect('/login');
  }

  if (session.user.mustChangePassword && !allowWhenMustChange) {
    redirect('/change-password');
  }

  return session;
}

export async function requireSuperAdmin() {
  const session = await requireUserSession();
  if (session.user.role !== 'SUPER_ADMIN') {
    redirect('/');
  }
  return session;
}
