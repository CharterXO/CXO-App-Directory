import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { randomBytes } from 'crypto';
import { prisma } from '@/lib/prisma';
import { requireSession, assertCsrfToken, invalidateUserSessions } from '@/lib/auth/session';
import { hashPassword } from '@/lib/auth/password';
import { logAudit } from '@/lib/audit';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const cookieStore = cookies();
  const session = await requireSession('SUPER_ADMIN').catch(() => null);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    assertCsrfToken(request.headers.get('x-csrf-token'), cookieStore);
  } catch {
    return NextResponse.json({ error: 'CSRF token mismatch' }, { status: 403 });
  }

  const tempPassword = `${randomBytes(6).toString('base64url')}!A1`;
  const passwordHash = await hashPassword(tempPassword);

  let user;
  try {
    user = await prisma.user.update({
      where: { id: params.id },
      data: { passwordHash, mustChangePassword: true }
    });
  } catch {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  await invalidateUserSessions(user.id);
  await logAudit({ action: 'user_password_reset', entityType: 'user', entityId: user.id, actorId: session.userId });

  return NextResponse.json({ username: user.username, temporaryPassword: tempPassword });
}
