"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.container = void 0;
require("reflect-metadata");
const tsyringe_1 = require("tsyringe");
Object.defineProperty(exports, "container", { enumerable: true, get: function () { return tsyringe_1.container; } });
const user_repository_1 = require("./repositories/user.repository");
const auth_service_1 = require("./services/auth.service");
const auth_controller_1 = require("./controllers/auth.controller");
const auth_middleware_1 = require("./middlewares/auth.middleware");
const poll_repository_1 = require("./repositories/poll.repository");
const poll_service_1 = require("./services/poll.service");
const poll_controller_1 = require("./controllers/poll.controller");
const socket_service_1 = require("./services/socket.service");
const message_repository_1 = require("./repositories/message.repository");
const message_service_1 = require("./services/message.service");
// Register repositories
tsyringe_1.container.register('IUserRepository', { useClass: user_repository_1.UserRepository });
tsyringe_1.container.register('IPollRepository', { useClass: poll_repository_1.PollRepository });
tsyringe_1.container.register('IMessageRepository', { useClass: message_repository_1.MessageRepository });
// Register services
tsyringe_1.container.register('IAuthService', { useClass: auth_service_1.AuthService });
tsyringe_1.container.register('IPollService', { useClass: poll_service_1.PollService });
tsyringe_1.container.register('SocketService', { useClass: socket_service_1.SocketService });
tsyringe_1.container.register('IMessageService', { useClass: message_service_1.MessageService });
// Register controllers
tsyringe_1.container.register('IAuthController', { useClass: auth_controller_1.AuthController });
tsyringe_1.container.register('IPollController', { useClass: poll_controller_1.PollController });
// Register middlewares
tsyringe_1.container.register('IAuthMiddleware', {
    useClass: auth_middleware_1.AuthMiddleware,
});
