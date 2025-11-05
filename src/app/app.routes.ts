import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { UserProfileComponent } from './pages/user-profile/user-profile.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { RecipeDetailsComponent } from './pages/recipe-details/recipe-details.component';
import { FavoritesComponent } from './pages/favorites/favorites.component';
import { HomeComponent } from './components/home.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [guestGuard], // Only for guests
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [guestGuard], // Only for guests
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard], // Only for authenticated users
  },
  {
    path: 'profile',
    component: UserProfileComponent,
    canActivate: [authGuard], // View-only profile page
  },
  {
    path: 'settings',
    component: SettingsComponent,
    canActivate: [authGuard], // Settings page for editing profile
  },
  {
    path: 'recipe/:id',
    component: RecipeDetailsComponent,
    canActivate: [authGuard], // Recipe details page
  },
  {
    path: 'favorites',
    component: FavoritesComponent,
    canActivate: [authGuard], // Favorites page
  },
  {
    path: '**',
    redirectTo: '',
  },
];
