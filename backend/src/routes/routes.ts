import express from 'express';
import authRouter from './auth.routes.js';
import pollRouter from './poll.routes.js';


const router = express.Router();

router.use('/auth', authRouter);
router.use('/polls', pollRouter);



export default router;