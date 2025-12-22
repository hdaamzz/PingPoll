import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast/toast.service';
import { AuthService } from '../services/auth/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred';

      if (error.error instanceof ErrorEvent) {
        errorMessage = `Network Error: ${error.error.message}`;
        console.error('Client-side error:', error.error);
      } else {
        console.error(
          `Backend returned code ${error.status}, ` +
          `body was: ${JSON.stringify(error.error)}`
        );

        switch (error.status) {
          case 0:
            errorMessage = 'Unable to connect to server. Please check your internet connection.';
            toastService.error(errorMessage);
            break;

          case 400:
            errorMessage = error.error?.message || 'Invalid request. Please check your input.';
            toastService.error(errorMessage);
            break;

          case 401:
            errorMessage = error.error?.message || 'Session expired. Please login again.';
            toastService.error(errorMessage);
            
            localStorage.removeItem('token');
            authService.currentUser.set(null);
            authService.isAuthenticated.set(false);
            router.navigate(['/']);
            break;

          case 403:
            errorMessage = error.error?.message || 'You do not have permission to perform this action.';
            toastService.error(errorMessage);
            break;

          case 404:
            errorMessage = error.error?.message || 'The requested resource was not found.';
            toastService.error(errorMessage);
            break;

          case 409:
            errorMessage = error.error?.message || 'A conflict occurred. Please refresh and try again.';
            toastService.error(errorMessage);
            break;

          case 422:
            errorMessage = error.error?.message || 'Validation failed. Please check your input.';
            toastService.error(errorMessage);
            break;

          case 429:
            errorMessage = 'Too many requests. Please wait a moment and try again.';
            toastService.error(errorMessage);
            break;

          case 500:
            errorMessage = 'Server error. Please try again later.';
            toastService.error(errorMessage);
            break;

          case 502:
          case 503:
          case 504:
            errorMessage = 'Service temporarily unavailable. Please try again later.';
            toastService.error(errorMessage);
            break;

          default:
            errorMessage = error.error?.message || `Error: ${error.statusText}`;
            toastService.error(errorMessage);
        }
      }

      return throwError(() => ({
        status: error.status,
        message: errorMessage,
        error: error.error
      }));
    })
  );
};
