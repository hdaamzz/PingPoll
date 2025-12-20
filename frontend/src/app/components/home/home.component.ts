import { Component, signal, inject, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = this.authService.loading;
  currentUser = this.authService.currentUser;
  isAuthenticated = this.authService.isAuthenticated;

  private loginSubscription?: Subscription;

  features = signal([
    {
      title: 'Real-Time Polling',
      description: 'Create polls and see results update instantly as votes come in',
    },
    {
      title: 'Live Chat',
      description: 'Engage in real-time conversations with typing indicators',
    },
    {
      title: 'Secure & Private',
      description: 'Google authentication ensures secure access to your polls',
    },
    {
      title: 'Lightning Fast',
      description: 'Built with modern tech stack for blazing fast performance',
    },
  ]);

  activeFeature = signal(0);
  showUserMenu = signal(false);

  ngOnInit(): void {
    // Check if user is already authenticated
    if (this.isAuthenticated()) {
      console.log('User is authenticated:', this.currentUser());
    }
  }

  handleGoogleLogin(): void {
    if (this.loading()) {
      return;
    }

    this.loginSubscription = this.authService.googleSignIn().subscribe({
      next: () => {
        console.log('✅ Login successful');
      },
      error: (error) => {
        console.error('❌ Login failed:', error);
      },
    });
  }

  handleLogout(): void {
    this.authService.logout().subscribe({
      next: () => {
        console.log('✅ Logged out successfully');
        this.showUserMenu.set(false);
      },
      error: (error) => {
        console.error('❌ Logout failed:', error);
      },
    });
  }

  toggleUserMenu(): void {
    this.showUserMenu.update(value => !value);
  }

  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
    this.showUserMenu.set(false);
  }

  navigateToDiscover(): void {
    this.router.navigate(['/discover']);
    this.showUserMenu.set(false);
  }

  scrollToFeatures(): void {
    document.getElementById('features')?.scrollIntoView({
      behavior: 'smooth',
    });
  }

  setActiveFeature(index: number): void {
    this.activeFeature.set(index);
  }

  ngOnDestroy(): void {
    this.loginSubscription?.unsubscribe();
  }
}
