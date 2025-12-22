"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMiddleware = void 0;
const tsyringe_1 = require("tsyringe");
const jwt_util_1 = require("../shared/utils/jwt.util");
const cookie_util_1 = require("../shared/utils/cookie.util");
const http_status_constants_1 = require("../constants/http-status.constants");
const messages_constants_1 = require("../constants/messages.constants");
let AuthMiddleware = class AuthMiddleware {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    authenticate = async (req, res, next) => {
        try {
            const token = cookie_util_1.CookieUtil.getAuthCookie(req);
            if (!token) {
                res.status(http_status_constants_1.HTTP_STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: messages_constants_1.AUTH_MESSAGES.AUTH_REQUIRED,
                });
                return;
            }
            const decoded = jwt_util_1.JwtUtil.verifyToken(token);
            const user = await this.authService.getUserById(decoded.userId);
            if (!user) {
                res.status(http_status_constants_1.HTTP_STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: messages_constants_1.AUTH_MESSAGES.USER_NOT_FOUND,
                });
                return;
            }
            req.userId = decoded.userId;
            req.user = user;
            next();
        }
        catch (error) {
            res.status(http_status_constants_1.HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: messages_constants_1.AUTH_MESSAGES.INVALID_TOKEN,
            });
        }
    };
};
exports.AuthMiddleware = AuthMiddleware;
exports.AuthMiddleware = AuthMiddleware = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IAuthService')),
    __metadata("design:paramtypes", [Object])
], AuthMiddleware);
