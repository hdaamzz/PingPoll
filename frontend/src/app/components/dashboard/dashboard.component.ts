import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service';

interface Poll {
  id: string;
  title: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  status: 'active' | 'closed' | 'draft';
  createdAt: Date;
  expiresAt: Date;
}

interface PollOption {
  id: string;
  text: string;
  votes: number;
  percentage: number;
}

interface DashboardStats {
  totalPolls: number;
  activePolls: number;
  totalVotes: number;
}

interface RecentActivity {
  id: string;
  type: 'vote' | 'poll_created' | 'poll_closed' | 'comment';
  message: string;
  timestamp: Date;
  pollTitle?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser = this.authService.currentUser;
  showUserMenu = signal(false);
  selectedTab = signal<'overview' | 'polls' | 'analytics' | 'settings'>('overview');

  // Dashboard data
  stats = signal<DashboardStats>({
    totalPolls: 12,
    activePolls: 5,
    totalVotes: 1247
  });

  polls = signal<Poll[]>([
    {
      id: '1',
      title: 'Favorite Programming Language',
      question: 'What is your favorite programming language?',
      options: [
        { id: '1', text: 'TypeScript', votes: 145, percentage: 45 },
        { id: '2', text: 'JavaScript', votes: 98, percentage: 30 },
        { id: '3', text: 'Python', votes: 65, percentage: 20 },
        { id: '4', text: 'Java', votes: 16, percentage: 5 },
      ],
      totalVotes: 324,
      status: 'active',
      createdAt: new Date('2025-12-18'),
      expiresAt: new Date('2025-12-25')
    },
    {
      id: '2',
      title: 'Best Frontend Framework',
      question: 'Which frontend framework do you prefer?',
      options: [
        { id: '1', text: 'Angular', votes: 120, percentage: 40 },
        { id: '2', text: 'React', votes: 105, percentage: 35 },
        { id: '3', text: 'Vue', votes: 60, percentage: 20 },
        { id: '4', text: 'Svelte', votes: 15, percentage: 5 },
      ],
      totalVotes: 300,
      status: 'active',
      createdAt: new Date('2025-12-19'),
      expiresAt: new Date('2025-12-26')
    },
    {
      id: '3',
      title: 'Remote Work Preference',
      question: 'What is your preferred work model?',
      options: [
        { id: '1', text: 'Fully Remote', votes: 200, percentage: 50 },
        { id: '2', text: 'Hybrid', votes: 120, percentage: 30 },
        { id: '3', text: 'Office', votes: 60, percentage: 15 },
        { id: '4', text: 'Flexible', votes: 20, percentage: 5 },
      ],
      totalVotes: 400,
      status: 'closed',
      createdAt: new Date('2025-12-15'),
      expiresAt: new Date('2025-12-20')
    },
  ]);

  recentActivity = signal<RecentActivity[]>([
    {
      id: '1',
      type: 'vote',
      message: 'New vote on "Favorite Programming Language"',
      timestamp: new Date('2025-12-20T15:30:00'),
      pollTitle: 'Favorite Programming Language',
    },
    {
      id: '2',
      type: 'poll_created',
      message: 'Created new poll "Best Frontend Framework"',
      timestamp: new Date('2025-12-20T14:15:00'),
      pollTitle: 'Best Frontend Framework',
    },
    {
      id: '3',
      type: 'vote',
      message: '5 new votes on "Remote Work Preference"',
      timestamp: new Date('2025-12-20T13:45:00'),
      pollTitle: 'Remote Work Preference',
    },
    {
      id: '4',
      type: 'poll_closed',
      message: 'Poll "Remote Work Preference" has closed',
      timestamp: new Date('2025-12-20T12:00:00'),
      pollTitle: 'Remote Work Preference',
    },
  ]);

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
    }
  }

  toggleUserMenu(): void {
    this.showUserMenu.update(value => !value);
  }

  selectTab(tab: 'overview' | 'polls'): void {
    this.selectedTab.set(tab);
  }

  handleLogout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Logout failed:', error);
      },
    });
  }

  navigateToHome(): void {
    this.router.navigate(['/']);
  }

  createNewPoll(): void {
    this.router.navigate(['/polls/create'])
    console.log('Create new poll');
  }

  viewPoll(pollId: string): void {
    console.log('View poll:', pollId);
  }

  editPoll(pollId: string): void {
    console.log('Edit poll:', pollId);
  }

  deletePoll(pollId: string): void {
    console.log('Delete poll:', pollId);
    this.polls.update(polls => polls.filter(p => p.id !== pollId));
  }

  getActivityIcon(type: string): string {
    const icons = {
      vote: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      poll_created: 'M12 4v16m8-8H4',
      poll_closed: 'M6 18L18 6M6 6l12 12',
      comment: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
    };
    return icons[type as keyof typeof icons] || icons.vote;
  }

  getStatusColor(status: string): string {
    const colors = {
      active: 'bg-green-500/10 text-green-500 border-green-500/30',
      closed: 'bg-gray-500/10 text-gray-500 border-gray-500/30',
      draft: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
    };
    return colors[status as keyof typeof colors] || colors.active;
  }

  formatTimeAgo(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  }

  ngOnDestroy(): void {
    
  }
}
