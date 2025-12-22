"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCookieOptions = exports.COOKIE_CONFIG = void 0;
exports.COOKIE_CONFIG = {
    NAME: process.env.COOKIE_NAME || 'auth_token',
    MAX_AGE: 7 * 24 * 60 * 60 * 1000,
    PATH: '/',
};
const getCookieOptions = (isProduction) => ({
    httpOnly: true,
    secure: isProduction,
    sameSite: (isProduction ? 'strict' : 'lax'),
    maxAge: exports.COOKIE_CONFIG.MAX_AGE,
    path: exports.COOKIE_CONFIG.PATH,
});
exports.getCookieOptions = getCookieOptions;
