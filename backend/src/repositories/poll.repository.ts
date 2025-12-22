import { injectable } from 'tsyringe';
import { BaseRepository } from './base/base.repository';
import { IPollRepository } from './interfaces/poll-repository.interface';
import { IPoll } from '../interfaces/poll.interface';
import { Poll } from '../models/poll.model';

@injectable()
export class PollRepository extends BaseRepository<IPoll> implements IPollRepository {
  constructor() {
    super(Poll);
  }

  async findByCreator(userId: string): Promise<IPoll[]> {
    return await this.model
      .find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findActivePolls(): Promise<IPoll[]> {
    return await this.model
      .find({ status: 'active' })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByIdWithCreator(pollId: string): Promise<IPoll | null> {
    return await this.model
      .findById(pollId)
      .populate('createdBy', 'name email picture')
      .exec();
  }

  async updateVote(pollId: string, optionId: string, userId: string): Promise<IPoll | null> {
    const poll = await this.findById(pollId);
    if (!poll) return null;

    const option = poll.options.find(opt => opt.id === optionId);
    if (!option) return null;

    if (option.votedBy.includes(userId)) {
      return poll;
    }

    poll.options.forEach(opt => {
      const index = opt.votedBy.indexOf(userId);
      if (index > -1) {
        opt.votedBy.splice(index, 1);
        opt.votes = Math.max(0, opt.votes - 1);
        poll.totalVotes = Math.max(0, poll.totalVotes - 1);
      }
    });

    option.votedBy.push(userId);
    option.votes += 1;
    poll.totalVotes += 1;

    await poll.save();
    return poll;
  }

  async removeVote(pollId: string, optionId: string, userId: string): Promise<IPoll | null> {
    const poll = await this.findById(pollId);
    if (!poll) return null;

    const option = poll.options.find(opt => opt.id === optionId);
    if (!option) return null;

    const index = option.votedBy.indexOf(userId);
    if (index > -1) {
      option.votedBy.splice(index, 1);
      option.votes = Math.max(0, option.votes - 1);
      poll.totalVotes = Math.max(0, poll.totalVotes - 1);
      await poll.save();
    }

    return poll;
  }
}
