import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service';
import { PollService, Poll, CreatePollRequest } from '../../core/services/poll/poll.service';

interface DashboardStats {
  totalPolls: number;
  activePolls: number;
  totalVotes: number;
}

interface PollOptionForm {
  id: string;
  text: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit, OnDestroy {
  _authService = inject(AuthService);
  _pollService = inject(PollService);
  _router = inject(Router);

  currentUser = this._authService.currentUser;
  showUserMenu = signal(false);
  selectedTab = signal<'overview' | 'polls' | 'create'>('overview');
  deleteDialogOpen = signal(false);
  pollToDelete = signal<string | null>(null);
  pollTitle = signal('');


  polls = signal<Poll[]>([]);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  isSidebarOpen = signal(false);

  stats = signal<DashboardStats>({
    totalPolls: 0,
    activePolls: 0,
    totalVotes: 0
  });

  title = signal('');
  question = signal('');
  options = signal<PollOptionForm[]>([
    { id: '1', text: '' },
    { id: '2', text: '' },
  ]);
  expiresAt = signal<string>('');
  isSubmitting = signal(false);
  createErrorMessage = signal<string | null>(null);

  ngOnInit(): void {
    if (!this._authService.isAuthenticated()) {
      this._router.navigate(['/']);
      return;
    }
    this.loadUserPolls();
  }

  loadUserPolls(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this._pollService.getUserPolls().subscribe({
      next: (polls) => {
        this.polls.set(polls);
        this.updateStats(polls);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to load polls:', error);
        this.errorMessage.set('Failed to load polls');
        this.isLoading.set(false);
      },
    });
  }

  updateStats(polls: Poll[]): void {
    const totalVotes = polls.reduce((sum, poll) => sum + poll.totalVotes, 0);
    const activePolls = polls.filter(p => p.status === 'active').length;

    this.stats.set({
      totalPolls: polls.length,
      activePolls: activePolls,
      totalVotes: totalVotes
    });
  }

  toggleUserMenu(): void {
    this.showUserMenu.update(value => !value);
  }

  selectTab(tab: 'overview' | 'polls' | 'create'): void {
    this.selectedTab.set(tab);
    if (tab === 'create') {
      this.resetCreateForm();
    }
    if (window.innerWidth < 1024) {
    this.closeSidebar();
  }
  }

  handleLogout(): void {
    this._authService.logout().subscribe({
      next: () => {
        this._router.navigate(['/']);
      },
      error: (error) => {
        console.error('Logout failed:', error);
      },
    });
  }

  navigateToHome(): void {
    this._router.navigate(['/']);
  }

  createNewPoll(): void {
    this.selectTab('create');
  }
  openDeleteDialog(pollId: string): void {
    const poll = this.polls().find(p => p.id === pollId);
    if (poll) {
      this.pollToDelete.set(pollId);
      this.pollTitle.set(poll.title);
      this.deleteDialogOpen.set(true);
    }
  }

  closeDeleteDialog(): void {
    this.deleteDialogOpen.set(false);
    this.pollToDelete.set(null);
    this.pollTitle.set('');
  }

  confirmDeletePoll(): void {
    const pollId = this.pollToDelete();
    if (!pollId) return;

    this._pollService.deletePoll(pollId).subscribe({
      next: () => {
        this.polls.update(polls => polls.filter(p => p.id !== pollId));
        this.updateStats(this.polls());
        this.closeDeleteDialog();
      },
      error: (error) => {
        console.error('Failed to delete poll:', error);
        alert('Failed to delete poll: ' + error.message);
        this.closeDeleteDialog();
      },
    });
  }
  addOption(): void {
    const current = this.options();
    if (current.length >= 6) return;
    const nextId = (current.length + 1).toString();
    this.options.set([...current, { id: nextId, text: '' }]);
  }

  removeOption(id: string): void {
    const current = this.options();
    if (current.length <= 2) return;
    this.options.set(current.filter(o => o.id !== id));
  }

  updateOptionText(id: string, value: string): void {
    this.options.update(opts =>
      opts.map(o => (o.id === id ? { ...o, text: value } : o)),
    );
  }

  resetCreateForm(): void {
    this.title.set('');
    this.question.set('');
    this.options.set([
      { id: '1', text: '' },
      { id: '2', text: '' },
    ]);
    this.expiresAt.set('');
    this.createErrorMessage.set(null);
  }

  cancelCreate(): void {
    this.resetCreateForm();
    this.selectTab('overview');
  }

  submitPoll(): void {
    this.createErrorMessage.set(null);

    if (!this.title().trim() || !this.question().trim()) {
      this.createErrorMessage.set('Title and question are required');
      return;
    }

    const filledOptions = this.options()
      .map(o => ({ ...o, text: o.text.trim() }))
      .filter(o => o.text.length > 0);

    if (filledOptions.length < 2) {
      this.createErrorMessage.set('At least 2 options are required');
      return;
    }

    this.isSubmitting.set(true);

    const pollData: CreatePollRequest = {
      title: this.title(),
      question: this.question(),
      options: filledOptions,
    };

    if (this.expiresAt()) {
      pollData.expiresAt = new Date(this.expiresAt());
    }

    this._pollService.createPoll(pollData).subscribe({
      next: (poll) => {
        console.log('Poll created:', poll);
        this.resetCreateForm();
        this.isSubmitting.set(false);
        this.loadUserPolls(); 
        this.selectTab('polls');
      },
      error: (error) => {
        console.error('Failed to create poll:', error);
        this.createErrorMessage.set(error.message || 'Failed to create poll');
        this.isSubmitting.set(false);
      },
    });
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/40';
      case 'closed':
        return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'draft':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/40';
    }
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

  ngOnDestroy(): void {}
  toggleSidebar() {
    this.isSidebarOpen.set(!this.isSidebarOpen());
  }
  closeSidebar() {
    this.isSidebarOpen.set(false);
  }
}
