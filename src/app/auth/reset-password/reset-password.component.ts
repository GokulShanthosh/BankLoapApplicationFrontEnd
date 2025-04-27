// reset-password.component.ts
import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../service/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  isSubmitting = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  token: string = '';
  tokenValid = true;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  constructor() {
    this.resetPasswordForm = this.fb.group(
      {
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  ngOnInit(): void {
    // Get token from the URL
    this.route.queryParams.subscribe((params) => {
      this.token = params['token'];

      if (!this.token) {
        this.tokenValid = false;
        this.errorMessage =
          'Invalid or missing reset token. Please request a new password reset.';
      }
    });
  }

  // Custom validator to check if password and confirm password match
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password?.value !== confirmPassword?.value) {
      confirmPassword?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  onSubmit(): void {
    if (this.resetPasswordForm.invalid || !this.token) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;
    this.successMessage = null;

    const resetData = {
      token: this.token,
      password: this.resetPasswordForm.value.password,
      confirmPassword: this.resetPasswordForm.value.confirmPassword,
    };

    this.authService.resetPassword(resetData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.successMessage =
          response.message || 'Your password has been successfully reset.';
        this.resetPasswordForm.reset();

        // Redirect to login page after 3 seconds
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage =
          error.error?.message || 'Password reset failed. Please try again.';
      },
    });
  }
}
