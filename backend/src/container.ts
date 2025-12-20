import 'reflect-metadata';
import { container } from 'tsyringe';
import { UserRepository } from './repositories/user.repository';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { AuthMiddleware } from './middlewares/auth.middleware';

// Register repositories
container.register('IUserRepository', {
  useClass: UserRepository,
});

// Register services
container.register('IAuthService', {
  useClass: AuthService,
});

// Register controllers
container.register('IAuthController', {
  useClass: AuthController,
});

// Register middlewares
container.register('IAuthMiddleware', {
  useClass: AuthMiddleware,
});

export { container };
