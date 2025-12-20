import { IPollRepository } from './interfaces/IPollRepository.js';
import { Poll, IPoll } from '../models/Poll.model.js';
import { Types } from 'mongoose';

export class PollRepository implements IPollRepository {
  async create(pollData: Partial<IPoll>): Promise<IPoll> {
    const poll = new Poll(pollData);
    return await poll.save();
  }

  async findById(id: string): Promise<IPoll | null> {
    return await Poll.findById(id).populate('createdBy', 'username');
  }

  async findAll(isActive?: boolean): Promise<IPoll[]> {
    const query = isActive !== undefined ? { isActive } : {};
    return await Poll.find(query)
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });
  }

  async vote(pollId: string, optionIndex: number, userId: string): Promise<IPoll> {
    const poll = await Poll.findById(pollId);
    if (!poll) throw new Error('Poll not found');
    
    if (!poll.allowMultipleVotes) {
      const hasVoted = await this.hasUserVoted(pollId, userId);
      if (hasVoted) throw new Error('User has already voted');
    }

    poll.options[optionIndex].votes.push({
      userId: new Types.ObjectId(userId),
      votedAt: new Date()
    });
    
    poll.options[optionIndex].voteCount += 1;
    
    return await poll.save();
  }

  async hasUserVoted(pollId: string, userId: string): Promise<boolean> {
    const poll = await Poll.findById(pollId);
    if (!poll) return false;
    
    return poll.options.some(option => 
      option.votes.some(vote => vote.userId.toString() === userId)
    );
  }

  async updateVoteCount(pollId: string, optionIndex: number): Promise<void> {
    await Poll.updateOne(
      { _id: pollId },
      { $inc: { [`options.${optionIndex}.voteCount`]: 1 } }
    );
  }

  async delete(id: string): Promise<void> {
    await Poll.findByIdAndDelete(id);
  }
}