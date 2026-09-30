import { Router } from 'express';
import { updateCard, deleteCard } from '../controllers/cardController.ts';
import { authenticateToken } from '../middleware/auth.ts';

const router = Router();

router.put('/:id', authenticateToken as any, updateCard as any);
router.delete('/:id', authenticateToken as any, deleteCard as any);

export default router;
