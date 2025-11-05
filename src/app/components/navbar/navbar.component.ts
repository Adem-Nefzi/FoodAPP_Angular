import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    NzIconModule,
    NzButtonModule,
    NzBadgeModule,
    NzDropDownModule,
    NzAvatarModule,
    NzModalModule,
    RouterLink,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  private modal = inject(NzModalService);
  themeService = inject(ThemeService);
  authService = inject(AuthService);
  private router = inject(Router);

  get isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }

  get isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  get currentUser() {
    return this.authService.currentUser();
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  logout(): void {
    this.modal.confirm({
      nzTitle: 'Sign Out',
      nzContent:
        "Are you sure you want to leave? You'll need to sign in again to access your recipes.",
      nzOkText: 'Yes, Sign Out',
      nzOkDanger: true,
      nzCancelText: 'Stay Here',
      nzClassName: 'custom-logout-modal',
      nzMaskClosable: true,
      nzClosable: false,
      nzCentered: true,
      nzWidth: 400,
      nzIconType: 'exclamation-circle',
      nzOnOk: () => {
        return new Promise((resolve) => {
          this.authService.logout().subscribe({
            next: () => {
              resolve();
              this.router.navigate(['/login']);
            },
            error: (error) => {
              console.error('Logout error:', error);
              resolve();
              this.router.navigate(['/login']);
            },
          });
        });
      },
    });
  }
}
