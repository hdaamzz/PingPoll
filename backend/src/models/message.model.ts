import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  _id: mongoose.Types.ObjectId;
  pollId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  userName: string;
  userPicture: string;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  pollId: {
    type: Schema.Types.ObjectId,
    ref: 'Poll',
    required: true,
    index: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true,
    trim: true
  },
  userPicture: {
    type: String,
    default: ''
  },
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  }
}, {
  timestamps: true
});

// Index for efficient querying
// MessageSchema.index({ pollId: 1, createdAt: -1 });
// MessageSchema.index({ userId: 1, createdAt: -1 });

export const Message = mongoose.model<IMessage>('Message', MessageSchema);
