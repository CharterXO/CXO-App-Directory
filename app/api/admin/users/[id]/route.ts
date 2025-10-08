import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { requireSession, assertCsrfToken, invalidateUserSessions } from '@/lib/auth/session';
import { userUpdateSchema } from '@/lib/validators';
import { hashPassword } from '@/lib/auth/password';
import { logAudit } from '@/lib/audit';
import { omit } from '@/lib/utils';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const cookieStore = cookies();
  const session = await requireSession('SUPER_ADMIN').catch(() => null);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parse = userUpdateSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  try {
    assertCsrfToken(request.headers.get('x-csrf-token'), cookieStore);
  } catch {
    return NextResponse.json({ error: 'CSRF token mismatch' }, { status: 403 });
  }

  const data = parse.data;
  const updateData: Record<string, unknown> = { ...data };
  if (data.username) {
    updateData.username = data.username.toLowerCase();
  }
  if (data.password) {
    updateData.passwordHash = await hashPassword(data.password);
    updateData.mustChangePassword = true;
    delete updateData.password;
  }
  if (data.clearLock) {
    updateData.lockedUntil = null;
    updateData.failedLoginAttempts = 0;
    delete updateData.clearLock;
  }
  if (typeof data.isActive === 'boolean' && data.isActive) {
    updateData.lockedUntil = null;
    updateData.failedLoginAttempts = 0;
  }

  let user;
  try {
    user = await prisma.user.update({
      where: { id: params.id },
      data: updateData
    });
  } catch {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const shouldInvalidateSessions = Boolean(data.password || data.isActive === false);
  if (shouldInvalidateSessions) {
    await invalidateUserSessions(user.id);
  }

  const auditMetadata = { ...data } as Record<string, unknown>;
  if ('password' in auditMetadata) {
    delete auditMetadata.password;
  }
  if ('clearLock' in auditMetadata) {
    auditMetadata.clearedLock = auditMetadata.clearLock;
    delete auditMetadata.clearLock;
  }
  await logAudit({ action: 'user_updated', entityType: 'user', entityId: user.id, actorId: session.userId, metadata: auditMetadata });

  return NextResponse.json(omit(user, ['passwordHash'] as const));
}
