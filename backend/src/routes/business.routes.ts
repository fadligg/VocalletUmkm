import { Router } from 'express';
import { setupBusiness, getBusiness, updateBusiness, getAllBusinesses, getBusinessProfile } from '../controllers/business.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();

// Protect the routes with verifyToken middleware
router.post('/setup', verifyToken, setupBusiness);
router.get('/all', verifyToken, getAllBusinesses);
router.get('/profile/:userId', verifyToken, getBusinessProfile);
router.get('/', verifyToken, getBusiness);
router.put('/', verifyToken, updateBusiness);

export default router;
