import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';
import { UserProfileService } from '../../core/services/user-profile.service';
import { UserProfileResponse } from '../../core/models/user-profile.models';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    NzAvatarModule,
    NzButtonModule,
    NzIconModule,
    NzCardModule,
    NzStatisticModule,
    NzTagModule,
    NzDividerModule,
    NzSpinModule,
  ],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css',
})
export class UserProfileComponent implements OnInit {
  private themeService = inject(ThemeService);
  private authService = inject(AuthService);
  private profileService = inject(UserProfileService);
  private router = inject(Router);
  private message = inject(NzMessageService);

  // Theme
  isDarkMode = this.themeService.isDarkMode;

  // State
  currentUser = this.authService.currentUser;
  userProfile = this.profileService.userProfile;
  isLoading = this.profileService.isLoading; // Computed properties
  memberSince = computed(() => {
    const profile = this.userProfile();
    if (profile?.joinedDate) {
      const date = new Date(profile.joinedDate);
      return date.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      });
    }
    return 'Recently';
  });

  // Profile completeness based on minimal local fields only
  progressPercentage = computed(() => {
    const profile = this.userProfile();
    if (!profile) return 0;

    let filled = 0;
    const total = 3; // username, email, avatar

    if (profile.username) filled++;
    if (profile.email) filled++;
    if (profile.profilePicture) filled++;

    return Math.round((filled / total) * 100);
  });

  ngOnInit(): void {
    this.loadUserProfile();
  }

  private loadUserProfile(): void {
    this.profileService.getCurrentUserProfile().subscribe({
      error: () => {
        this.message.error('Failed to load profile');
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  goToSettings(): void {
    this.router.navigate(['/settings']);
  }
}
