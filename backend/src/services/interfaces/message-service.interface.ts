export interface CreateMessageDto {
  pollId: string;
  userId: string;
  userName: string;
  userPicture: string;
  text: string;
}

export interface MessageDto {
  id: string;
  pollId: string;
  userId: string;
  userName: string;
  userPicture: string;
  text: string;
  timestamp: Date;
}

export interface IMessageService {
  createMessage(data: CreateMessageDto): Promise<MessageDto>;
  getPollMessages(pollId: string, limit?: number): Promise<MessageDto[]>;
  deleteMessage(messageId: string, userId: string): Promise<void>;
  deletePollMessages(pollId: string): Promise<void>;
}
