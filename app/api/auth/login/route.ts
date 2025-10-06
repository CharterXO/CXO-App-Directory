import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { limit } from '@/lib/rate-limit';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';
import { loginSchema } from '@/lib/validators';
import { verifyPassword } from '@/lib/auth/password';
import { createSession, assertCsrfToken } from '@/lib/auth/session';

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown';
  const rate = await limit(`login:${ip}`, 5, 60_000);
  if (!rate.success) {
    return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 });
  }

  const formData = await request.formData();
  const payload = Object.fromEntries(formData) as Record<string, string>;
  const parseResult = loginSchema.safeParse(payload);
  if (!parseResult.success) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent('Invalid credentials')}`, request.url));
  }
  const { username, password, csrfToken } = parseResult.data;
  const normalizedUsername = username.trim().toLowerCase();

  try {
    assertCsrfToken(csrfToken, cookies());
  } catch {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent('Session expired. Please try again.')}`, request.url));
  }

  const user = await prisma.user.findUnique({ where: { username: normalizedUsername } });
  if (!user || !user.isActive) {
    await logAudit({ action: 'login_failed', entityType: 'auth', actorId: null, metadata: { username: normalizedUsername } });
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent('Invalid username or password')}`, request.url));
  }

  const isValid = await verifyPassword(user.passwordHash, password);
  if (!isValid) {
    await logAudit({ action: 'login_failed', entityType: 'auth', actorId: user.id, metadata: { username: normalizedUsername } });
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent('Invalid username or password')}`, request.url));
  }

  await createSession(user.id);
  await logAudit({ action: 'login_success', entityType: 'auth', actorId: user.id, metadata: { username: normalizedUsername } });

  return NextResponse.redirect(new URL('/', request.url));
}
