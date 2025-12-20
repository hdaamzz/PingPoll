import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { ToastService } from '../services/toast/toast.service';


export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastService = inject(ToastService);
  
  if (authService.isUserAuthenticated()) {
    return true;
  }

  toastService.warning('Please login to access this page');
  router.navigate(['/']);
  return false;
};
