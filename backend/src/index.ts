import 'reflect-metadata';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import { ENV_CONFIG } from './config/env.config.js';
import { createServer } from 'http';
import connectDB from './config/database.connect.js';
import './container.js';
import authRoutes from './routes/auth.routes.js';


const app = express();
const httpServer = createServer(app);
const PORT = ENV_CONFIG.PORT;

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

app.use('/api/auth', authRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${ENV_CONFIG.NODE_ENV}`);
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed');
  process.exit(0);
});

export default app;
