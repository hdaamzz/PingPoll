import { Response } from 'express';
import { COOKIE_CONFIG, getCookieOptions } from '../../constants/cookie.constants';
import { isProduction } from '../../config/env.config';

export class CookieUtil {
  static setAuthCookie(res: Response, token: string): void {
    res.cookie(
      COOKIE_CONFIG.NAME,
      token,
      getCookieOptions(isProduction())
    );
  }

  static clearAuthCookie(res: Response): void {
    res.clearCookie(
      COOKIE_CONFIG.NAME,
      getCookieOptions(isProduction())
    );
  }

  static getAuthCookie(req: any): string | undefined {
    return req.cookies[COOKIE_CONFIG.NAME];
  }
}
