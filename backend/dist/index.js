"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const socket_io_1 = require("socket.io");
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const tsyringe_1 = require("tsyringe");
require("./container.js");
const mongoose_1 = __importDefault(require("mongoose"));
const env_config_js_1 = require("./config/env.config.js");
const http_1 = require("http");
const database_connect_js_1 = __importDefault(require("./config/database.connect.js"));
const routes_js_1 = __importDefault(require("./routes/routes.js"));
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const PORT = env_config_js_1.ENV_CONFIG.PORT;
const socketService = tsyringe_1.container.resolve("SocketService");
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: env_config_js_1.ENV_CONFIG.FRONTEND_URL,
        methods: ['GET', 'POST'],
        credentials: true
    }
});
exports.io = io;
const corsOptions = {
    origin: env_config_js_1.ENV_CONFIG.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    credentials: true,
};
if (!PORT) {
    throw new Error('PORT is not defined in environment variables');
}
(0, database_connect_js_1.default)();
app.use((0, cors_1.default)(corsOptions));
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use('/api', routes_js_1.default);
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is running' });
});
socketService.initialize(io);
httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Environment: ${env_config_js_1.ENV_CONFIG.NODE_ENV}`);
});
process.on('SIGINT', async () => {
    await mongoose_1.default.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
});
