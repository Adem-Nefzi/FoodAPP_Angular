import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NzMessageService } from 'ng-zorro-antd/message';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const message = inject(NzMessageService);

  if (authService.isLoggedIn()) {
    return true;
  }

  // Not logged in, redirect to login
  message.warning('Please login to access this page');
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
