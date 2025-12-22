import { injectable, inject } from 'tsyringe';
import { Response, NextFunction } from 'express';
import { JwtUtil } from '../shared/utils/jwt.util';
import { CookieUtil } from '../shared/utils/cookie.util';
import { IAuthService } from '../services/interfaces/auth-service.interface';
import { IAuthMiddleware, AuthRequest } from './interfaces/auth-middleware.interface';
import { HTTP_STATUS } from '../constants/http-status.constants';
import { AUTH_MESSAGES } from '../constants/messages.constants';

@injectable()
export class AuthMiddleware implements IAuthMiddleware {
  constructor(
    @inject('IAuthService') private authService: IAuthService
  ) {}

  authenticate = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const token = CookieUtil.getAuthCookie(req);

      if (!token) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: AUTH_MESSAGES.AUTH_REQUIRED,
        });
        return;
      }

      const decoded = JwtUtil.verifyToken(token);
      console.log(decoded);
      
      const user = await this.authService.getUserById(decoded.userId);

      if (!user) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: AUTH_MESSAGES.USER_NOT_FOUND,
        });
        return;
      }

      req.userId = decoded.userId;
      req.user = user;
      next();
    } catch (error) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: AUTH_MESSAGES.INVALID_TOKEN,
      });
    }
  };

}
