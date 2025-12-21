import { injectable, inject } from 'tsyringe';
import { Server, Socket } from 'socket.io';
import { IPollRepository } from '../repositories/interfaces/poll-repository.interface';
import { PollDto } from '../shared/dtos/poll/poll.dto';
import { JwtUtil } from '../shared/utils/jwt.util';

interface UserSocket extends Socket {
  userId?: string;
  userName?: string;
  userPicture?: string;
}

interface ChatMessage {
  id: string;
  pollId: string;
  userId: string;
  userName: string;
  userPicture: string;
  text: string;
  timestamp: Date;
}

interface TypingUser {
  userId: string;
  userName: string;
  userPicture: string;
}

@injectable()
export class SocketService {
  private io!: Server;
  private pollRooms = new Map<string, Set<string>>(); // pollId -> Set of userIds
  private typingUsers = new Map<string, Map<string, TypingUser>>(); // pollId -> Map of userId -> TypingUser

  constructor(
    @inject('IPollRepository') private pollRepository: IPollRepository
  ) {}

  initialize(io: Server): void {
    this.io = io;

    // Authentication middleware
    this.io.use(async (socket: UserSocket, next) => {
      try {
        const token = socket.handshake.auth.token;
        
        if (!token) {
          return next(new Error('Authentication required'));
        }

        const decoded = JwtUtil.verifyToken(token);
        socket.userId = decoded.userId;
        socket.userName = socket.handshake.auth.userName || 'Anonymous';
        socket.userPicture = socket.handshake.auth.userPicture || '';

        next();
      } catch (error) {
        next(new Error('Invalid token'));
      }
    });

    this.io.on('connection', (socket: UserSocket) => {
      console.log(`User connected: ${socket.userId} (${socket.userName})`);

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

        // Join the poll room
        socket.join(`poll:${pollId}`);

        // Track user in room
        if (!this.pollRooms.has(pollId)) {
          this.pollRooms.set(pollId, new Set());
        }
        this.pollRooms.get(pollId)!.add(socket.userId!);

        const pollDto = PollDto.fromModel(poll);
        socket.emit('poll:data', pollDto.toJSON());

        socket.to(`poll:${pollId}`).emit('user:joined', {
          userId: socket.userId,
          userName: socket.userName,
          userPicture: socket.userPicture,
          activeUsers: this.pollRooms.get(pollId)!.size
        });

        socket.emit('poll:activeUsers', {
          count: this.pollRooms.get(pollId)!.size
        });

        console.log(`User ${socket.userName} joined poll ${pollId}`);
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

        console.log(`User ${socket.userName} voted on poll ${pollId}, option ${optionId}`);
      } catch (error) {
        console.error('Error recording vote:', error);
        socket.emit('error', { message: 'Failed to record vote' });
      }
    });
  }

  private handleChatMessage(socket: UserSocket): void {
    socket.on('chat:message', (data: { pollId: string; text: string }) => {
      try {
        const { pollId, text } = data;

        if (!text.trim()) {
          return;
        }

        const message: ChatMessage = {
          id: crypto.randomUUID(),
          pollId,
          userId: socket.userId!,
          userName: socket.userName!,
          userPicture: socket.userPicture!,
          text: text.trim(),
          timestamp: new Date()
        };

        this.io.to(`poll:${pollId}`).emit('chat:message', message);

        this.clearTyping(pollId, socket.userId!);

        console.log(`Chat message in poll ${pollId} from ${socket.userName}: ${text}`);
      } catch (error) {
        console.error('Error sending chat message:', error);
        socket.emit('error', { message: 'Failed to send message' });
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
      console.log(`User disconnected: ${socket.userId} (${socket.userName})`);

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

    console.log(`User ${socket.userName} left poll ${pollId}`);
  }

  getIO(): Server {
    return this.io;
  }
}
