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
exports.AuthController = void 0;
const tsyringe_1 = require("tsyringe");
const cookie_util_1 = require("../shared/utils/cookie.util");
const http_status_constants_1 = require("../constants/http-status.constants");
const messages_constants_1 = require("../constants/messages.constants");
const google_auth_dto_1 = require("../shared/dtos/auth/google-auth.dto");
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    googleAuth = async (req, res) => {
        try {
            const { firebaseToken } = req.body;
            if (!firebaseToken) {
                res.status(http_status_constants_1.HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: messages_constants_1.AUTH_MESSAGES.FIREBASE_TOKEN_REQUIRED,
                });
                return;
            }
            const googleAuthDto = new google_auth_dto_1.GoogleAuthDto(firebaseToken);
            const authResponse = await this.authService.verifyFirebaseToken(googleAuthDto.firebaseToken);
            cookie_util_1.CookieUtil.setAuthCookie(res, authResponse.token);
            res.status(http_status_constants_1.HTTP_STATUS.OK).json({
                success: true,
                message: messages_constants_1.AUTH_MESSAGES.AUTH_SUCCESS,
                data: authResponse.toJSON(),
            });
        }
        catch (error) {
            res.status(http_status_constants_1.HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: error.message || messages_constants_1.AUTH_MESSAGES.AUTH_FAILED,
            });
        }
    };
    getCurrentUser = async (req, res) => {
        try {
            const user = req.user;
            if (!user) {
                res.status(http_status_constants_1.HTTP_STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: messages_constants_1.AUTH_MESSAGES.NOT_AUTHENTICATED,
                });
                return;
            }
            res.status(http_status_constants_1.HTTP_STATUS.OK).json({
                success: true,
                data: { user: user.toJSON() },
            });
        }
        catch (error) {
            res.status(http_status_constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Failed to get user',
            });
        }
    };
    logout = async (req, res) => {
        try {
            if (req.userId) {
                await this.authService.updateOnlineStatus(req.userId, false);
            }
            cookie_util_1.CookieUtil.clearAuthCookie(res);
            res.status(http_status_constants_1.HTTP_STATUS.OK).json({
                success: true,
                message: messages_constants_1.AUTH_MESSAGES.LOGOUT_SUCCESS,
            });
        }
        catch (error) {
            res.status(http_status_constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: messages_constants_1.AUTH_MESSAGES.LOGOUT_FAILED,
            });
        }
    };
};
exports.AuthController = AuthController;
exports.AuthController = AuthController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IAuthService')),
    __metadata("design:paramtypes", [Object])
], AuthController);
