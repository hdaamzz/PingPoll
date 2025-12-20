import jwt, { SignOptions } from 'jsonwebtoken';
import { ENV_CONFIG } from '../../config/env.config';

export interface JwtPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export class JwtUtil {
  private static readonly SECRET = ENV_CONFIG.JWT_SECRET;
  private static readonly EXPIRES_IN = ENV_CONFIG.JWT_EXPIRES_IN;

  static generateToken(payload: { userId: string; email: string }): string {
    const options: SignOptions = {
      expiresIn: '7d',
    };

    return jwt.sign(payload, this.SECRET, options);
  }

  static verifyToken(token: string): JwtPayload {
    return jwt.verify(token, this.SECRET) as JwtPayload;
  }

  static decodeToken(token: string): JwtPayload | null {
    return jwt.decode(token) as JwtPayload;
  }
}
