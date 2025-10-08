import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { requireSession, assertCsrfToken } from '@/lib/auth/session';
import { userCreateSchema } from '@/lib/validators';
import { hashPassword } from '@/lib/auth/password';
import { logAudit } from '@/lib/audit';

export async function GET() {
  const session = await requireSession('SUPER_ADMIN').catch(() => null);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const users = await prisma.user.findMany({ orderBy: { username: 'asc' } });
  return NextResponse.json(
    users.map(({ passwordHash: _passwordHash, ...user }) => user)
  );
}

export async function POST(request: Request) {
  const cookieStore = cookies();
  const session = await requireSession('SUPER_ADMIN').catch(() => null);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parse = userCreateSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  try {
    assertCsrfToken(request.headers.get('x-csrf-token'), cookieStore);
  } catch {
    return NextResponse.json({ error: 'CSRF token mismatch' }, { status: 403 });
  }

  const passwordHash = await hashPassword(parse.data.password);
  const user = await prisma.user.create({
    data: {
      username: parse.data.username.toLowerCase(),
      passwordHash,
      role: parse.data.role,
      isActive: parse.data.isActive,
      mustChangePassword: true
    }
  });

  await logAudit({ action: 'user_created', entityType: 'user', entityId: user.id, actorId: session.userId, metadata: { username: user.username, role: user.role } });

  const { passwordHash: _passwordHash, ...safeUser } = user;
  return NextResponse.json(safeUser, { status: 201 });
}
