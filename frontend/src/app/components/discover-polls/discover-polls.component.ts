import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface PollOption {
  id: string;
  text: string;
  percentage: number;
}

interface Poll {
  id: string;
  title: string;
  question: string;
  totalVotes: number;
  options: PollOption[];
}

interface ChatMessage {
  id: string;
  pollId: string;
  author: 'you' | 'other';
  name: string;
  text: string;
  timestamp: Date;
}

@Component({
  selector: 'app-discover-polls',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './discover-polls.component.html',
})
export class DiscoverPollsComponent {
getTotalPolls(): number {
  return this.polls().length;
}

getTotalVotes(): number {
  return this.polls().reduce((sum, poll) => sum + poll.totalVotes, 0);
}

  // Static sample data – replace with API later
  polls = signal<Poll[]>([
    {
      id: '1',
      title: 'Favorite Programming Language',
      question: 'What is your favorite programming language right now?',
      totalVotes: 324,
      options: [
        { id: '1', text: 'TypeScript', percentage: 45 },
        { id: '2', text: 'JavaScript', percentage: 30 },
        { id: '3', text: 'Python', percentage: 20 },
        { id: '4', text: 'Java', percentage: 5 },
      ],
    },
    {
      id: '2',
      title: 'Best Frontend Framework',
      question: 'Which frontend framework do you prefer?',
      totalVotes: 300,
      options: [
        { id: '1', text: 'Angular', percentage: 40 },
        { id: '2', text: 'React', percentage: 35 },
        { id: '3', text: 'Vue', percentage: 20 },
        { id: '4', text: 'Svelte', percentage: 5 },
      ],
    },
    {
      id: '3',
      title: 'Work Setup',
      question: 'What is your preferred work model?',
      totalVotes: 400,
      options: [
        { id: '1', text: 'Fully Remote', percentage: 50 },
        { id: '2', text: 'Hybrid', percentage: 30 },
        { id: '3', text: 'Office', percentage: 15 },
        { id: '4', text: 'Flexible', percentage: 5 },
      ],
    }
  ]);

  selectedPollId = signal<string>('1');

  // Simple in-memory chat messages
  messages = signal<ChatMessage[]>([
    {
      id: 'm1',
      pollId: '1',
      author: 'other',
      name: 'Alex',
      text: 'TypeScript all the way!',
      timestamp: new Date(),
    },
    {
      id: 'm2',
      pollId: '1',
      author: 'you',
      name: 'You',
      text: 'Same here, especially with Angular.',
      timestamp: new Date(),
    },
    {
      id: 'm3',
      pollId: '2',
      author: 'other',
      name: 'Sara',
      text: 'Angular for structured projects.',
      timestamp: new Date(),
    },
  ]);

  newMessageText = signal<string>('');

  selectedPoll = computed(() =>
    this.polls().find((p) => p.id === this.selectedPollId()) ?? this.polls()[0]
  );

  pollMessages = computed(() =>
    this.messages().filter((m) => m.pollId === this.selectedPollId())
  );

  selectPoll(id: string): void {
    this.selectedPollId.set(id);
    this.newMessageText.set('');
  }

  sendMessage(): void {
    const text = this.newMessageText().trim();
    if (!text) return;

    const newMsg: ChatMessage = {
      id: crypto.randomUUID(),
      pollId: this.selectedPollId(),
      author: 'you',
      name: 'You',
      text,
      timestamp: new Date(),
    };

    this.messages.update((msgs) => [...msgs, newMsg]);
    this.newMessageText.set('');

    // TODO: emit via WebSocket / Socket.IO in real implementation
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
