import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  type FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';
import { FirebaseAuthService } from '../../core/services/firebase-auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzCheckboxModule,
    NzIconModule,
    NzDividerModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  themeService = inject(ThemeService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private message = inject(NzMessageService);
  private authService = inject(AuthService);
  private firebaseAuth = inject(FirebaseAuthService);

  loginForm: FormGroup;
  passwordVisible = false;
  isLoading = false;
  isGoogleLoading = false;

  // 🎨 Enhanced Interactive States
  mouseX = 0;
  mouseY = 0;
  tiltX = 0;
  tiltY = 0;
  isEmailFocused = false;
  isPasswordFocused = false;

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      remember: [true],
    });
  }

  get isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }

  /**
   * Standard email/password login
   */
  onSubmit(): void {
    if (this.loginForm.valid) {
      // Trigger ripple effect
      this.createRipple();

      this.isLoading = true;

      const credentials = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password,
      };

      this.authService.login(credentials).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Login error:', error);
        },
      });
    } else {
      Object.values(this.loginForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  /**
   * Google Sign-In
   */
  async onGoogleSignIn(): Promise<void> {
    this.isGoogleLoading = true;

    try {
      const response = await this.firebaseAuth.signInWithGoogle();

      // Store user data using AuthService (message handled by AuthService)
      this.authService.handleGoogleAuth(response);

      this.isGoogleLoading = false;
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      this.isGoogleLoading = false;
      this.message.error(error.message || 'Google sign-in failed');
      console.error('Google sign-in error:', error);
    }
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }

  markEmailAsTouched(): void {
    const emailControl = this.loginForm.get('email');
    if (emailControl) {
      emailControl.markAsTouched();
    }
  }

  markPasswordAsTouched(): void {
    const passwordControl = this.loginForm.get('password');
    if (passwordControl) {
      passwordControl.markAsTouched();
    }
  }

  // 🎭 3D Card Tilt Effect
  onMouseMove(event: MouseEvent): void {
    const card = document.querySelector('.login-card') as HTMLElement;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate tilt (max ±5 degrees)
    this.tiltX = ((x - centerX) / centerX) * 5;
    this.tiltY = ((y - centerY) / centerY) * -5;

    // Store mouse position for parallax
    this.mouseX = x - centerX;
    this.mouseY = y - centerY;
  }

  // 🎯 Enhanced Input Focus Handlers
  onEmailFocus(): void {
    this.isEmailFocused = true;
    setTimeout(() => (this.isEmailFocused = false), 300);
  }

  onPasswordFocus(): void {
    this.isPasswordFocused = true;
    setTimeout(() => (this.isPasswordFocused = false), 300);
  }

  // 🔒 Password Toggle with Animation
  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  // 🚀 Submit with Visual Effects

  // ✨ Ripple Effect on Button Click
  private createRipple(): void {
    const button = document.querySelector('.premium-btn') as HTMLElement;
    if (!button) return;

    const ripple = document.createElement('span');
    ripple.classList.add('ripple');

    const rippleContainer = button.querySelector('.ripple-container');
    if (rippleContainer) {
      rippleContainer.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    }
  }

  // 🎉 Confetti Celebration (called after successful login)
  private createConfetti(): void {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;

    const colors = ['#FF6B35', '#F7931E', '#FDC830', '#37B34A'];
    const confettiCount = 50;

    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti-piece';
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.backgroundColor =
        colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDelay = `${Math.random() * 0.5}s`;
      confetti.style.animationDuration = `${2 + Math.random() * 2}s`;

      canvas.appendChild(confetti);
      setTimeout(() => confetti.remove(), 4000);
    }
  }
}
