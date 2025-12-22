"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtUtil = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_config_1 = require("../../config/env.config");
class JwtUtil {
    static SECRET = env_config_1.ENV_CONFIG.JWT_SECRET;
    static EXPIRES_IN = env_config_1.ENV_CONFIG.JWT_EXPIRES_IN;
    static generateToken(payload) {
        const options = {
            expiresIn: '7d',
        };
        return jsonwebtoken_1.default.sign(payload, this.SECRET, options);
    }
    static verifyToken(token) {
        return jsonwebtoken_1.default.verify(token, this.SECRET);
    }
    static decodeToken(token) {
        return jsonwebtoken_1.default.decode(token);
    }
}
exports.JwtUtil = JwtUtil;
