import { Response } from 'express';
import { StudySession } from '../models/StudySession.ts';
import { CardProgress } from '../models/CardProgress.ts';
import { Card } from '../models/Card.ts';
import { Deck } from '../models/Deck.ts';
import { AuthRequest } from '../middleware/auth.ts';

// POST /api/study/session
export const recordSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const {
      deckId,
      totalCards,
      knownCount,
      reviewCount,
      accuracy,
      durationSeconds = 0,
      cardResponses = [],
    } = req.body;

    if (!deckId) {
      res.status(400).json({ error: 'deckId is required.' });
      return;
    }

    const deck = await Deck.findById(deckId);
    if (!deck) {
      res.status(404).json({ error: 'Deck not found.' });
      return;
    }

    // 1. Create Study Session record
    const session = new StudySession({
      userId: req.user._id,
      deckId,
      totalCards: Number(totalCards) || 1,
      knownCount: Number(knownCount) || 0,
      reviewCount: Number(reviewCount) || 0,
      accuracy: Math.min(100, Math.max(0, Number(accuracy) || 0)),
      durationSeconds: Number(durationSeconds) || 0,
      completedAt: new Date(),
    });

    await session.save();

    // 2. Update Spaced Repetition CardProgress for each card
    const now = new Date();
    for (const item of cardResponses) {
      if (!item.cardId) continue;

      let progress = await CardProgress.findOne({
        userId: req.user._id,
        cardId: item.cardId,
      });

      if (!progress) {
        progress = new CardProgress({
          userId: req.user._id,
          cardId: item.cardId,
          deckId,
          repetitions: 0,
          intervalDays: 1,
          easeFactor: 2.5,
        });
      }

      if (item.status === 'known') {
        const reps = progress.repetitions;
        let newInterval = 1;
        if (reps === 1) newInterval = 3;
        else if (reps >= 2) newInterval = Math.round(progress.intervalDays * progress.easeFactor);

        progress.repetitions = reps + 1;
        progress.intervalDays = newInterval;
        progress.status = progress.repetitions >= 3 ? 'mastered' : 'known';

        const nextDate = new Date(now.getTime() + newInterval * 24 * 60 * 60 * 1000);
        progress.nextReviewDate = nextDate;
      } else {
        // 'learning' / 'review again' - keep in immediate review queue
        progress.repetitions = 0;
        progress.intervalDays = 1;
        progress.easeFactor = Math.max(1.3, progress.easeFactor - 0.2);
        progress.status = 'learning';
        progress.nextReviewDate = now;
      }

      progress.lastReviewedAt = now;
      await progress.save();
    }

    res.status(201).json({
      message: 'Study session recorded successfully.',
      session,
    });
  } catch (error: any) {
    console.error('[StudyController] recordSession error:', error);
    res.status(500).json({ error: error.message || 'Failed to record session.' });
  }
};

// GET /api/study/stats
export const getUserStudyStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const userId = req.user._id;

    // 1. All completed sessions for this user
    const sessions = await StudySession.find({ userId })
      .populate('deckId', 'title category difficulty')
      .sort({ completedAt: -1 });

    const totalSessions = sessions.length;
    const totalCardsStudied = sessions.reduce((acc, s) => acc + s.totalCards, 0);

    const averageAccuracy =
      totalSessions > 0
        ? Math.round(sessions.reduce((acc, s) => acc + s.accuracy, 0) / totalSessions)
        : 0;

    // 2. Card progress statistics
    const masteredCount = await CardProgress.countDocuments({ userId, status: 'mastered' });
    const knownCount = await CardProgress.countDocuments({ userId, status: 'known' });
    const learningCount = await CardProgress.countDocuments({ userId, status: 'learning' });

    // 3. Due for review in Spaced Repetition queue
    const dueCount = await CardProgress.countDocuments({
      userId,
      nextReviewDate: { $lte: new Date() },
    });

    // 4. Consecutive Daily Streak Calculation
    let streakDays = 0;
    if (sessions.length > 0) {
      const datesWithActivity = new Set(
        sessions.map((s) => new Date(s.completedAt).toISOString().split('T')[0])
      );

      const todayStr = new Date().toISOString().split('T')[0];
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      // Check if active today or yesterday
      let checkDate = datesWithActivity.has(todayStr) ? new Date() : yesterday;

      if (datesWithActivity.has(todayStr) || datesWithActivity.has(yesterdayStr)) {
        while (true) {
          const dateStr = checkDate.toISOString().split('T')[0];
          if (datesWithActivity.has(dateStr)) {
            streakDays++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }
      }
    }

    // 5. 7-Day Activity Chart data
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyActivity = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = dayNames[d.getDay()];

      const sessionsOnDate = sessions.filter(
        (s) => new Date(s.completedAt).toISOString().split('T')[0] === dateStr
      );
      const cardsStudied = sessionsOnDate.reduce((acc, s) => acc + s.totalCards, 0);

      weeklyActivity.push({
        date: dateStr,
        day: dayName,
        cardsStudied,
      });
    }

    // 6. Recent sessions (last 5)
    const recentSessions = sessions.slice(0, 5).map((s) => ({
      _id: s._id,
      deckTitle: (s.deckId as any)?.title || 'Custom Deck',
      category: (s.deckId as any)?.category || 'General',
      totalCards: s.totalCards,
      accuracy: s.accuracy,
      completedAt: s.completedAt,
    }));

    res.json({
      stats: {
        totalSessions,
        totalCardsStudied,
        averageAccuracy,
        masteredCount,
        knownCount,
        learningCount,
        dueCount,
        streakDays,
      },
      weeklyActivity,
      recentSessions,
    });
  } catch (error: any) {
    console.error('[StudyController] getUserStudyStats error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch user stats.' });
  }
};

// GET /api/study/review-queue
export const getReviewQueue = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const userId = req.user._id;

    // Retrieve cards that are due for review (nextReviewDate <= now)
    const dueProgress = await CardProgress.find({
      userId,
      nextReviewDate: { $lte: new Date() },
    })
      .populate('cardId')
      .populate('deckId', 'title category difficulty')
      .sort({ nextReviewDate: 1 });

    const queue = dueProgress
      .filter((p) => p.cardId && p.deckId)
      .map((p) => {
        const c: any = p.cardId;
        const d: any = p.deckId;
        return {
          progressId: p._id,
          status: p.status,
          intervalDays: p.intervalDays,
          repetitions: p.repetitions,
          nextReviewDate: p.nextReviewDate,
          deck: {
            _id: d._id,
            title: d.title,
            category: d.category,
            difficulty: d.difficulty,
          },
          card: {
            _id: c._id,
            question: c.question,
            answer: c.answer,
            hint: c.hint,
            explanation: c.explanation,
            codeSnippet: c.codeSnippet,
            difficulty: c.difficulty,
          },
        };
      });

    res.json({
      totalDue: queue.length,
      queue,
    });
  } catch (error: any) {
    console.error('[StudyController] getReviewQueue error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch review queue.' });
  }
};
