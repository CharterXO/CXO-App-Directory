import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { assertCsrfToken, clearSessionCookie, getSessionFromCookies, invalidateSession } from '@/lib/auth/session';
import { logAudit } from '@/lib/audit';

export async function POST(request: Request) {
  const cookieStore = cookies();
  const session = await getSessionFromCookies(cookieStore);

  const formData = await request.formData().catch(() => null);
  try {
    const csrfToken = formData?.get('csrfToken')?.toString() ?? request.headers.get('x-csrf-token');
    assertCsrfToken(csrfToken, cookieStore);
  } catch {
    return NextResponse.json({ error: 'CSRF token mismatch' }, { status: 403 });
  }

  if (session) {
    await invalidateSession(session.id);
    await logAudit({ action: 'logout', entityType: 'auth', actorId: session.userId });
  } else {
    clearSessionCookie();
  }

  return NextResponse.redirect(new URL('/login', request.url));
}
