import jwt, { SignOptions } from 'jsonwebtoken';
import { ENV_CONFIG } from '../../config/env.config';

export interface JwtPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export class JwtUtil {
  private static readonly ACCESS_TOKEN_SECRET = ENV_CONFIG.JWT_SECRET;
  private static readonly REFRESH_TOKEN_SECRET = ENV_CONFIG.REFRESH_TOKEN_SECRET || ENV_CONFIG.JWT_SECRET + '_refresh';

  static generateAccessToken(payload: { userId: string; email: string }): string {
    const options: SignOptions = {
      expiresIn: '15m',
    };
    return jwt.sign(payload, this.ACCESS_TOKEN_SECRET, options);
  }

  static generateRefreshToken(payload: { userId: string }): string {
    const options: SignOptions = {
      expiresIn: '7d',
    };
    return jwt.sign(payload, this.REFRESH_TOKEN_SECRET, options);
  }

  static verifyAccessToken(token: string): JwtPayload {
    return jwt.verify(token, this.ACCESS_TOKEN_SECRET) as JwtPayload;
  }

  static verifyRefreshToken(token: string): JwtPayload {
    return jwt.verify(token, this.REFRESH_TOKEN_SECRET) as JwtPayload;
  }

  static decodeToken(token: string): JwtPayload | null {
    return jwt.decode(token) as JwtPayload;
  }
}
