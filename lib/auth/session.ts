import { cookies, type RequestCookies } from 'next/headers';
import { addHours, isAfter } from 'date-fns';
import { randomBytes, createHash } from 'crypto';
import { prisma } from '@/lib/prisma';
import { getAppConfig } from '@/lib/config';

const SESSION_COOKIE = 'cxo_session';
const CSRF_COOKIE = 'cxo_csrf';
const SESSION_DURATION_HOURS = 12;

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export async function createSession(userId: string) {
  const rawToken = randomBytes(32).toString('hex');
  const session = await prisma.session.create({
    data: {
      userId,
      sessionToken: hashToken(rawToken),
      expiresAt: addHours(new Date(), SESSION_DURATION_HOURS)
    },
    include: { user: true }
  });

  const cookieValue = `${session.id}.${rawToken}`;
  setSessionCookie(cookieValue, session.expiresAt);
  return session;
}

export async function getSessionFromCookies(cookieStore?: RequestCookies) {
  const store = cookieStore ?? cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  const [sessionId, token] = raw.split('.');
  if (!sessionId || !token) return null;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true }
  });
  if (!session) {
    clearSessionCookie();
    return null;
  }

  if (isAfter(new Date(), session.expiresAt)) {
    await prisma.session.delete({ where: { id: session.id } });
    clearSessionCookie();
    return null;
  }

  if (session.sessionToken !== hashToken(token)) {
    clearSessionCookie();
    return null;
  }

  return session;
}

export async function requireSession(requiredRole?: 'SUPER_ADMIN' | 'USER') {
  const session = await getSessionFromCookies();
  if (!session || !session.user.isActive) {
    throw new Error('UNAUTHENTICATED');
  }

  if (requiredRole && session.user.role !== requiredRole) {
    throw new Error('FORBIDDEN');
  }

  return session;
}

export async function invalidateSession(sessionId: string) {
  await prisma.session.deleteMany({ where: { id: sessionId } });
  clearSessionCookie();
}

export async function invalidateUserSessions(userId: string) {
  await prisma.session.deleteMany({ where: { userId } });
}

export function setSessionCookie(value: string, expiresAt: Date) {
  const { secureCookies } = getAppConfig();
  cookies().set({
    name: SESSION_COOKIE,
    value,
    httpOnly: true,
    secure: secureCookies,
    sameSite: 'lax',
    expires: expiresAt,
    path: '/'
  });
}

export function clearSessionCookie() {
  const { secureCookies } = getAppConfig();
  cookies().set({
    name: SESSION_COOKIE,
    value: '',
    httpOnly: true,
    secure: secureCookies,
    sameSite: 'lax',
    expires: new Date(0),
    path: '/'
  });
}

export function generateCsrfToken() {
  const token = randomBytes(16).toString('hex');
  const { secureCookies } = getAppConfig();
  cookies().set({
    name: CSRF_COOKIE,
    value: token,
    httpOnly: false,
    secure: secureCookies,
    sameSite: 'lax',
    path: '/'
  });
  return token;
}

export function getCsrfTokenFromCookies(cookieStore?: RequestCookies) {
  return (cookieStore ?? cookies()).get(CSRF_COOKIE)?.value;
}

export function assertCsrfToken(token: string | null | undefined, cookieStore?: RequestCookies) {
  const cookieToken = getCsrfTokenFromCookies(cookieStore);
  if (!token || !cookieToken || token !== cookieToken) {
    throw new Error('INVALID_CSRF');
  }
}
