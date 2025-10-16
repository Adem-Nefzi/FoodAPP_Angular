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
import { AuthService } from '../../core/services/auth.service'; // Import AuthService

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
  private authService = inject(AuthService); // Inject AuthService

  loginForm: FormGroup;
  passwordVisible = false;
  isLoading = false;

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]], // Changed to 8
      remember: [true],
    });
  }

  get isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;

      // Get form values
      const credentials = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password,
      };

      // Call AuthService login
      this.authService.login(credentials).subscribe({
        next: (response) => {
          this.isLoading = false;
          // Navigate to home page
          this.router.navigate(['/']);
        },
        error: (error) => {
          this.isLoading = false;
          // Error message is already shown by AuthService
          console.error('Login error:', error);
        },
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.values(this.loginForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
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
}
