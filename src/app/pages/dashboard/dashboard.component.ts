import { Component, signal, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { SidebarComponent } from './sidebar/sidebar.component';
import { RecipesListComponent } from './recipe-list/recipe-list.component';
import { AiChatComponent } from './ai-tab/ai-tab.component';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';
import { UserProfileService } from '../../core/services/user-profile.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    NzDrawerModule,
    NzButtonModule,
    NzIconModule,
    NzToolTipModule,
    NzAvatarModule,
    SidebarComponent,
    RecipesListComponent,
    AiChatComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  // Inject services
  themeService = inject(ThemeService);
  authService = inject(AuthService);
  profileService = inject(UserProfileService);
  router = inject(Router);

  // Component state
  activeTab = signal<'recipes' | 'ai'>('recipes');
  sidebarCollapsed = signal(false);
  sidebarVisible = signal(false);

  // Computed signals
  isDarkMode = this.themeService.isDarkMode;
  currentUser = this.authService.currentUser;
  userProfile = this.profileService.userProfile;

  // 🎨 Enhanced greeting based on time
  greeting = computed(() => {
    const hour = new Date().getHours();
    if (hour < 12) return '☀️ Good Morning';
    if (hour < 17) return '🌤️ Good Afternoon';
    if (hour < 21) return '🌆 Good Evening';
    return '🌙 Good Night';
  });

  // 📊 Quick stats - now using real profile data
  stats = computed(() => {
    const profile = this.userProfile();
    return {
      recipes: profile?.createdRecipes || 0,
      favorites: profile?.favoriteRecipes || 0,
      cooked: profile?.cookedRecipes || 0,
    };
  });

  ngOnInit() {
    // Load user profile when dashboard initializes
    this.profileService.getCurrentUserProfile().subscribe({
      error: () => {
        // Silently fail - profile will be loaded later
      },
    });
  }

  switchTab(tab: 'recipes' | 'ai') {
    this.activeTab.set(tab);
  }

  onSidebarCollapse(collapsed: boolean) {
    this.sidebarCollapsed.set(collapsed);
  }

  openSidebar() {
    this.sidebarVisible.set(true);
  }

  closeSidebar() {
    this.sidebarVisible.set(false);
  }

  // Navigate to profile page
  navigateToProfile() {
    this.router.navigate(['/profile']);
  }
}
