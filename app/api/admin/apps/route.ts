import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { requireSession, assertCsrfToken } from '@/lib/auth/session';
import { appCreateSchema } from '@/lib/validators';
import { logAudit } from '@/lib/audit';

export async function POST(request: Request) {
  const cookieStore = cookies();
  const session = await requireSession('SUPER_ADMIN').catch(() => null);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parse = appCreateSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  try {
    assertCsrfToken(request.headers.get('x-csrf-token'), cookieStore);
  } catch {
    return NextResponse.json({ error: 'CSRF token mismatch' }, { status: 403 });
  }

  const data = parse.data;
  const app = await prisma.app.create({
    data: {
      name: data.name,
      loginUrl: data.loginUrl,
      description: data.description,
      categories: data.categories,
      iconUrl: data.iconUrl,
      featured: data.featured ?? false
    }
  });

  await logAudit({ action: 'app_created', entityType: 'app', entityId: app.id, metadata: data, actorId: session.userId });

  return NextResponse.json(
    {
      ...app,
      categories: data.categories
    },
    { status: 201 }
  );
}
