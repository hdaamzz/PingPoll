import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError, delay } from 'rxjs';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthResponse } from '../models/user.model';

let isRefreshing = false;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const http = inject(HttpClient);
  const router = inject(Router);
  
  const authReq = req.clone({
    withCredentials: true,
  });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const shouldRefresh = error.status === 401 && 
                           error.error?.tokenExpired === true &&
                           !req.url.includes('/auth/refresh') &&
                           !req.url.includes('/auth/google') &&
                           !req.url.includes('/auth/logout');


      if (shouldRefresh) {
        
        if (!isRefreshing) {
          isRefreshing = true;
          
          return http.post<AuthResponse>(
            `${environment.api_url}/auth/refresh`,
            {},
            { withCredentials: true }
          ).pipe(
            switchMap((response) => {
              isRefreshing = false;
              
              if (response.success && response.data) {
                localStorage.setItem('token', response.data.token);
              }
              return next(authReq);
            }),
            catchError((refreshError) => {
              isRefreshing = false;
              localStorage.removeItem('token');
              router.navigate(['/']);
              return throwError(() => refreshError);
            })
          );
        } else {
          return throwError(() => error).pipe(
            delay(1000),
            switchMap(() => {
              if (!isRefreshing) {
                return next(authReq);
              } else {
                return throwError(() => error);
              }
            })
          );
        }
      }
      
      return throwError(() => error);
    })
  );
};
