import { Document, Types } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;
  googleId: string;
  name: string;
  email: string;
  picture: string;
  emailVerified: boolean;
  isOnline: boolean;
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
}