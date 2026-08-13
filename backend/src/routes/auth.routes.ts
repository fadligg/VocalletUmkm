import { Router } from 'express';
import { register, login, googleLogin, seedTestAccount } from '../controllers/auth.controller';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/seed-test', seedTestAccount);

export default router;
