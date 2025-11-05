import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  type FormGroup,
  Validators,
  ReactiveFormsModule,
  type AbstractControl,
  type ValidationErrors,
} from '@angular/forms';
import { Router } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzUploadModule, type NzUploadFile } from 'ng-zorro-antd/upload';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';
import { FirebaseAuthService } from '../../core/services/firebase-auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
    NzUploadModule,
    NzAvatarModule,
    NzDividerModule,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  themeService = inject(ThemeService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private message = inject(NzMessageService);
  private authService = inject(AuthService);
  private firebaseAuth = inject(FirebaseAuthService);

  registerForm: FormGroup;
  passwordVisible = false;
  confirmPasswordVisible = false;
  isLoading = false;
  isGoogleLoading = false;
  avatarUrl: string | null = null;

  // 🎨 Enhanced Interactive States
  mouseX = 0;
  mouseY = 0;
  tiltX = 0;
  tiltY = 0;
  isUsernameFocused = false;
  isEmailFocused = false;
  isPasswordFocused = false;
  isConfirmPasswordFocused = false;

  constructor() {
    this.registerForm = this.fb.group(
      {
        username: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]],
        avatar: [null],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );
  }

  get isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }

  // 📊 Progress Calculator
  getProgress(): number {
    let filled = 0;
    let total = 5; // username, email, password, confirmPassword, avatar

    if (this.registerForm.get('username')?.value) filled++;
    if (this.registerForm.get('email')?.value) filled++;
    if (this.registerForm.get('password')?.value) filled++;
    if (this.registerForm.get('confirmPassword')?.value) filled++;
    if (this.avatarUrl) filled++;

    return Math.round((filled / total) * 100);
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value
      ? null
      : { passwordMismatch: true };
  }

  beforeUpload = (file: NzUploadFile): boolean => {
    const isImage = file.type?.startsWith('image/');
    if (!isImage) {
      this.message.error('You can only upload image files!');
      return false;
    }
    const isLt2M = file.size! / 1024 / 1024 < 2;
    if (!isLt2M) {
      this.message.error('Image must be smaller than 2MB!');
      return false;
    }

    // Preview the image
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.avatarUrl = e.target.result;
      // Store base64 in form
      this.registerForm.patchValue({ avatar: e.target.result });
    };
    reader.readAsDataURL(file as any);

    return false; // Prevent auto upload
  };

  removeAvatar(): void {
    this.avatarUrl = null;
    this.registerForm.patchValue({ avatar: null });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;

      // Prepare registration data
      const registerData = {
        username: this.registerForm.value.username,
        email: this.registerForm.value.email,
        password: this.registerForm.value.password,
        profilePicture: this.avatarUrl || undefined, // 👈 Include avatar if exists
      };

      // Call AuthService register
      this.authService.register(registerData).subscribe({
        next: (response) => {
          this.isLoading = false;
          // Success message already shown by AuthService
          // Redirect to dashboard page (user is now logged in)
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLoading = false;
          // Error message already shown by AuthService
          console.error('Registration error:', error);
        },
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.values(this.registerForm.controls).forEach((control) => {
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

      // Store user data using AuthService
      this.authService.handleGoogleAuth(response);

      this.message.success(`Welcome, ${response.username}!`);
      this.isGoogleLoading = false;
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      this.isGoogleLoading = false;
      this.message.error(error.message || 'Google sign-in failed');
      console.error('Google sign-in error:', error);
    }
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  markEmailAsTouched(): void {
    const emailControl = this.registerForm.get('email');
    if (emailControl) {
      emailControl.markAsTouched();
    }
  }

  markPasswordAsTouched(): void {
    const passwordControl = this.registerForm.get('password');
    if (passwordControl) {
      passwordControl.markAsTouched();
    }
  }

  markUsernameAsTouched(): void {
    const usernameControl = this.registerForm.get('username');
    if (usernameControl) {
      usernameControl.markAsTouched();
    }
  }

  // 🎭 3D Card Tilt Effect
  onMouseMove(event: MouseEvent): void {
    const card = document.querySelector('.register-card') as HTMLElement;
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
  onUsernameFocus(): void {
    this.isUsernameFocused = true;
    setTimeout(() => (this.isUsernameFocused = false), 300);
  }

  onEmailFocus(): void {
    this.isEmailFocused = true;
    setTimeout(() => (this.isEmailFocused = false), 300);
  }

  onPasswordFocus(): void {
    this.isPasswordFocused = true;
    setTimeout(() => (this.isPasswordFocused = false), 300);
  }

  onConfirmPasswordFocus(): void {
    this.isConfirmPasswordFocused = true;
    setTimeout(() => (this.isConfirmPasswordFocused = false), 300);
  }

  // 🔒 Password Toggle with Animation
  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  toggleConfirmPasswordVisibility(): void {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }

  // 🚀 Submit with Visual Effects
  onSubmitWithEffect(): void {
    if (this.registerForm.invalid) {
      Object.values(this.registerForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    // Trigger ripple effect
    this.createRipple();

    // Call original submit
    this.onSubmit();
  }

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
}
