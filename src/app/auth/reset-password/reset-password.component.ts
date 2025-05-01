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
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { 
  trigger, 
  state, 
  style, 
  transition, 
  animate,
  query,
  stagger
} from '@angular/animations';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterLink,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  animations: [
    trigger('fadeIn', [
      state('void', style({ opacity: 0 })),
      transition(':enter', [
        animate('0.5s ease-in-out', style({ opacity: 1 }))
      ])
    ]),
    trigger('formElements', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(100, [
            animate('0.5s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('shake', [
      state('idle', style({ transform: 'translateX(0)' })),
      state('shake', style({ transform: 'translateX(0)' })),
      transition('idle => shake', [
        animate('0.4s', style({ transform: 'translateX(-10px)' })),
        animate('0.1s', style({ transform: 'translateX(10px)' })),
        animate('0.1s', style({ transform: 'translateX(-10px)' })),
        animate('0.1s', style({ transform: 'translateX(10px)' })),
        animate('0.1s', style({ transform: 'translateX(0)' }))
      ])
    ])
  ]
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  isSubmitting = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  token: string | null = null;
  tokenValid = true;
  shakeState = 'idle';
  hidePassword = true;
  hideConfirmPassword = true;
  
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

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
    // Get token from the URL parameters
    this.route.params.subscribe((params) => {
      this.token = params['token'];
      if (!this.token) {
        this.tokenValid = false;
        this.errorMessage =
          'Invalid or missing reset token. Please use the link from your email.';
        this.shakeState = 'shake';
        setTimeout(() => {
          this.shakeState = 'idle';
        }, 800);
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
    if (this.resetPasswordForm.invalid || !this.tokenValid || !this.token) {
      this.markFormGroupTouched(this.resetPasswordForm);
      this.shakeState = 'shake';
      setTimeout(() => {
        this.shakeState = 'idle';
      }, 800);
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
        this.successMessage = 'Your password has been successfully reset.';
        this.resetPasswordForm.reset();
        
        this.snackBar.open('Password reset successful! Redirecting to login...', 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: 'success-snackbar'
        });
        
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage =
          error.error?.message || 'Password reset failed. Please try again.';
        this.shakeState = 'shake';
        setTimeout(() => {
          this.shakeState = 'idle';
        }, 800);
      },
    });
  }
  
  // Helper to mark all controls as touched for validation display
  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }
}