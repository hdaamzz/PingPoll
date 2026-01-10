import { Response, Request } from 'express';
import { COOKIE_CONFIG, getCookieOptions } from '../../constants/cookie.constants';
import { isProduction } from '../../config/env.config';

export class CookieUtil {
  static setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
    res.cookie(
      COOKIE_CONFIG.ACCESS_TOKEN_NAME,
      accessToken,
      getCookieOptions(isProduction(), COOKIE_CONFIG.ACCESS_TOKEN_MAX_AGE)
    );

    res.cookie(
      COOKIE_CONFIG.REFRESH_TOKEN_NAME,
      refreshToken,
      getCookieOptions(isProduction(), COOKIE_CONFIG.REFRESH_TOKEN_MAX_AGE)
    );
  }

  static clearAuthCookies(res: Response): void {
    const cookieOptions = getCookieOptions(isProduction(), 0);
    res.clearCookie(COOKIE_CONFIG.ACCESS_TOKEN_NAME, cookieOptions);
    res.clearCookie(COOKIE_CONFIG.REFRESH_TOKEN_NAME, cookieOptions);
  }

  static getAccessToken(req: Request): string | undefined {
    return req.cookies[COOKIE_CONFIG.ACCESS_TOKEN_NAME];
  }

  static getRefreshToken(req: Request): string | undefined {
    return req.cookies[COOKIE_CONFIG.REFRESH_TOKEN_NAME];
  }
}
