export function getAppConfig() {
  return {
    appName: process.env.NEXT_PUBLIC_APP_NAME ?? 'Company App Portal',
    authSecret: process.env.AUTH_SECRET ?? 'development-secret',
    secureCookies: process.env.NODE_ENV === 'production'
  } as const;
}

export function getRateLimitConfig() {
  return {
    redisUrl: process.env.RATE_LIMIT_REDIS_URL
  } as const;
}
