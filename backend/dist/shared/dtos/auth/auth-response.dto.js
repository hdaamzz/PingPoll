"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthResponseDto = void 0;
class AuthResponseDto {
    user;
    token;
    constructor(user, token) {
        this.user = user;
        this.token = token;
    }
    toJSON() {
        return {
            user: this.user.toJSON(),
            token: this.token,
        };
    }
}
exports.AuthResponseDto = AuthResponseDto;
