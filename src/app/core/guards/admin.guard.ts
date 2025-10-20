import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NzMessageService } from 'ng-zorro-antd/message';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const message = inject(NzMessageService);

  // Check if user is logged in
  if (!authService.isLoggedIn()) {
    message.warning('Please login first');
    router.navigate(['/login']);
    return false;
  }

  // Check if user is admin
  if (authService.isAdmin()) {
    return true; // Yes, let them in!
  }

  // No, show error and redirect
  message.error('Access denied. Admin privileges required.');
  router.navigate(['/']);
  return false;
};
