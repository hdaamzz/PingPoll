import mongoose, { Document } from "mongoose";

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