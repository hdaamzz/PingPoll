"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_routes_js_1 = __importDefault(require("./auth.routes.js"));
const poll_routes_js_1 = __importDefault(require("./poll.routes.js"));
const router = express_1.default.Router();
router.use('/auth', auth_routes_js_1.default);
router.use('/polls', poll_routes_js_1.default);
exports.default = router;
