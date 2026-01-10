import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  Auth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from '@angular/fire/auth';
import { tap, catchError, throwError, Observable, from, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse, AuthResponse, User } from '../../models/user.model';
import { ToastService } from '../toast/toast.service';
import { FirebaseError } from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private http = inject(HttpClient);
  private router = inject(Router);
  private toastService = inject(ToastService);

  currentUser = signal<User | null>(null);
  loading = signal<boolean>(true); 
  isAuthenticated = signal<boolean>(false);

  private readonly API_URL = environment.api_url;

  constructor() {
    this.initAuthStateListener();
    this.checkAuthStatus();
  }

  private initAuthStateListener(): void {
    onAuthStateChanged(this.auth, (firebaseUser) => {
      if (!firebaseUser) {
        this.currentUser.set(null);
        this.isAuthenticated.set(false);
      }
    });
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  checkAuthStatus(): void {
    this.loading.set(true);
    this.http
      .get<ApiResponse<{ user: User }>>(`${this.API_URL}/auth/me`, {
        withCredentials: true,
      })
      .pipe(
        tap((response) => {
          if (response.success && response.data) {
            this.currentUser.set(response.data.user);
            this.isAuthenticated.set(true);
          }
        }),
        catchError((error) => {
          console.log('Auth check failed:', error);
          this.currentUser.set(null);
          this.isAuthenticated.set(false);
          return throwError(() => new Error('Not authenticated'));
        })
      )
      .subscribe({
        next: () => this.loading.set(false),
        error: () => this.loading.set(false),
      });
  }

  googleSignIn(): Observable<User> {
    this.loading.set(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account',
    });

    return from(signInWithPopup(this.auth, provider)).pipe(
      tap(async (result) => {
        try {
          const firebaseToken = await result.user.getIdToken();
          const response = await this.authenticateWithBackend(firebaseToken);

          if (response.success && response.data) {
            this.currentUser.set(response.data.user);
            this.isAuthenticated.set(true);
            localStorage.setItem('token', response.data.token);

            this.toastService.success('Login successful! Welcome back.');
            this.loading.set(false);

            setTimeout(() => {
              this.router.navigate(['/']);
            }, 500);
          }
        } catch (error: unknown) {
          this.loading.set(false);
          const message = error instanceof Error ? error.message : 'Authentication failed.';
          this.toastService.error(message);
          throw error;
        }
      }),
      map((result) => {
        return {
          id: result.user.uid,
          name: result.user.displayName || '',
          email: result.user.email || '',
          picture: result.user.photoURL || '',
          emailVerified: result.user.emailVerified,
        } as User;
      }),
      catchError((error: unknown) => {
        this.loading.set(false);
        let errorMessage = 'Login failed. Please try again.';

        if (error instanceof FirebaseError) {
          switch (error.code) {
            case 'auth/popup-closed-by-user':
            case 'auth/cancelled-popup-request':
              errorMessage = 'Login cancelled.';
              break;
            case 'auth/popup-blocked':
              errorMessage = 'Popup blocked. Please allow popups for this site.';
              break;
          }
          } else if (error instanceof Error) {
          errorMessage = error.message;
        }

        this.toastService.error(errorMessage);
        return throwError(() => error);
      })
    );
  }

  private async authenticateWithBackend(
    firebaseToken: string
  ): Promise<AuthResponse> {
    return new Promise((resolve, reject) => {
      this.http
        .post<AuthResponse>(
          `${this.API_URL}/auth/google`,
          { firebaseToken },
          { withCredentials: true }
        )
        .subscribe({
          next: (response) => resolve(response),
          error: (error: HttpErrorResponse) => {
            const errorMsg =
              error.error?.message || 'Backend authentication failed';
            reject(new Error(errorMsg));
          },
        });
    });
  }

  logout(): Observable<void> {
    this.loading.set(true);

    return from(signOut(this.auth)).pipe(
      tap(() => {
        this.http
          .post<ApiResponse>(
            `${this.API_URL}/auth/logout`,
            {},
            { withCredentials: true }
          )
          .subscribe({
            next: () => {
              localStorage.removeItem('token');
              this.currentUser.set(null);
              this.isAuthenticated.set(false);
              this.loading.set(false);
              this.toastService.success('Logged out successfully');
              this.router.navigate(['/']);
            },
            error: () => {
              localStorage.removeItem('token');
              this.currentUser.set(null);
              this.isAuthenticated.set(false);
              this.loading.set(false);
              this.toastService.error('Logout failed on server, but cleared locally');
              this.router.navigate(['/']);
            },
          });
      }),
      catchError((error) => {
        this.loading.set(false);
        this.toastService.error('Logout failed');
        return throwError(() => error);
      })
    );
  }

  getCurrentUser(): User | null {
    return this.currentUser();
  }

  isUserAuthenticated(): boolean {
    return this.isAuthenticated();
  }
}
