import 'reflect-metadata';
import { container } from 'tsyringe';
import { UserRepository } from './repositories/user.repository';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { AuthMiddleware } from './middlewares/auth.middleware';
import { PollRepository } from './repositories/poll.repository';
import { PollService } from './services/poll.service';
import { PollController } from './controllers/poll.controller';
import { SocketService } from './services/socket.service';

// Register repositories
container.register('IUserRepository', { useClass: UserRepository});
container.register('IPollRepository', { useClass: PollRepository });


// Register services
container.register('IAuthService', { useClass: AuthService});
container.register('IPollService', { useClass: PollService });
container.register('SocketService', { useClass: SocketService });


// Register controllers
container.register('IAuthController', { useClass: AuthController });
container.register('IPollController', { useClass: PollController });
// Register middlewares
container.register('IAuthMiddleware', {
  useClass: AuthMiddleware,
});

export { container };


