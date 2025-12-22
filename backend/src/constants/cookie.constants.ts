export const COOKIE_CONFIG = {
  NAME: process.env.COOKIE_NAME || 'auth_token',
  MAX_AGE: 7 * 24 * 60 * 60 * 1000
} as const;

export const getCookieOptions = (isProduction: boolean) => ({
  httpOnly: true,
  secure: isProduction,
  sameSite:'strict',
  maxAge: COOKIE_CONFIG.MAX_AGE,
});
