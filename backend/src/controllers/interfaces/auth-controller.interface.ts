import { Response } from 'express';
import { AuthRequest } from '../../middlewares/interfaces/auth-middleware.interface';

export interface IAuthController {
  googleAuth(req: AuthRequest, res: Response): Promise<void>;
  getCurrentUser(req: AuthRequest, res: Response): Promise<void>;
  logout(req: AuthRequest, res: Response): Promise<void>;
}
