import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IStudySession extends Document {
  userId: Types.ObjectId;
  deckId: Types.ObjectId;
  totalCards: number;
  knownCount: number;
  reviewCount: number;
  accuracy: number;
  durationSeconds: number;
  completedAt: Date;
}

const studySessionSchema = new Schema<IStudySession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    deckId: {
      type: Schema.Types.ObjectId,
      ref: 'Deck',
      required: true,
      index: true,
    },
    totalCards: {
      type: Number,
      required: true,
      min: 1,
    },
    knownCount: {
      type: Number,
      required: true,
      default: 0,
    },
    reviewCount: {
      type: Number,
      required: true,
      default: 0,
    },
    accuracy: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    durationSeconds: {
      type: Number,
      default: 0,
    },
    completedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const StudySession = mongoose.model<IStudySession>('StudySession', studySessionSchema);
