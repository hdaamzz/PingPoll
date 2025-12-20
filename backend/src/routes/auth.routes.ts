import { Router } from 'express';
import { container } from 'tsyringe';
import { AuthController } from '../controllers/auth.controller.js';
import { AuthMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

const authController = container.resolve(AuthController);
const authMiddleware = container.resolve(AuthMiddleware);

router.post('/google', authController.googleAuth);

router.get('/me', authMiddleware.authenticate, authController.getCurrentUser);
router.post('/logout', authMiddleware.authenticate, authController.logout);
router.post('/refresh', authMiddleware.authenticate, authController.refreshToken);

export default router;
