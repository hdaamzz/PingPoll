import 'reflect-metadata';
import express from 'express';
import { Server } from 'socket.io';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { container } from 'tsyringe';
import './container.js';
import mongoose from 'mongoose';
import { ENV_CONFIG } from './config/env.config.js';
import { createServer } from 'http';
import connectDB from './config/database.connect.js';
import Routes from './routes/routes.js';
import { SocketService } from './services/socket.service';




const app = express();
const httpServer = createServer(app);
const PORT = ENV_CONFIG.PORT;
const socketService = container.resolve<SocketService>("SocketService");
const io = new Server(httpServer, {
  cors: {
    origin: ENV_CONFIG.FRONTEND_URL,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const corsOptions = {
  origin: ENV_CONFIG.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  credentials: true,
};

if (!PORT) {
  throw new Error('PORT is not defined in environment variables');
}

connectDB();

app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api',Routes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

socketService.initialize(io);

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${ENV_CONFIG.NODE_ENV}`);
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed');
  process.exit(0);
});

export { io };
