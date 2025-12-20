import { IMessageRepository } from './interfaces/IMessageRepository.js';
import { Message, IMessage } from '../models/Message.model.js';

export class MessageRepository implements IMessageRepository {
  async create(messageData: Partial<IMessage>): Promise<IMessage> {
    const message = new Message(messageData);
    return await message.save();
  }

  async findAll(limit: number = 50): Promise<IMessage[]> {
    return await Message.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('userId', 'username');
  }

  async findById(id: string): Promise<IMessage | null> {
    return await Message.findById(id);
  }

  async update(id: string, content: string): Promise<IMessage | null> {
    return await Message.findByIdAndUpdate(
      id,
      { content, isEdited: true, editedAt: new Date() },
      { new: true }
    );
  }

  async softDelete(id: string): Promise<IMessage | null> {
    return await Message.findByIdAndUpdate(
      id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );
  }
}