import mongoose, { Document } from "mongoose";

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