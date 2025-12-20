import admin from 'firebase-admin';
import { ENV_CONFIG } from './env.config.js';

let app: admin.app.App;

try {
    const projectId = ENV_CONFIG.FIREBASE_PROJECT_ID;
    const privateKey = ENV_CONFIG.FIREBASE_PRIVATE_KEY;
    const clientEmail = ENV_CONFIG.FIREBASE_CLIENT_EMAIL;

    app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        privateKey,
        clientEmail,
      }),
    });
    console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization failed:', error);
  throw error;
}

export const firebaseAuth = admin.auth();
export const firebaseAdmin = admin;
export default app;
