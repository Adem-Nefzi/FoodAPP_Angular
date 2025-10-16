import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../app/components/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('../app/pages/login/login.component').then(
        (m) => m.LoginComponent
      ),
    canActivate: [guestGuard], // Only for guests
  },
  {
    path: 'register',
    loadComponent: () =>
      import('../app/pages/register/register.component').then(
        (m) => m.RegisterComponent
      ),
    canActivate: [guestGuard], // Only for guests
  },
  {
    path: '**',
    redirectTo: '',
  },
];
