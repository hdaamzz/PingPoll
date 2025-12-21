import mongoose, { Schema } from 'mongoose';
import { IMessage } from '../interfaces/message.interface';



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

MessageSchema.index({ pollId: 1, createdAt: -1 });
MessageSchema.index({ userId: 1, createdAt: -1 });

export const Message = mongoose.model<IMessage>('Message', MessageSchema);
