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
  private authService = inject(AuthService); // 👈 Inject AuthService

  registerForm: FormGroup;
  passwordVisible = false;
  confirmPasswordVisible = false;
  isLoading = false;
  avatarUrl: string | null = null;

  constructor() {
    this.registerForm = this.fb.group(
      {
        username: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]], // 👈 Changed to 8
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
          // Redirect to home page (user is now logged in)
          this.router.navigate(['/']);
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
}
