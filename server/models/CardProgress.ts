import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ICardProgress extends Document {
  userId: Types.ObjectId;
  cardId: Types.ObjectId;
  deckId: Types.ObjectId;
  status: 'learning' | 'known' | 'mastered';
  repetitions: number;
  intervalDays: number;
  easeFactor: number;
  nextReviewDate: Date;
  lastReviewedAt: Date;
}

const cardProgressSchema = new Schema<ICardProgress>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    cardId: {
      type: Schema.Types.ObjectId,
      ref: 'Card',
      required: true,
      index: true,
    },
    deckId: {
      type: Schema.Types.ObjectId,
      ref: 'Deck',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['learning', 'known', 'mastered'],
      default: 'learning',
    },
    repetitions: {
      type: Number,
      default: 0,
    },
    intervalDays: {
      type: Number,
      default: 1,
    },
    easeFactor: {
      type: Number,
      default: 2.5,
    },
    nextReviewDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    lastReviewedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index so one user has one progress record per card
cardProgressSchema.index({ userId: 1, cardId: 1 }, { unique: true });

export const CardProgress = mongoose.model<ICardProgress>('CardProgress', cardProgressSchema);
