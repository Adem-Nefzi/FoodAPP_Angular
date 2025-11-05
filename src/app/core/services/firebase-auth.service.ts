// src/app/core/services/firebase-auth.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  Auth,
  User as FirebaseUser,
} from 'firebase/auth';
import { environment } from '../../../environments/environment';
import { AuthResponse } from '../models/auth.models';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FirebaseAuthService {
  private http = inject(HttpClient);
  private auth: Auth;
  private provider: GoogleAuthProvider;
  private readonly API_URL = 'http://localhost:1000/api/auth';

  constructor() {
    // Initialize Firebase
    const app = initializeApp(environment.firebase);
    this.auth = getAuth(app);
    this.provider = new GoogleAuthProvider();
  }

  /**
   * Sign in with Google using Firebase Authentication
   * Then authenticate with your backend to get JWT token
   */
  async signInWithGoogle(): Promise<AuthResponse> {
    try {
      // Step 1: Authenticate with Firebase (Google popup)
      const result = await signInWithPopup(this.auth, this.provider);
      const user = result.user;

      // Step 2: Get Firebase ID token
      const idToken = await user.getIdToken();

      console.log('🔥 Firebase ID Token obtained');

      // Step 3: Send ID token to your backend to get JWT
      const response = await firstValueFrom(
        this.http.post<AuthResponse>(`${this.API_URL}/firebase`, {
          idToken: idToken,
        })
      );

      console.log('✅ Backend JWT received:', response);

      // Backend returns your JWT token and user data from your database
      return response;
    } catch (error: any) {
      console.error('❌ Google sign-in error:', error);
      throw new Error(error.message || 'Google sign-in failed');
    }
  }

  /**
   * Get current Firebase user
   */
  getCurrentUser(): FirebaseUser | null {
    return this.auth.currentUser;
  }

  /**
   * Sign out from Firebase
   */
  async signOut(): Promise<void> {
    return this.auth.signOut();
  }

  /**
   * Check if user is signed in with Firebase
   */
  isSignedIn(): boolean {
    return this.auth.currentUser !== null;
  }
}
