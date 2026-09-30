import { Response } from 'express';
import { Card } from '../models/Card.ts';
import { Deck } from '../models/Deck.ts';
import { AuthRequest } from '../middleware/auth.ts';

// GET /api/decks/:deckId/cards
export const getCardsByDeck = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { deckId } = req.params;
    const currentUserId = req.user?._id ? req.user._id.toString() : null;

    const deck = await Deck.findById(deckId);
    if (!deck) {
      res.status(404).json({ error: 'Deck not found.' });
      return;
    }

    // Privacy check
    const isOwner =
      currentUserId && deck.createdBy
        ? (deck.createdBy as any)._id?.toString() === currentUserId ||
          deck.createdBy.toString() === currentUserId
        : false;

    if (!deck.isPublic && !isOwner) {
      res.status(403).json({ error: 'This deck is private.' });
      return;
    }

    const cards = await Card.find({ deckId }).sort({ createdAt: 1 });

    res.json({
      deck: {
        _id: deck._id,
        title: deck.title,
        description: deck.description,
        category: deck.category,
        difficulty: deck.difficulty,
        isPublic: deck.isPublic,
        isOwner,
        isSystemSeed: deck.createdBy === null,
      },
      cards,
      totalCards: cards.length,
    });
  } catch (error: any) {
    console.error('[CardController] getCardsByDeck error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch cards.' });
  }
};

// POST /api/decks/:deckId/cards
export const createCard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const { deckId } = req.params;
    const { question, answer, hint, explanation, codeSnippet, difficulty } = req.body;

    const deck = await Deck.findById(deckId);
    if (!deck) {
      res.status(404).json({ error: 'Deck not found.' });
      return;
    }

    // System seed check
    if (!deck.createdBy) {
      res.status(403).json({
        error: 'Cannot add custom cards to system seed decks. Please create your own deck.',
      });
      return;
    }

    // Ownership check
    if (deck.createdBy.toString() !== req.user._id.toString()) {
      res.status(403).json({ error: 'You do not have permission to add cards to this deck.' });
      return;
    }

    if (!question || !question.trim()) {
      res.status(400).json({ error: 'Card question is required.' });
      return;
    }

    if (!answer || !answer.trim()) {
      res.status(400).json({ error: 'Card answer is required.' });
      return;
    }

    const validDifficulties = ['Easy', 'Medium', 'Hard'];
    const chosenDifficulty = validDifficulties.includes(difficulty) ? difficulty : 'Medium';

    const card = new Card({
      deckId: deck._id,
      question: question.trim(),
      answer: answer.trim(),
      hint: hint ? hint.trim() : '',
      explanation: explanation ? explanation.trim() : '',
      codeSnippet: codeSnippet ? codeSnippet.trim() : '',
      difficulty: chosenDifficulty,
    });

    await card.save();

    res.status(201).json({
      message: 'Card added successfully.',
      card,
    });
  } catch (error: any) {
    console.error('[CardController] createCard error:', error);
    res.status(500).json({ error: error.message || 'Failed to create card.' });
  }
};

// PUT /api/cards/:id
export const updateCard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const { id } = req.params;
    const { question, answer, hint, explanation, codeSnippet, difficulty } = req.body;

    const card = await Card.findById(id);
    if (!card) {
      res.status(404).json({ error: 'Card not found.' });
      return;
    }

    // Verify ownership of the parent deck
    const deck = await Deck.findById(card.deckId);
    if (!deck) {
      res.status(404).json({ error: 'Parent deck not found.' });
      return;
    }

    if (!deck.createdBy || deck.createdBy.toString() !== req.user._id.toString()) {
      res.status(403).json({ error: 'You do not have permission to modify this card.' });
      return;
    }

    if (question && question.trim()) card.question = question.trim();
    if (answer && answer.trim()) card.answer = answer.trim();
    if (typeof hint === 'string') card.hint = hint.trim();
    if (typeof explanation === 'string') card.explanation = explanation.trim();
    if (typeof codeSnippet === 'string') card.codeSnippet = codeSnippet.trim();
    if (difficulty && ['Easy', 'Medium', 'Hard'].includes(difficulty)) {
      card.difficulty = difficulty;
    }

    await card.save();

    res.json({
      message: 'Card updated successfully.',
      card,
    });
  } catch (error: any) {
    console.error('[CardController] updateCard error:', error);
    res.status(500).json({ error: error.message || 'Failed to update card.' });
  }
};

// DELETE /api/cards/:id
export const deleteCard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const { id } = req.params;

    const card = await Card.findById(id);
    if (!card) {
      res.status(404).json({ error: 'Card not found.' });
      return;
    }

    // Verify ownership of the parent deck
    const deck = await Deck.findById(card.deckId);
    if (!deck) {
      res.status(404).json({ error: 'Parent deck not found.' });
      return;
    }

    if (!deck.createdBy || deck.createdBy.toString() !== req.user._id.toString()) {
      res.status(403).json({ error: 'You do not have permission to delete this card.' });
      return;
    }

    await Card.findByIdAndDelete(id);

    res.json({
      message: 'Card deleted successfully.',
      deletedCardId: id,
    });
  } catch (error: any) {
    console.error('[CardController] deleteCard error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete card.' });
  }
};
