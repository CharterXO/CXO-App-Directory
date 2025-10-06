import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { requireSession, assertCsrfToken } from '@/lib/auth/session';
import { appUpdateSchema } from '@/lib/validators';
import { logAudit } from '@/lib/audit';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const cookieStore = cookies();
  const session = await requireSession('SUPER_ADMIN').catch(() => null);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parse = appUpdateSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  try {
    assertCsrfToken(request.headers.get('x-csrf-token'), cookieStore);
  } catch {
    return NextResponse.json({ error: 'CSRF token mismatch' }, { status: 403 });
  }

  let updated;
  try {
    updated = await prisma.app.update({
      where: { id: params.id },
      data: parse.data
    });
  } catch (error) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 });
  }

  await logAudit({ action: 'app_updated', entityType: 'app', entityId: updated.id, metadata: parse.data, actorId: session.userId });

  return NextResponse.json({
    ...updated,
    categories: Array.isArray(updated.categories) ? (updated.categories as string[]) : []
  });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
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

  try {
    await prisma.app.delete({ where: { id: params.id } });
  } catch {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 });
  }
  await logAudit({ action: 'app_deleted', entityType: 'app', entityId: params.id, actorId: session.userId });

  return NextResponse.json({ success: true });
}
