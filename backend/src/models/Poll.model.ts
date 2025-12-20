import { Schema, model, Document, Types } from 'mongoose';

interface IVote {
  userId: Types.ObjectId;
  votedAt: Date;
}

interface IPollOption {
  optionText: string;
  votes: IVote[];
  voteCount: number;
}

export interface IPoll extends Document {
  question: string;
  options: IPollOption[];
  createdBy: Types.ObjectId;
  isActive: boolean;
  allowMultipleVotes: boolean;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PollSchema = new Schema<IPoll>({
  question: {
    type: String,
    required: true,
    trim: true
  },
  options: [{
    optionText: {
      type: String,
      required: true
    },
    votes: [{
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      votedAt: {
        type: Date,
        default: Date.now
      }
    }],
    voteCount: {
      type: Number,
      default: 0
    }
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  allowMultipleVotes: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date
  }
}, {
  timestamps: true
});

export const Poll = model<IPoll>('Poll', PollSchema);