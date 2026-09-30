import { Router } from 'express';
import { register, login, getMe, updateProfile } from '../controllers/authController.ts';
import { authenticateToken } from '../middleware/auth.ts';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateToken as any, getMe as any);
router.put('/profile', authenticateToken as any, updateProfile as any);

export default router;
