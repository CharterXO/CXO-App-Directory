import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { changePasswordSchema } from '@/lib/validators';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { getSessionFromCookies, assertCsrfToken, invalidateUserSessions, createSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export async function POST(request: Request) {
  const cookieStore = cookies();
  const session = await getSessionFromCookies(cookieStore);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await request.formData().catch(async () => {
    try {
      return await request.json();
    } catch {
      return null;
    }
  });
  const payload = data instanceof FormData ? Object.fromEntries(data) : (data as Record<string, unknown> | null);
  if (!payload) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const result = changePasswordSchema.safeParse(payload);
  if (!result.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  try {
    assertCsrfToken(result.data.csrfToken, cookieStore);
  } catch {
    return NextResponse.json({ error: 'CSRF token mismatch' }, { status: 403 });
  }

  const { currentPassword, newPassword } = result.data;
  if (!session.user.mustChangePassword && !currentPassword) {
    return NextResponse.json({ error: 'Current password required' }, { status: 400 });
  }

  if (!session.user.mustChangePassword) {
    const valid = await verifyPassword(session.user.passwordHash, currentPassword!);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid current password' }, { status: 400 });
    }
  }

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: session.userId },
    data: { passwordHash, mustChangePassword: false }
  });
  await invalidateUserSessions(session.userId);
  await createSession(session.userId);
  await logAudit({ action: 'password_change', entityType: 'user', actorId: session.userId });

  return NextResponse.redirect(new URL('/', request.url));
}
