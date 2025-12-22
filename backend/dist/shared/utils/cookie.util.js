"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CookieUtil = void 0;
const cookie_constants_1 = require("../../constants/cookie.constants");
const env_config_1 = require("../../config/env.config");
class CookieUtil {
    static setAuthCookie(res, token) {
        res.cookie(cookie_constants_1.COOKIE_CONFIG.NAME, token, (0, cookie_constants_1.getCookieOptions)((0, env_config_1.isProduction)()));
    }
    static clearAuthCookie(res) {
        res.clearCookie(cookie_constants_1.COOKIE_CONFIG.NAME, (0, cookie_constants_1.getCookieOptions)((0, env_config_1.isProduction)()));
    }
    static getAuthCookie(req) {
        return req.cookies[cookie_constants_1.COOKIE_CONFIG.NAME];
    }
}
exports.CookieUtil = CookieUtil;
