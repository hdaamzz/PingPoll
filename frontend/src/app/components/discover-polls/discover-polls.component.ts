import { Component, inject, signal, computed, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SocketService, ChatMessage as SocketChatMessage, TypingUser } from '../../core/services/socket/socket.service';
import { AuthService } from '../../core/services/auth/auth.service';
import { PollService } from '../../core/services/poll/poll.service';
import { Subscription } from 'rxjs';

interface PollOption {
  id: string;
  text: string;
  votes: number;
  percentage: number;
}

interface Poll {
  id: string;
  title: string;
  question: string;
  totalVotes: number;
  options: PollOption[];
  status: string;
}

interface ChatMessage {
  id: string;
  pollId: string;
  userId: string;
  userName: string;
  userPicture: string;
  text: string;
  timestamp: Date;
  isCurrentUser: boolean;
}

@Component({
  selector: 'app-discover-polls',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './discover-polls.component.html',
})
export class DiscoverPollsComponent implements OnInit, OnDestroy {

  private socketService = inject(SocketService);
  private authService = inject(AuthService);
  private pollService = inject(PollService);
  private router = inject(Router);
  
  private subscriptions: Subscription[] = [];
  private typingTimeouts = new Map<string, any>();

  polls = signal<Poll[]>([]);
  selectedPollId = signal<string>('');
  messages = signal<ChatMessage[]>([]);
  newMessageText = signal<string>('');
  typingUsers = signal<TypingUser[]>([]);
  activeUsersCount = signal<number>(0);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);
  isConnected = this.socketService.isConnected;

  currentUser = computed(() => this.authService.currentUser());

  selectedPoll = computed(() => {
    const polls = this.polls();
    const selectedId = this.selectedPollId();
    return polls.find((p) => p.id === selectedId) || polls[0];
  });

  pollMessages = computed(() =>
    this.messages().filter((m) => m.pollId === this.selectedPollId())
  );

  typingUsersText = computed(() => {
    const users = this.typingUsers();
    if (users.length === 0) return '';
    if (users.length === 1) return `${users[0].userName} is typing...`;
    if (users.length === 2) return `${users[0].userName} and ${users[1].userName} are typing...`;
    return `${users[0].userName} and ${users.length - 1} others are typing...`;
  });

  ngOnInit(): void {
    if (!this.authService.isUserAuthenticated()) {
      console.warn('User not authenticated, redirecting...');
      this.router.navigate(['/']);
      return;
    }
    this.subscriptions.push(
      this.socketService.onChatHistory().subscribe((messages) => {
        this.messages.set(messages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
          isCurrentUser: msg.userId === this.currentUser()?.id
        })));
      })
    );

    this.loadActivePolls();
  }
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  ngAfterViewChecked() {
    if (this.messagesContainer) {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    }
  }

  private loadActivePolls(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.pollService.getActivePolls().subscribe({
      next: (polls) => {
        
        if (polls.length === 0) {
          this.errorMessage.set('No active polls available. Create one to get started!');
          this.isLoading.set(false);
          return;
        }

        this.polls.set(polls);
        this.selectedPollId.set(polls[0].id);
        this.isLoading.set(false);

        this.initializeSocket();
      },
      error: (error) => {
        console.error('Failed to load polls:', error);
        this.errorMessage.set('Failed to load polls. Please refresh the page.');
        this.isLoading.set(false);
      }
    });
  }

  private initializeSocket(): void {
    
    this.socketService.connect();

    setTimeout(() => {
      this.subscriptions.push(
        this.socketService.onPollUpdated().subscribe((poll) => {
          this.updatePoll(poll);
        }),

        this.socketService.onChatMessage().subscribe((message) => {
          this.addMessage(message);
        }),

        this.socketService.onUserTyping().subscribe((user) => {
          this.addTypingUser(user);
        }),

        this.socketService.onUserStoppedTyping().subscribe(({ userId }) => {
          this.removeTypingUser(userId);
        }),

        this.socketService.onActiveUsers().subscribe(({ count }) => {
          this.activeUsersCount.set(count);
        })
      );

      setTimeout(() => {
        if (this.isConnected()) {
          this.joinCurrentPoll();
        } else {
          console.warn('Socket not connected, retrying...');
          setTimeout(() => this.joinCurrentPoll(), 1000);
        }
      }, 500);
    }, 300);
  }

  ngOnDestroy(): void {
    const pollId = this.selectedPollId();
    if (pollId) {
      this.socketService.leavePoll(pollId);
    }

    this.subscriptions.forEach(sub => sub.unsubscribe());

    this.socketService.disconnect();
  }

  getTotalPolls(): number {
    return this.polls().length;
  }

  getTotalVotes(): number {
    return this.polls().reduce((sum, poll) => sum + poll.totalVotes, 0);
  }

  selectPoll(id: string): void {
    const currentPollId = this.selectedPollId();
    if (currentPollId === id) return;

    if (currentPollId) {
      this.socketService.leavePoll(currentPollId);
    }

    this.selectedPollId.set(id);
    this.newMessageText.set('');

    this.typingUsers.set([]);

    this.joinCurrentPoll();
  }

  private joinCurrentPoll(): void {
    const pollId = this.selectedPollId();
    if (!pollId) {
      console.warn('No poll ID to join');
      return;
    }

    if (!this.isConnected()) {
      console.warn('Socket not connected, cannot join poll');
      return;
    }

    this.socketService.joinPoll(pollId);
  }

  voteOption(optionId: string): void {
    const pollId = this.selectedPollId();
    if (!pollId || !this.isConnected()) {
      console.warn('Cannot vote: No poll selected or socket not connected');
      return;
    }

    this.socketService.vote(pollId, optionId);
  }

  sendMessage(): void {
    const text = this.newMessageText().trim();
    if (!text) return;

    const pollId = this.selectedPollId();
    if (!pollId || !this.isConnected()) {
      console.warn('Cannot send message: No poll selected or socket not connected');
      return;
    }

    this.socketService.sendMessage(pollId, text);
    this.socketService.stopTyping(pollId);
    
    this.newMessageText.set('');
  }

  onMessageInput(): void {
    const pollId = this.selectedPollId();
    if (!pollId || !this.isConnected()) return;

    this.socketService.startTyping(pollId);
  }

  refreshPolls(): void {
    this.loadActivePolls();
  }

  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  private updatePoll(updatedPoll: any): void {
    this.polls.update(polls =>
      polls.map(poll =>
        poll.id === updatedPoll.id ? { 
          ...poll, 
          options: updatedPoll.options,
          totalVotes: updatedPoll.totalVotes 
        } : poll
      )
    );
  }

  private addMessage(socketMessage: SocketChatMessage): void {
    const currentUser = this.currentUser();
    const message: ChatMessage = {
      ...socketMessage,
      timestamp: new Date(socketMessage.timestamp),
      isCurrentUser: socketMessage.userId === currentUser?.id
    };

    this.messages.update(msgs => [...msgs, message]);

    setTimeout(() => {
      const chatContainer = document.querySelector('.chat-messages-container');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 100);
  }

  private addTypingUser(user: TypingUser): void {
    const currentUser = this.currentUser();
    
    if (user.userId === currentUser?.id) return;

    this.typingUsers.update(users => {
      const exists = users.find(u => u.userId === user.userId);
      if (exists) return users;
      return [...users, user];
    });

    const timeout = setTimeout(() => {
      this.removeTypingUser(user.userId);
    }, 3000);

    this.typingTimeouts.set(user.userId, timeout);
  }

  private removeTypingUser(userId: string): void {
    this.typingUsers.update(users =>
      users.filter(u => u.userId !== userId)
    );

    const timeout = this.typingTimeouts.get(userId);
    if (timeout) {
      clearTimeout(timeout);
      this.typingTimeouts.delete(userId);
    }
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  navigateToHome() {
    this.router.navigate(['/'])
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}
