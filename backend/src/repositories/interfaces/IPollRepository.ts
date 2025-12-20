import { IPoll } from '../../models/Poll.model.js';

export interface IPollRepository {
  create(pollData: Partial<IPoll>): Promise<IPoll>;
  findById(id: string): Promise<IPoll | null>;
  findAll(isActive?: boolean): Promise<IPoll[]>;
  vote(pollId: string, optionIndex: number, userId: string): Promise<IPoll>;
  hasUserVoted(pollId: string, userId: string): Promise<boolean>;
  updateVoteCount(pollId: string, optionIndex: number): Promise<void>;
  delete(id: string): Promise<void>;
}