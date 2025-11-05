import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, throwError, from } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { NzMessageService } from 'ng-zorro-antd/message';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
} from '../models/auth.models';
import { FirebaseAuthService } from './firebase-auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private message = inject(NzMessageService);
  private firebaseAuth = inject(FirebaseAuthService);

  // API URL - Change this to your backend URL
  private readonly API_URL = 'http://localhost:1000/api/auth';

  // State management
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Signal for reactive components
  isAuthenticated = signal<boolean>(false);
  currentUser = signal<User | null>(null);

  constructor() {
    // Check if user is already logged in
    this.checkAuthStatus();
  }
  // Check authentication status on service initialization
  private checkAuthStatus(): void {
    const token = this.getToken();
    const userStr = localStorage.getItem('currentUser');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
        this.currentUser.set(user);
        this.isAuthenticated.set(true);
      } catch (error) {
        this.logout();
      }
    }
  }
  // Login user
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.API_URL}/login`, credentials)
      .pipe(
        tap((response) => {
          // Store token
          this.setToken(response.token);

          // Store user info
          const user: User = {
            id: response.id,
            username: response.username,
            email: response.email,
            role: response.role,
            profilePicture: response.profilePicture,
          };

          localStorage.setItem('currentUser', JSON.stringify(user));

          // Update state
          this.currentUserSubject.next(user);
          this.currentUser.set(user);
          this.isAuthenticated.set(true);

          // Show success message
          this.message.success(`Welcome back, ${user.username}!`);
        }),
        catchError(this.handleError.bind(this))
      );
  }

  // Register user
  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.API_URL}/register`, userData)
      .pipe(
        tap((response) => {
          // Store token
          this.setToken(response.token);

          // Store user info
          const user: User = {
            id: response.id,
            username: response.username,
            email: response.email,
            role: response.role,
            profilePicture: response.profilePicture,
          };

          localStorage.setItem('currentUser', JSON.stringify(user));

          // Update state
          this.currentUserSubject.next(user);
          this.currentUser.set(user);
          this.isAuthenticated.set(true);

          // Show success message
          this.message.success('Account created successfully!');
        }),
        catchError(this.handleError.bind(this))
      );
  }

  // Handle Google Authentication
  handleGoogleAuth(response: AuthResponse): void {
    // Store token
    this.setToken(response.token);

    // Store user info with profile picture
    const user: User = {
      id: response.id,
      username: response.username,
      email: response.email,
      role: response.role,
      profilePicture: response.profilePicture, // Google profile picture URL
    };

    localStorage.setItem('currentUser', JSON.stringify(user));

    // Update state
    this.currentUserSubject.next(user);
    this.currentUser.set(user);
    this.isAuthenticated.set(true);

    // Show success message
    this.message.success(`Welcome back, ${user.username}!`);
  }

  // Logout user
  public logout(): Observable<any> {
    // Sign out from Firebase if user was authenticated with Google
    return from(this.firebaseAuth.signOut()).pipe(
      tap(() => {
        this.clearAuthData();
        this.message.success('Logged out successfully');
      }),
      catchError(() => {
        // Even if Firebase logout fails, clear local data
        this.clearAuthData();
        return throwError(() => new Error('Logout failed'));
      })
    );
  }

  // Clear authentication data
  private clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  // Get stored token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Store token
  private setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Check if user is admin
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'ADMIN';
  }

  isUser(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'USER';
  }

  // Handle HTTP errors
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred. Please try again.';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Backend error
      if (error.status === 401) {
        errorMessage = error.error?.message || 'Invalid email or password';
      } else if (error.status === 400) {
        errorMessage = error.error?.message || 'Invalid request';
      } else if (error.status === 0) {
        errorMessage =
          'Cannot connect to server. Please check your connection.';
      } else {
        errorMessage = error.error?.message || `Server error: ${error.status}`;
      }
    }

    this.message.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
