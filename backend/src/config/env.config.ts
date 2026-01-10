import dotenv from 'dotenv'
dotenv.config()
export const ENV_CONFIG = {
  PORT: process.env.PORT || 3000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/pingpoll',
  JWT_SECRET: process.env.JWT_SECRET || 'ldskfalksdlklksdf',
  REFRESH_TOKEN_SECRET:process.env.JWT_SECRET || 'ldskfalksdlklksdf',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  NODE_ENV: process.env.NODE_ENV || 'development',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:4200',
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
} as const;

export const isProduction = () => ENV_CONFIG.NODE_ENV === 'production';
