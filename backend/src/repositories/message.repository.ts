import { injectable } from 'tsyringe';
import { BaseRepository } from './base/base.repository';
import { IMessageRepository } from './interfaces/message-repository.interface';
import { IMessage, Message } from '../models/message.model';

@injectable()
export class MessageRepository extends BaseRepository<IMessage> implements IMessageRepository {
  constructor() {
    super(Message);
  }

  async findByPollId(pollId: string, limit: number = 100): Promise<IMessage[]> {
    return await this.model
      .find({ pollId })
      .sort({ createdAt: 1 })
      .limit(limit)
      .exec();
  }

  async deleteByPollId(pollId: string): Promise<void> {
    await this.model.deleteMany({ pollId }).exec();
  }

  async countByPollId(pollId: string): Promise<number> {
    return await this.model.countDocuments({ pollId }).exec();
  }
}
