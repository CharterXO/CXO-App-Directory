import { NextResponse, type NextRequest } from 'next/server';
import { chain, strictDynamic } from 'next-safe-middleware';

const securityHeaders = strictDynamic({
  frameAncestors: ["'self'"],
  formAction: ["'self'"],
  baseUri: ["'self'"],
  scriptSrc: undefined
});

export const middleware = chain(securityHeaders, async (req: NextRequest) => {
  const res = NextResponse.next();
  res.headers.set('Referrer-Policy', 'no-referrer');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-XSS-Protection', '1; mode=block');
  return res;
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};
