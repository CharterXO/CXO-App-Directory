import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { requireSession, assertCsrfToken, invalidateUserSessions } from '@/lib/auth/session';
import { userUpdateSchema } from '@/lib/validators';
import { hashPassword } from '@/lib/auth/password';
import { logAudit } from '@/lib/audit';

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

  let user;
  try {
    user = await prisma.user.update({
      where: { id: params.id },
      data: updateData
    });
  } catch {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  if (data.password) {
    await invalidateUserSessions(user.id);
  }

  const auditMetadata = { ...data } as Record<string, unknown>;
  if ('password' in auditMetadata) {
    delete auditMetadata.password;
  }
  await logAudit({ action: 'user_updated', entityType: 'user', entityId: user.id, actorId: session.userId, metadata: auditMetadata });

  const { passwordHash: _passwordHash, ...safeUser } = user;
  return NextResponse.json(safeUser);
}
