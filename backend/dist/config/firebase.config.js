"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.firebaseAdmin = exports.firebaseAuth = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const env_config_js_1 = require("./env.config.js");
let app;
try {
    const projectId = env_config_js_1.ENV_CONFIG.FIREBASE_PROJECT_ID;
    const privateKey = env_config_js_1.ENV_CONFIG.FIREBASE_PRIVATE_KEY;
    const clientEmail = env_config_js_1.ENV_CONFIG.FIREBASE_CLIENT_EMAIL;
    app = firebase_admin_1.default.initializeApp({
        credential: firebase_admin_1.default.credential.cert({
            projectId,
            privateKey,
            clientEmail,
        }),
    });
    console.log('Firebase initialized successfully');
}
catch (error) {
    console.error('Firebase initialization failed:', error);
    throw error;
}
exports.firebaseAuth = firebase_admin_1.default.auth();
exports.firebaseAdmin = firebase_admin_1.default;
exports.default = app;
