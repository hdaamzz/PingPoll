import { injectable, inject } from 'tsyringe';
import { IMessageRepository } from '../repositories/interfaces/message-repository.interface';
import { IMessageService, CreateMessageDto, MessageDto } from './interfaces/message-service.interface';
import { MESSAGE_MESSAGES } from '../constants/messages.constants';

@injectable()
export class MessageService implements IMessageService {
  constructor(
    @inject('IMessageRepository') private messageRepository: IMessageRepository
  ) {}

  async createMessage(data: CreateMessageDto): Promise<MessageDto> {
    // Validate text
    if (!data.text.trim()) {
      throw new Error(MESSAGE_MESSAGES.MESSAGE_EMPTY);
    }

    if (data.text.length > 1000) {
      throw new Error(MESSAGE_MESSAGES.MESSAGE_TOO_LONG);
    }

    const message = await this.messageRepository.create({
      pollId: data.pollId,
      userId: data.userId,
      userName: data.userName,
      userPicture: data.userPicture,
      text: data.text.trim()
    } as any);

    return this.toDto(message);
  }

  async getPollMessages(pollId: string, limit: number = 100): Promise<MessageDto[]> {
    const messages = await this.messageRepository.findByPollId(pollId, limit);
    return messages.map(msg => this.toDto(msg));
  }

  async deleteMessage(messageId: string, userId: string): Promise<void> {
    const message = await this.messageRepository.findById(messageId);

    if (!message) {
      throw new Error(MESSAGE_MESSAGES.MESSAGE_NOT_FOUND);
    }

    if (message.userId.toString() !== userId) {
      throw new Error(MESSAGE_MESSAGES.MESSAGE_UNAUTHORIZED);
    }

    await this.messageRepository.delete(messageId);
  }

  async deletePollMessages(pollId: string): Promise<void> {
    await this.messageRepository.deleteByPollId(pollId);
  }

  private toDto(message: any): MessageDto {
    return {
      id: message._id.toString(),
      pollId: message.pollId.toString(),
      userId: message.userId.toString(),
      userName: message.userName,
      userPicture: message.userPicture,
      text: message.text,
      timestamp: message.createdAt
    };
  }
}
