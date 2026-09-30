import { Router } from 'express';
import {
  recordSession,
  getUserStudyStats,
  getReviewQueue,
} from '../controllers/studyController.ts';
import { authenticateToken } from '../middleware/auth.ts';

const router = Router();

router.post('/session', authenticateToken as any, recordSession as any);
router.get('/stats', authenticateToken as any, getUserStudyStats as any);
router.get('/review-queue', authenticateToken as any, getReviewQueue as any);

export default router;
