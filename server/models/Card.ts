import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ICard extends Document {
  deckId: Types.ObjectId;
  question: string;
  answer: string;
  hint: string;
  explanation: string;
  codeSnippet: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  createdAt: Date;
}

const cardSchema = new Schema<ICard>(
  {
    deckId: {
      type: Schema.Types.ObjectId,
      ref: 'Deck',
      required: [true, 'Card must be associated with a deck'],
      index: true,
    },
    question: {
      type: String,
      required: [true, 'Question is required'],
      trim: true,
    },
    answer: {
      type: String,
      required: [true, 'Answer is required'],
      trim: true,
    },
    hint: {
      type: String,
      default: '',
      trim: true,
    },
    explanation: {
      type: String,
      default: '',
      trim: true,
    },
    codeSnippet: {
      type: String,
      default: '',
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const Card = mongoose.model<ICard>('Card', cardSchema);
