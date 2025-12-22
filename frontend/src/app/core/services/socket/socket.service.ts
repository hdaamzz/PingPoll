import { Injectable, inject, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../auth/auth.service';

export interface ChatMessage {
  id: string;
  pollId: string;
  userId: string;
  userName: string;
  userPicture: string;
  text: string;
  timestamp: Date;
}

export interface TypingUser {
  userId: string;
  userName: string;
  userPicture: string;
}

export interface PollUpdate {
  id: string;
  title: string;
  question: string;
  options: any[];
  totalVotes: number;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private authService = inject(AuthService);
  private socket: Socket | null = null;
  private chatHistory$ = new Subject<any[]>();

  
  private pollUpdated$ = new Subject<PollUpdate>();
  private chatMessage$ = new Subject<ChatMessage>();
  private userTyping$ = new Subject<TypingUser>();
  private userStoppedTyping$ = new Subject<{ userId: string }>();
  private userJoined$ = new Subject<any>();
  private userLeft$ = new Subject<any>();
  private activeUsers$ = new Subject<{ count: number }>();

  isConnected = signal(false);
  private typingTimeout: any;

  connect(): void {
    if (this.socket?.connected) {
      return;
    }

    const user = this.authService.currentUser();
    const token = this.authService.getToken();

    if (!token || !user) {
      console.warn('Cannot connect socket: No authentication token or user');
      setTimeout(() => {
        const retryUser = this.authService.currentUser();
        const retryToken = this.authService.getToken();
        if (retryUser && retryToken) {
          this.connect();
        }
      }, 1000);
      return;
    }

    this.socket = io(environment.api_url.replace('/api', ''), {
      auth: {
        token,
        userName: user.name,
        userPicture: user.picture
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this.setupSocketListeners();
  }

  private setupSocketListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.isConnected.set(true);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.isConnected.set(false);
    });

    this.socket.on('connect_error', (error: any) => {
      console.error('Socket connection error:', error.message);
      this.isConnected.set(false);
    });

    this.socket.on('error', (error: any) => {
      console.error('Socket error:', error);
    });
    this.socket.on('chat:history', (messages: any[]) => {
      this.chatHistory$.next(messages);
    });

    this.socket.on('poll:updated', (data: PollUpdate) => {
      this.pollUpdated$.next(data);
    });

    this.socket.on('chat:message', (message: ChatMessage) => {
      this.chatMessage$.next(message);
    });

    this.socket.on('chat:userTyping', (user: TypingUser) => {
      this.userTyping$.next(user);
    });

    this.socket.on('chat:userStoppedTyping', (data: { userId: string }) => {
      this.userStoppedTyping$.next(data);
    });

    this.socket.on('user:joined', (data: any) => {
      this.userJoined$.next(data);
    });

    this.socket.on('user:left', (data: any) => {
      this.userLeft$.next(data);
    });

    this.socket.on('poll:activeUsers', (data: { count: number }) => {
      this.activeUsers$.next(data);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected.set(false);
    }
  }

  joinPoll(pollId: string): void {
    if (this.socket) {
      this.socket.emit('poll:join', pollId);
    }
  }

  leavePoll(pollId: string): void {
    if (this.socket) {
      this.socket.emit('poll:leave', pollId);
    }
  }

  vote(pollId: string, optionId: string): void {
    if (this.socket) {
      this.socket.emit('vote', { pollId, optionId });
    }
  }

  sendMessage(pollId: string, text: string): void {
    if (this.socket) {
      this.socket.emit('chat:message', { pollId, text });
    }
  }

  startTyping(pollId: string): void {
    if (this.socket) {
      this.socket.emit('chat:typing', pollId);

      clearTimeout(this.typingTimeout);
      this.typingTimeout = setTimeout(() => {
        this.stopTyping(pollId);
      }, 3000);
    }
  }

  stopTyping(pollId: string): void {
    if (this.socket) {
      this.socket.emit('chat:stopTyping', pollId);
      clearTimeout(this.typingTimeout);
    }
  }

  onPollUpdated(): Observable<PollUpdate> {
    return this.pollUpdated$.asObservable();
  }

  onChatMessage(): Observable<ChatMessage> {
    return this.chatMessage$.asObservable();
  }

  onUserTyping(): Observable<TypingUser> {
    return this.userTyping$.asObservable();
  }

  onUserStoppedTyping(): Observable<{ userId: string }> {
    return this.userStoppedTyping$.asObservable();
  }

  onUserJoined(): Observable<any> {
    return this.userJoined$.asObservable();
  }

  onUserLeft(): Observable<any> {
    return this.userLeft$.asObservable();
  }

  onActiveUsers(): Observable<{ count: number }> {
    return this.activeUsers$.asObservable();
  }
  onChatHistory(): Observable<any[]> {
    return this.chatHistory$.asObservable();
  }
}
