import { injectable, inject } from 'tsyringe';
import { Response } from 'express';
import { IAuthService } from '../services/interfaces/auth-service.interface';
import { IAuthController } from './interfaces/auth-controller.interface';
import { AuthRequest } from '../middlewares/interfaces/auth-middleware.interface';
import { CookieUtil } from '../shared/utils/cookie.util';
import { JwtUtil } from '../shared/utils/jwt.util';
import { HTTP_STATUS } from '../constants/http-status.constants';
import { AUTH_MESSAGES } from '../constants/messages.constants';
import { GoogleAuthDto } from '../shared/dtos/auth/google-auth.dto';

@injectable()
export class AuthController implements IAuthController {
  constructor(
    @inject('IAuthService') private authService: IAuthService
  ) {}

  googleAuth = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { firebaseToken } = req.body;

      if (!firebaseToken) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: AUTH_MESSAGES.FIREBASE_TOKEN_REQUIRED,
        });
        return;
      }

      const googleAuthDto = new GoogleAuthDto(firebaseToken);
      const authResponse = await this.authService.verifyFirebaseToken(
        googleAuthDto.firebaseToken
      );

      CookieUtil.setAuthCookies(res, authResponse.token, authResponse.refreshToken);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: AUTH_MESSAGES.AUTH_SUCCESS,
        data: authResponse.toJSON(),
      });
    } catch (error: any) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: error.message || AUTH_MESSAGES.AUTH_FAILED,
      });
    }
  };


  refreshToken = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const refreshToken = CookieUtil.getRefreshToken(req);

      if (!refreshToken) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Refresh token not found',
        });
        return;
      }

      const decoded = JwtUtil.verifyRefreshToken(refreshToken);

      const user = await this.authService.getUserById(decoded.userId);

      if (!user) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: AUTH_MESSAGES.USER_NOT_FOUND,
        });
        return;
      }

      const newAccessToken = JwtUtil.generateAccessToken({
        userId: user.id,
        email: user.email,
      });

      const newRefreshToken = JwtUtil.generateRefreshToken({
        userId: user.id,
      });

      CookieUtil.setAuthCookies(res, newAccessToken, newRefreshToken);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          token: newAccessToken,
        },
      });
    } catch (error) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Invalid or expired refresh token',
      });
    }
  };

  getCurrentUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const user = req.user;

      if (!user) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: AUTH_MESSAGES.NOT_AUTHENTICATED,
        });
        return;
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: { user: user.toJSON() },
      });
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to get user',
      });
    }
  };

  logout = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (req.userId) {
        await this.authService.updateOnlineStatus(req.userId, false);
      }

      CookieUtil.clearAuthCookies(res);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: AUTH_MESSAGES.LOGOUT_SUCCESS,
      });
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: AUTH_MESSAGES.LOGOUT_FAILED,
      });
    }
  };
}
