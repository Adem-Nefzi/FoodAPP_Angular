import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  inject,
  OnInit,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzButtonModule,
    NzIconModule,
    NzAvatarModule,
    NzModalModule,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent implements OnInit {
  private modal = inject(NzModalService);
  authService = inject(AuthService);
  themeService = inject(ThemeService);
  private router = inject(Router);

  @Input() activeTab = 'recipes';
  @Output() collapseToggled = new EventEmitter<boolean>();

  isCollapsed = signal(false);

  // ✅ FIXED: Use computed signals instead of getters
  currentUser = computed(() => this.authService.currentUser());
  isAuthenticated = computed(() => this.authService.isAuthenticated());
  isAdmin = computed(() => this.authService.isAdmin());
  isDarkMode = computed(() => this.themeService.isDarkMode());

  // ✅ FIXED: Computed values for user info
  userDisplayName = computed(() => this.currentUser()?.username || 'User');
  userRoleBadge = computed(() => (this.isAdmin() ? 'Admin' : 'Member'));
  userProfilePicture = computed(
    () => this.currentUser()?.profilePicture || this.getDefaultAvatar()
  );

  // ✅ FIXED: Computed menu items
  mainMenuItems = computed(() => {
    const items = [
      { label: 'Recipes', icon: 'fire', route: '/dashboard', tab: 'recipes' },
      {
        label: 'My Favorites',
        icon: 'heart',
        route: '/favorites',
        tab: 'favorites',
      },
    ];

    if (this.isAdmin()) {
      items.push({
        label: 'Admin Panel',
        icon: 'crown',
        route: '/admin',
        tab: 'admin',
      });
    }

    return items;
  });

  collectionsMenuItems = [
    { label: 'Breakfast', icon: 'coffee', route: '/breakfast' },
    { label: 'Lunch', icon: 'apple', route: '/lunch' },
    { label: 'Dinner', icon: 'shopping', route: '/dinner' },
    { label: 'Desserts', icon: 'gift', route: '/desserts' },
  ];

  settingsMenuItems = [
    { label: 'Settings', icon: 'setting', route: '/settings' },
    { label: 'Help', icon: 'question-circle', route: '/help' },
  ];

  ngOnInit() {
    // ✅ FIXED: Removed unnecessary loadUserData call
    // User data is already in AuthService signals
  }

  toggleCollapse() {
    this.isCollapsed.set(!this.isCollapsed());
    this.collapseToggled.emit(this.isCollapsed());
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  logout() {
    this.modal.confirm({
      nzTitle: 'Logout Confirmation',
      nzContent: 'Are you sure you want to logout?',
      nzOkText: 'Yes, Logout',
      nzOkDanger: true,
      nzCancelText: 'Cancel',
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

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  private getDefaultAvatar(): string {
    const name = this.currentUser()?.username || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=10b981&color=fff&size=128`;
  }
}
