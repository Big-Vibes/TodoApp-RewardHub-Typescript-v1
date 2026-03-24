import { Router } from 'express';
import apiRouter from './index.js';

const router = Router();

router.use('/api', apiRouter);

export default router;
