import { injectable, inject } from 'tsyringe';
import { Server } from 'socket.io';
import { IPollRepository } from '../repositories/interfaces/poll-repository.interface';
import { IMessageService } from './interfaces/message-service.interface';
import { PollDto } from '../shared/dtos/poll/poll.dto';
import { JwtUtil } from '../shared/utils/jwt.util';
import { TypingUser, UserSocket } from './interfaces/socket.interface';

@injectable()
export class SocketService {
  private io!: Server;
  private pollRooms = new Map<string, Set<string>>();
  private typingUsers = new Map<string, Map<string, TypingUser>>();

  constructor(
    @inject('IPollRepository') private pollRepository: IPollRepository,
    @inject('IMessageService') private messageService: IMessageService
  ) {}

  initialize(io: Server): void {
    this.io = io;

    this.io.use(async (socket: UserSocket, next) => {
      try {
        const token = socket.handshake.auth.token;
        
        if (!token) {
          console.error('Socket auth failed: No token provided');
          return next(new Error('Authentication token required'));
        }

        const decoded = JwtUtil.verifyAccessToken(token);
        
        if (!decoded || !decoded.userId) {
          console.error('Socket auth failed: Invalid token');
          return next(new Error('Invalid authentication token'));
        }

        socket.userId = decoded.userId;
        socket.userName = socket.handshake.auth.userName || 'Anonymous';
        socket.userPicture = socket.handshake.auth.userPicture || '';

        next();
      } catch (error: any) {
        console.error('Socket auth error:', error.message);
        
        if (error.name === 'TokenExpiredError') {
          next(new Error('Token expired. Please refresh your connection.'));
        } else {
          next(new Error('Authentication failed: ' + error.message));
        }
      }
    });

    this.io.on('connection', (socket: UserSocket) => {
      console.log('User connected:', socket.userId);

      this.handlePollJoin(socket);
      this.handlePollLeave(socket);
      this.handleVote(socket);
      this.handleChatMessage(socket);
      this.handleTyping(socket);
      this.handleStopTyping(socket);
      this.handleDisconnect(socket);
    });
  }

  private handlePollJoin(socket: UserSocket): void {
    socket.on('poll:join', async (pollId: string) => {
      try {
        const poll = await this.pollRepository.findById(pollId);
        
        if (!poll) {
          socket.emit('error', { message: 'Poll not found' });
          return;
        }

        socket.join(`poll:${pollId}`);

        if (!this.pollRooms.has(pollId)) {
          this.pollRooms.set(pollId, new Set());
        }
        this.pollRooms.get(pollId)!.add(socket.userId!);

        const pollDto = PollDto.fromModel(poll);
        socket.emit('poll:data', pollDto.toJSON());

        const messages = await this.messageService.getPollMessages(pollId, 100);
        socket.emit('chat:history', messages);

        socket.to(`poll:${pollId}`).emit('user:joined', {
          userId: socket.userId,
          userName: socket.userName,
          userPicture: socket.userPicture,
          activeUsers: this.pollRooms.get(pollId)!.size
        });

        socket.emit('poll:activeUsers', {
          count: this.pollRooms.get(pollId)!.size
        });

      } catch (error) {
        console.error('Error joining poll:', error);
        socket.emit('error', { message: 'Failed to join poll' });
      }
    });
  }

  private handlePollLeave(socket: UserSocket): void {
    socket.on('poll:leave', (pollId: string) => {
      this.leavePoll(socket, pollId);
    });
  }

  private handleVote(socket: UserSocket): void {
    socket.on('vote', async (data: { pollId: string; optionId: string }) => {
      try {
        const { pollId, optionId } = data;
        
        const updatedPoll = await this.pollRepository.updateVote(
          pollId,
          optionId,
          socket.userId!
        );

        if (!updatedPoll) {
          socket.emit('error', { message: 'Failed to record vote' });
          return;
        }

        const pollDto = PollDto.fromModel(updatedPoll);
        this.io.to(`poll:${pollId}`).emit('poll:updated', pollDto.toJSON());

        socket.emit('vote:success', {
          pollId,
          optionId,
          message: 'Vote recorded successfully'
        });
      } catch (error) {
        console.error('Error recording vote:', error);
        socket.emit('error', { message: 'Failed to record vote' });
      }
    });
  }

  private handleChatMessage(socket: UserSocket): void {
    socket.on('chat:message', async (data: { pollId: string; text: string }) => {
      try {
        const { pollId, text } = data;

        if (!text.trim()) {
          return;
        }
        
        const savedMessage = await this.messageService.createMessage({
          pollId,
          userId: socket.userId!,
          userName: socket.userName!,
          userPicture: socket.userPicture!,
          text: text.trim()
        });
        
        this.io.to(`poll:${pollId}`).emit('chat:message', savedMessage);

        this.clearTyping(pollId, socket.userId!);

      } catch (error: any) {
        console.error('Error sending chat message:', error);
        socket.emit('error', { message: error.message || 'Failed to send message' });
      }
    });
  }

  private handleTyping(socket: UserSocket): void {
    socket.on('chat:typing', (pollId: string) => {
      if (!this.typingUsers.has(pollId)) {
        this.typingUsers.set(pollId, new Map());
      }

      const typingUser: TypingUser = {
        userId: socket.userId!,
        userName: socket.userName!,
        userPicture: socket.userPicture!
      };

      this.typingUsers.get(pollId)!.set(socket.userId!, typingUser);

      socket.to(`poll:${pollId}`).emit('chat:userTyping', typingUser);
    });
  }

  private handleStopTyping(socket: UserSocket): void {
    socket.on('chat:stopTyping', (pollId: string) => {
      this.clearTyping(pollId, socket.userId!);
    });
  }

  private clearTyping(pollId: string, userId: string): void {
    if (this.typingUsers.has(pollId)) {
      this.typingUsers.get(pollId)!.delete(userId);

      this.io.to(`poll:${pollId}`).emit('chat:userStoppedTyping', { userId });
    }
  }

  private handleDisconnect(socket: UserSocket): void {
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.userId);

      this.pollRooms.forEach((users, pollId) => {
        if (users.has(socket.userId!)) {
          this.leavePoll(socket, pollId);
        }
      });
    });
  }

  private leavePoll(socket: UserSocket, pollId: string): void {
    socket.leave(`poll:${pollId}`);

    if (this.pollRooms.has(pollId)) {
      this.pollRooms.get(pollId)!.delete(socket.userId!);

      socket.to(`poll:${pollId}`).emit('user:left', {
        userId: socket.userId,
        userName: socket.userName,
        activeUsers: this.pollRooms.get(pollId)!.size
      });

      this.clearTyping(pollId, socket.userId!);

      if (this.pollRooms.get(pollId)!.size === 0) {
        this.pollRooms.delete(pollId);
        this.typingUsers.delete(pollId);
      }
    }
  }

  getIO(): Server {
    return this.io;
  }
}
