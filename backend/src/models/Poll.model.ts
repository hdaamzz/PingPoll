import mongoose, { Schema,Document } from 'mongoose';

export interface IPollOption {
  id: string;
  text: string;
  votes: number;
  votedBy: string[];
}
export interface IPoll extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  question: string;
  options: IPollOption[];
  createdBy: mongoose.Types.ObjectId;
  status: 'active' | 'closed' | 'draft';
  totalVotes: number;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PollOptionSchema = new Schema<IPollOption>({
  id: { type: String, required: true },
  text: { type: String, required: true },
  votes: { type: Number, default: 0 },
  votedBy: [{ type: String }]
}, { _id: false });

const PollSchema = new Schema<IPoll>({
  title: { 
    type: String, 
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 200
  },
  question: { 
    type: String, 
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 500
  },
  
  options: {
    type: [PollOptionSchema],
    required: true,
    validate: {
      validator: function(options: IPollOption[]) {
        return options.length >= 2 && options.length <= 6;
      },
      message: 'Poll must have between 2 and 6 options'
    }
  },
  createdBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'draft'],
    default: 'active'
  },
  totalVotes: { 
    type: Number, 
    default: 0 
  },
  expiresAt: { 
    type: Date,
    required: false
  }
}, {
  timestamps: true
});
const Poll = mongoose.model<IPoll>('Poll', PollSchema);
export default Poll;
