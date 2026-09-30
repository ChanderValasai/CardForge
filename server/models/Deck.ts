import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IDeck extends Document {
  title: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  isPublic: boolean;
  createdBy: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const deckSchema = new Schema<IDeck>(
  {
    title: {
      type: String,
      required: [true, 'Deck title is required'],
      trim: true,
      maxlength: [100, 'Deck title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    category: {
      type: String,
      default: 'General',
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null indicates system/seed decks
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast searching and filtering
deckSchema.index({ title: 'text', description: 'text' });
deckSchema.index({ createdBy: 1 });
deckSchema.index({ isPublic: 1, category: 1 });

export const Deck = mongoose.model<IDeck>('Deck', deckSchema);
