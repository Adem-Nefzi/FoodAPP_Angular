import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadModule, NzUploadFile } from 'ng-zorro-antd/upload';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';
import { UserProfileService } from '../../core/services/user-profile.service';
import {
  UserProfileResponse,
  UpdateProfileRequest,
} from '../../core/models/user-profile.models';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzAvatarModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzFormModule,
    NzCardModule,
    NzModalModule,
    NzTabsModule,
    NzDividerModule,
    NzLayoutModule,
    NzMenuModule,
    NzSwitchModule,
    NzSpinModule,
    NzUploadModule,
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
})
export class SettingsComponent implements OnInit {
  private themeService = inject(ThemeService);
  private authService = inject(AuthService);
  private profileService = inject(UserProfileService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private modal = inject(NzModalService);
  private message = inject(NzMessageService);

  // Theme
  isDarkMode = this.themeService.isDarkMode;

  // State
  currentUser = this.authService.currentUser;
  userProfile = this.profileService.userProfile;
  isLoading = this.profileService.isLoading;
  // left-nav selection: account | danger
  activeSection = signal<'account' | 'danger'>('account');

  // Forms
  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  ngOnInit(): void {
    this.loadUserProfile();
    this.initializeForms();
  }

  loadUserProfile(): void {
    this.profileService.getCurrentUserProfile().subscribe({
      next: (profile) => {
        this.populateProfileForm(profile);
      },
      error: () => {
        this.message.error('Failed to load profile');
      },
    });
  }

  private initializeForms(): void {
    // Profile Form
    this.profileForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: [{ value: '', disabled: true }],
      profilePicture: [''],
    });

    // Change password form
    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', [Validators.required]],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  private populateProfileForm(profile: UserProfileResponse): void {
    this.profileForm.patchValue({
      username: profile.username,
      email: profile.email,
      profilePicture: profile.profilePicture || '',
    });
  }

  onSubmitProfile(): void {
    if (this.profileForm.valid) {
      const request: UpdateProfileRequest = {
        username: this.profileForm.value.username,
        profilePicture: this.profileForm.value.profilePicture,
      };

      this.profileService.updateProfile(request).subscribe({
        next: () => {
          // Update auth service user data
          const currentUser = this.currentUser();
          if (currentUser) {
            const updatedUser = {
              ...currentUser,
              username: request.username || currentUser.username,
              profilePicture:
                request.profilePicture ?? currentUser.profilePicture,
            };
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            this.authService.currentUser.set(updatedUser);
            this.message.success('Profile saved');
          }
        },
        error: () => {
          this.message.error('Failed to update profile');
        },
      });
    }
  }

  // --- Change password ---
  private passwordMatchValidator(group: FormGroup) {
    const n = group.get('newPassword')?.value;
    const c = group.get('confirmPassword')?.value;
    return n === c ? null : { passwordMismatch: true };
  }

  onSubmitPassword(): void {
    if (this.passwordForm.invalid) return;
    const payload = {
      currentPassword: this.passwordForm.value.currentPassword,
      newPassword: this.passwordForm.value.newPassword,
      confirmPassword: this.passwordForm.value.confirmPassword,
    };
    this.profileService.changePassword(payload).subscribe({
      next: () => this.passwordForm.reset(),
      error: () => {},
    });
  }

  showDeleteAccountModal(): void {
    this.modal.confirm({
      nzTitle: 'Delete Account',
      nzContent:
        'Are you sure you want to permanently delete your account? This action cannot be undone and all your data will be lost.',
      nzOkText: 'Yes, Delete My Account',
      nzOkDanger: true,
      nzCancelText: 'Cancel',
      nzIconType: 'exclamation-circle',
      nzClassName: 'delete-account-modal',
      nzOnOk: () => {
        return new Promise((resolve, reject) => {
          this.showPasswordPrompt(resolve, reject);
        });
      },
    });
  }

  private showPasswordPrompt(resolve: any, reject: any): void {
    // Local-only deletion: just confirm one more time, no password needed
    this.modal.confirm({
      nzTitle: 'Final Confirmation',
      nzContent:
        'This will remove your account data from this device (localStorage). Proceed?',
      nzOkText: 'Delete my account',
      nzOkDanger: true,
      nzCancelText: 'Cancel',
      nzIconType: 'warning',
      nzOnOk: () => {
        return new Promise((innerResolve, innerReject) => {
          this.profileService.deleteAccount().subscribe({
            next: () => {
              this.authService.logout().subscribe(() => {
                innerResolve(true);
                resolve(true);
              });
            },
            error: (err) => {
              innerReject(err);
              reject(err);
            },
          });
        });
      },
      nzOnCancel: () => reject('Cancelled'),
    });
  }

  // --- Avatar helpers
  beforeUpload = (file: NzUploadFile): boolean => {
    // Try multiple ways to get the actual file
    const raw = file.originFileObj || (file as any).originFileObj || file;

    if (!raw || !(raw instanceof File)) {
      this.message.error('Unable to access file. Please try again.');
      return false;
    }

    // Supported image types including webp
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
    ];
    const isImage = allowedTypes.includes(raw.type);

    if (!isImage) {
      this.message.error(
        'Please select a valid image file (JPG, PNG, GIF, or WebP)'
      );
      return false;
    }

    // Check file size (max 2MB)
    const isLt2M = raw.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      this.message.error('Image must be smaller than 2MB');
      return false;
    }

    this.message.loading('Uploading image...', { nzDuration: 0 });

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      this.profileForm.patchValue({ profilePicture: base64 });

      // Auto-save the profile picture
      this.saveProfilePicture(base64);
    };
    reader.onerror = () => {
      this.message.remove();
      this.message.error('Failed to read image file');
    };
    reader.readAsDataURL(raw);

    // Prevent actual upload
    return false;
  };

  removeAvatar(): void {
    this.profileForm.patchValue({ profilePicture: '' });

    // Auto-save to remove the profile picture
    this.saveProfilePicture('');
  }

  private saveProfilePicture(profilePicture: string): void {
    const request: UpdateProfileRequest = {
      username: this.profileForm.value.username,
      profilePicture: profilePicture,
    };

    this.profileService.updateProfile(request).subscribe({
      next: (updatedProfile) => {
        // Remove loading message
        this.message.remove();

        // Update auth service user data
        const currentUser = this.currentUser();
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            username: updatedProfile.username || currentUser.username,
            profilePicture: updatedProfile.profilePicture || profilePicture,
          };
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
          this.authService.currentUser.set(updatedUser);
        }

        // Update the userProfile signal to trigger UI refresh
        const currentProfile = this.userProfile();
        if (currentProfile) {
          this.profileService.userProfile.set({
            ...currentProfile,
            profilePicture: updatedProfile.profilePicture || profilePicture,
          });
        }

        // Update form with the saved value
        this.profileForm.patchValue({
          profilePicture: updatedProfile.profilePicture || profilePicture,
        });

        this.message.success(
          profilePicture
            ? 'Profile picture updated successfully'
            : 'Profile picture removed successfully'
        );
      },
      error: () => {
        this.message.remove();
        this.message.error('Failed to update profile picture');

        // Revert the form value on error
        this.profileForm.patchValue({
          profilePicture: this.userProfile()?.profilePicture || '',
        });
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }
}
