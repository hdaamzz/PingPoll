import { Schema, model, Document, Types } from 'mongoose';

export interface IMessage extends Document {
  userId: Types.ObjectId;
  username: string;
  content: string;
  messageType: 'text' | 'system';
  isEdited: boolean;
  isDeleted: boolean;
  editedAt?: Date;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  messageType: {
    type: String,
    enum: ['text', 'system'],
    default: 'text'
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  editedAt: Date,
  deletedAt: Date
}, {
  timestamps: true
});

export const Message = model<IMessage>('Message', MessageSchema);