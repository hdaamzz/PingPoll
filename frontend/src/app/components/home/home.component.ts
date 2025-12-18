import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
features = signal([
    {
      title: 'Real-Time Polling',
      description: 'Create polls and see results update instantly as votes come in'
    },
    {
      title: 'Live Chat',
      description: 'Engage in real-time conversations with typing indicators'
    },
    {
      title: 'Secure & Private',
      description: 'Google authentication ensures secure access to your polls'
    },
    {
      title: 'Lightning Fast',
      description: 'Built with modern tech stack for blazing fast performance'
    }
  ]);

  activeFeature = signal(0);

  constructor(private router: Router) {}

  handleGoogleLogin(): void {
    // Implement Google OAuth login
    window.location.href = 'http://localhost:3000/api/auth/google';
  }

  scrollToFeatures(): void {
    document.getElementById('features')?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  }

  setActiveFeature(index: number): void {
    this.activeFeature.set(index);
  }
}
