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
exports.AuthService = void 0;
const tsyringe_1 = require("tsyringe");
const firebase_config_1 = require("../config/firebase.config");
const jwt_util_1 = require("../shared/utils/jwt.util");
const messages_constants_1 = require("../constants/messages.constants");
const auth_response_dto_1 = require("../shared/dtos/auth/auth-response.dto");
const user_dto_1 = require("../shared/dtos/auth/user.dto");
let AuthService = class AuthService {
    userRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async verifyFirebaseToken(firebaseToken) {
        try {
            const decodedToken = await firebase_config_1.firebaseAuth.verifyIdToken(firebaseToken);
            const { uid, email, name, picture, email_verified } = decodedToken;
            if (!email) {
                throw new Error(messages_constants_1.AUTH_MESSAGES.EMAIL_NOT_FOUND);
            }
            let user = await this.userRepository.findByGoogleId(uid);
            if (!user) {
                user = await this.userRepository.create({
                    googleId: uid,
                    name: name || email.split('@')[0],
                    email,
                    picture: picture || '',
                    emailVerified: email_verified || false,
                });
            }
            else {
                user = await this.userRepository.update(user._id.toString(), {
                    name: name || user.name,
                    picture: picture || user.picture,
                    emailVerified: email_verified || user.emailVerified,
                    isOnline: true,
                    lastSeen: new Date(),
                });
            }
            if (!user) {
                throw new Error(`User not found in Auth service verifyFirebaseToken `);
            }
            const userDto = user_dto_1.UserDto.fromModel(user);
            const jwtToken = jwt_util_1.JwtUtil.generateToken({
                userId: user._id.toString(),
                email: user.email,
            });
            return new auth_response_dto_1.AuthResponseDto(userDto, jwtToken);
        }
        catch (error) {
            throw new Error(`${messages_constants_1.AUTH_MESSAGES.FIREBASE_TOKEN_INVALID}: ${error.message}`);
        }
    }
    async getUserById(userId) {
        const user = await this.userRepository.findById(userId);
        return user ? user_dto_1.UserDto.fromModel(user) : null;
    }
    async updateOnlineStatus(userId, isOnline) {
        await this.userRepository.updateOnlineStatus(userId, isOnline);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IUserRepository')),
    __metadata("design:paramtypes", [Object])
], AuthService);
