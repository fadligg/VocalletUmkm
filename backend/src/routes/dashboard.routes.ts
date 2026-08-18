import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/', verifyToken, getDashboardStats);

export default router;
