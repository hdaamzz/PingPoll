export const COOKIE_CONFIG = {
  ACCESS_TOKEN_NAME: 'access_token',
  REFRESH_TOKEN_NAME: 'refresh_token',
  ACCESS_TOKEN_MAX_AGE: 15 * 60 * 1000,
  REFRESH_TOKEN_MAX_AGE: 7 * 24 * 60 * 60 * 1000, 
  PATH: '/',
} as const;

export const getCookieOptions = (isProduction: boolean, maxAge: number) => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
  maxAge: maxAge,
  path: COOKIE_CONFIG.PATH,
});
