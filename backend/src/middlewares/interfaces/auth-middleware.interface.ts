import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  userId?: string;
  user?: any;
}

export interface IAuthMiddleware {
  authenticate(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  optionalAuth(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
