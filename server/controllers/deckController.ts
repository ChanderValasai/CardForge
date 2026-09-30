import { Request, Response } from 'express';
import { Deck, IDeck } from '../models/Deck.ts';
import { Card } from '../models/Card.ts';
import { AuthRequest } from '../middleware/auth.ts';
import { seedInitialDecks } from '../config/seedData.ts';

// GET /api/decks
export const getDecks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { filter, category, search } = req.query;
    const currentUserId = req.user?._id ? req.user._id.toString() : null;

    let query: any = {};

    if (filter === 'my-decks') {
      if (!currentUserId) {
        res.status(401).json({ error: 'Please log in to view your decks.' });
        return;
      }
      query.createdBy = req.user!._id;
    } else if (filter === 'explore') {
      // Explore shows public decks (system seed decks + other user public decks)
      query.isPublic = true;
    } else {
      // General view: public decks OR decks owned by user
      if (currentUserId) {
        query.$or = [{ isPublic: true }, { createdBy: req.user!._id }];
      } else {
        query.isPublic = true;
      }
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search && typeof search === 'string' && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$and = [
        query.$or ? { $or: query.$or } : {},
        {
          $or: [
            { title: searchRegex },
            { description: searchRegex },
            { category: searchRegex },
          ],
        },
      ];
      delete query.$or;
    }

    const decks = await Deck.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    // Fetch card counts in parallel
    const deckIds = decks.map((d) => d._id);
    const cardCountAgg = await Card.aggregate([
      { $match: { deckId: { $in: deckIds } } },
      { $group: { _id: '$deckId', count: { $sum: 1 } } },
    ]);

    const countMap = new Map<string, number>();
    for (const item of cardCountAgg) {
      countMap.set(item._id.toString(), item.count);
    }

    const formattedDecks = decks.map((deck) => {
      const isOwner =
        currentUserId && deck.createdBy
          ? (deck.createdBy as any)._id?.toString() === currentUserId ||
            deck.createdBy.toString() === currentUserId
          : false;

      return {
        ...deck.toObject(),
        cardCount: countMap.get(deck._id.toString()) || 0,
        isOwner,
        isSystemSeed: deck.createdBy === null,
      };
    });

    res.json({ decks: formattedDecks });
  } catch (error: any) {
    console.error('[DeckController] getDecks error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch decks.' });
  }
};

// GET /api/decks/:id
export const getDeckById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const currentUserId = req.user?._id ? req.user._id.toString() : null;

    const deck = await Deck.findById(id).populate('createdBy', 'name email');

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

    const cardCount = await Card.countDocuments({ deckId: deck._id });
    const cards = await Card.find({ deckId: deck._id }).sort({ createdAt: 1 });

    res.json({
      deck: {
        ...deck.toObject(),
        cardCount,
        isOwner,
        isSystemSeed: deck.createdBy === null,
        cards,
      },
    });
  } catch (error: any) {
    console.error('[DeckController] getDeckById error:', error);
    res.status(500).json({ error: error.message || 'Failed to retrieve deck.' });
  }
};

// POST /api/decks
export const createDeck = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const { title, description, category, difficulty, isPublic } = req.body;

    if (!title || !title.trim()) {
      res.status(400).json({ error: 'Deck title is required.' });
      return;
    }

    const validDifficulties = ['Beginner', 'Intermediate', 'Advanced'];
    const chosenDifficulty = validDifficulties.includes(difficulty)
      ? difficulty
      : 'Beginner';

    const newDeck = new Deck({
      title: title.trim(),
      description: description ? description.trim() : '',
      category: category && category.trim() ? category.trim() : 'General',
      difficulty: chosenDifficulty,
      isPublic: typeof isPublic === 'boolean' ? isPublic : true,
      createdBy: req.user._id,
    });

    await newDeck.save();

    res.status(201).json({
      message: 'Deck created successfully.',
      deck: {
        ...newDeck.toObject(),
        cardCount: 0,
        isOwner: true,
        isSystemSeed: false,
      },
    });
  } catch (error: any) {
    console.error('[DeckController] createDeck error:', error);
    res.status(500).json({ error: error.message || 'Failed to create deck.' });
  }
};

// PUT /api/decks/:id
export const updateDeck = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const { id } = req.params;
    const { title, description, category, difficulty, isPublic } = req.body;

    const deck = await Deck.findById(id);

    if (!deck) {
      res.status(404).json({ error: 'Deck not found.' });
      return;
    }

    // Seed / system deck check
    if (!deck.createdBy) {
      res.status(403).json({
        error: 'System seed decks cannot be modified. Create your own deck instead.',
      });
      return;
    }

    // Ownership check
    if (deck.createdBy.toString() !== req.user._id.toString()) {
      res.status(403).json({ error: 'You do not have permission to edit this deck.' });
      return;
    }

    if (title && title.trim()) {
      deck.title = title.trim();
    }
    if (typeof description === 'string') {
      deck.description = description.trim();
    }
    if (category && category.trim()) {
      deck.category = category.trim();
    }
    if (difficulty && ['Beginner', 'Intermediate', 'Advanced'].includes(difficulty)) {
      deck.difficulty = difficulty;
    }
    if (typeof isPublic === 'boolean') {
      deck.isPublic = isPublic;
    }

    await deck.save();

    const cardCount = await Card.countDocuments({ deckId: deck._id });

    res.json({
      message: 'Deck updated successfully.',
      deck: {
        ...deck.toObject(),
        cardCount,
        isOwner: true,
        isSystemSeed: false,
      },
    });
  } catch (error: any) {
    console.error('[DeckController] updateDeck error:', error);
    res.status(500).json({ error: error.message || 'Failed to update deck.' });
  }
};

// DELETE /api/decks/:id
export const deleteDeck = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const { id } = req.params;
    const deck = await Deck.findById(id);

    if (!deck) {
      res.status(404).json({ error: 'Deck not found.' });
      return;
    }

    // Cannot delete system seed decks
    if (!deck.createdBy) {
      res.status(403).json({
        error: 'System seed decks cannot be deleted.',
      });
      return;
    }

    // Ownership check
    if (deck.createdBy.toString() !== req.user._id.toString()) {
      res.status(403).json({ error: 'You do not have permission to delete this deck.' });
      return;
    }

    // Delete deck and cascade delete its cards
    await Card.deleteMany({ deckId: deck._id });
    await Deck.findByIdAndDelete(deck._id);

    res.json({
      message: 'Deck and its associated cards were deleted successfully.',
      deletedDeckId: id,
    });
  } catch (error: any) {
    console.error('[DeckController] deleteDeck error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete deck.' });
  }
};

// POST /api/decks/seed
export const seedDecks = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await seedInitialDecks();
    res.json({
      message: 'Seed technical interview decks populated successfully.',
      result,
    });
  } catch (error: any) {
    console.error('[DeckController] seedDecks error:', error);
    res.status(500).json({ error: error.message || 'Failed to seed decks.' });
  }
};
