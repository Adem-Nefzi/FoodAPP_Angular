import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, tap, catchError } from 'rxjs/operators';
import { NzMessageService } from 'ng-zorro-antd/message';
import {
  UserProfileResponse,
  UpdateProfileRequest,
  SuccessResponse,
} from '../models/user-profile.models';
import { User } from '../models/auth.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserProfileService {
  private http = inject(HttpClient);
  private message = inject(NzMessageService);
  private readonly API_URL = `${environment.apiUrl}/profile`;

  // State management
  userProfile = signal<UserProfileResponse | null>(null);
  isLoading = signal<boolean>(false);

  /**
   * Get current user's profile from backend API.
   * Also syncs with localStorage for offline access.
   */
  getCurrentUserProfile(): Observable<UserProfileResponse> {
    this.isLoading.set(true);

    return this.http.get<UserProfileResponse>(`${this.API_URL}/me`).pipe(
      tap((profile) => {
        // Ensure stats object exists
        if (!profile.stats) {
          profile.stats = {
            totalLikes: 0,
            totalComments: 0,
            totalViews: 0,
          };
        }

        // Update localStorage with fresh data from server
        const raw = localStorage.getItem('currentUser');
        if (raw) {
          const current = JSON.parse(raw) as User;
          const updated: User = {
            ...current,
            username: profile.username,
            email: profile.email,
            profilePicture: profile.profilePicture,
          };
          localStorage.setItem('currentUser', JSON.stringify(updated));
        }

        // Update signal state
        this.userProfile.set(profile);
        this.isLoading.set(false);
      }),
      catchError((err) => {
        this.isLoading.set(false);
        // Fallback to localStorage if API fails
        const raw = localStorage.getItem('currentUser');
        if (raw) {
          try {
            const user = JSON.parse(raw) as User;
            const profile: UserProfileResponse = {
              id: user.id,
              username: user.username,
              email: user.email,
              profilePicture: user.profilePicture,
              favoriteRecipes: 0,
              createdRecipes: 0,
              cookedRecipes: 0,
              followers: 0,
              following: 0,
              joinedDate: new Date().toISOString(),
              stats: {
                totalLikes: 0,
                totalComments: 0,
                totalViews: 0,
              },
            };
            this.userProfile.set(profile);
            return of(profile);
          } catch {
            const msg = 'Unable to load profile data';
            this.message.error(msg);
            return throwError(() => new Error(msg));
          }
        }
        const msg = err?.error?.message || 'Failed to load profile';
        this.message.error(msg);
        return throwError(() => new Error(msg));
      })
    );
  }

  // Not used for now; keeping a simple local variant if needed later
  getUserProfile(_id: string): Observable<UserProfileResponse> {
    return this.getCurrentUserProfile();
  }

  /**
   * Update current user's profile via backend API.
   * Allowed fields: username, profilePicture.
   */
  updateProfile(
    request: UpdateProfileRequest
  ): Observable<UserProfileResponse> {
    this.isLoading.set(true);

    return this.http
      .put<UserProfileResponse>(`${this.API_URL}/me`, request)
      .pipe(
        tap((updatedProfile) => {
          // Update localStorage with the response from server
          const raw = localStorage.getItem('currentUser');
          if (raw) {
            const current = JSON.parse(raw) as User;
            const updated: User = {
              ...current,
              username: updatedProfile.username ?? current.username,
              profilePicture:
                updatedProfile.profilePicture ?? current.profilePicture,
            };
            localStorage.setItem('currentUser', JSON.stringify(updated));
          }

          // Update the signal state
          this.userProfile.set(updatedProfile);
          this.isLoading.set(false);
          this.message.success('Profile updated successfully');
        }),
        catchError((err) => {
          this.isLoading.set(false);
          const msg = err?.error?.message || 'Failed to update profile';
          this.message.error(msg);
          return throwError(() => new Error(msg));
        })
      );
  }

  /**
   * Change password via backend API.
   * Expects { currentPassword, newPassword, confirmPassword } body.
   */
  changePassword(req: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Observable<SuccessResponse> {
    this.isLoading.set(true);
    return this.http
      .put<SuccessResponse>(`${this.API_URL}/change-password`, req)
      .pipe(
        tap((res) => {
          this.isLoading.set(false);
          this.message.success(res?.message || 'Password changed successfully');
        }),
        catchError((err) => {
          this.isLoading.set(false);
          const msg = err?.error?.message || 'Failed to change password';
          this.message.error(msg);
          return throwError(() => new Error(msg));
        })
      );
  }

  /**
   * Delete account via backend API.
   * Clears current user and token after successful deletion.
   */
  deleteAccount(_password?: string): Observable<SuccessResponse> {
    this.isLoading.set(true);

    return this.http.delete<SuccessResponse>(`${this.API_URL}/me`).pipe(
      tap((res) => {
        // Clear localStorage after successful deletion
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
        this.userProfile.set(null);
        this.isLoading.set(false);
        this.message.success(res?.message || 'Account deleted successfully');
      }),
      catchError((err) => {
        this.isLoading.set(false);
        const msg = err?.error?.message || 'Failed to delete account';
        this.message.error(msg);
        return throwError(() => new Error(msg));
      })
    );
  }

  /**
   * Increment comment count in profile stats
   */
  incrementCommentCount(): void {
    const profile = this.userProfile();
    if (profile) {
      // Initialize stats if it doesn't exist
      if (!profile.stats) {
        profile.stats = {
          totalLikes: 0,
          totalComments: 0,
          totalViews: 0,
        };
      }

      this.userProfile.set({
        ...profile,
        stats: {
          ...profile.stats,
          totalComments: (profile.stats.totalComments || 0) + 1,
        },
      });
      console.log(
        'Comment count incremented:',
        profile.stats.totalComments + 1
      );
    }
  }

  /**
   * Decrement comment count in profile stats
   */
  decrementCommentCount(): void {
    const profile = this.userProfile();
    if (profile) {
      // Initialize stats if it doesn't exist
      if (!profile.stats) {
        profile.stats = {
          totalLikes: 0,
          totalComments: 0,
          totalViews: 0,
        };
      }

      this.userProfile.set({
        ...profile,
        stats: {
          ...profile.stats,
          totalComments: Math.max((profile.stats.totalComments || 0) - 1, 0),
        },
      });
      console.log(
        'Comment count decremented:',
        Math.max((profile.stats.totalComments || 0) - 1, 0)
      );
    }
  }

  /**
   * Increment favorite count in profile
   */
  incrementFavoriteCount(): void {
    const profile = this.userProfile();
    if (profile) {
      this.userProfile.set({
        ...profile,
        favoriteRecipes: (profile.favoriteRecipes || 0) + 1,
      });
      console.log('Favorite count incremented:', profile.favoriteRecipes + 1);
    }
  }

  /**
   * Decrement favorite count in profile
   */
  decrementFavoriteCount(): void {
    const profile = this.userProfile();
    if (profile) {
      this.userProfile.set({
        ...profile,
        favoriteRecipes: Math.max((profile.favoriteRecipes || 0) - 1, 0),
      });
      console.log(
        'Favorite count decremented:',
        Math.max((profile.favoriteRecipes || 0) - 1, 0)
      );
    }
  }

  // Kept for API parity in case we reintroduce HTTP in future
  private handleError(error: any): Observable<never> {
    const msg = typeof error === 'string' ? error : error?.message ?? 'Error';
    this.message.error(msg);
    return throwError(() => new Error(msg));
  }
}
