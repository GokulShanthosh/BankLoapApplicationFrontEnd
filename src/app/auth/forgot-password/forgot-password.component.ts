import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
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
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
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
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  isSubmitting = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  shakeState = 'idle';

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  constructor() {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      this.markFormGroupTouched(this.forgotPasswordForm);
      this.shakeState = 'shake';
      setTimeout(() => {
        this.shakeState = 'idle';
      }, 800);
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;
    this.successMessage = null;

    const { email } = this.forgotPasswordForm.value;

    this.authService.forgotPassword({ email }).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.successMessage =
          response.message ||
          'Password reset instructions have been sent to your email.';
        
        this.snackBar.open(this.successMessage, 'Close', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: 'success-snackbar'
        });
        
        this.forgotPasswordForm.reset();
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage =
          error.error?.message || 'Request failed. Please try again.';
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

  getEmailErrorMessage() {
    const email = this.forgotPasswordForm.get('email');
    if (email?.hasError('required')) {
      return 'You must enter an email';
    }
    return email?.hasError('email') ? 'Not a valid email' : '';
  }
}