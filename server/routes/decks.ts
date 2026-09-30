import { Router } from 'express';
import {
  getDecks,
  getDeckById,
  createDeck,
  updateDeck,
  deleteDeck,
  seedDecks,
} from '../controllers/deckController.ts';
import { getCardsByDeck, createCard } from '../controllers/cardController.ts';
import { authenticateToken, optionalAuth } from '../middleware/auth.ts';

const router = Router();

router.get('/', optionalAuth as any, getDecks as any);
router.post('/seed', seedDecks as any);
router.get('/:id', optionalAuth as any, getDeckById as any);
router.post('/', authenticateToken as any, createDeck as any);
router.put('/:id', authenticateToken as any, updateDeck as any);
router.delete('/:id', authenticateToken as any, deleteDeck as any);

// Cards nested under deck
router.get('/:deckId/cards', optionalAuth as any, getCardsByDeck as any);
router.post('/:deckId/cards', authenticateToken as any, createCard as any);

export default router;
