import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../service/auth.service';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
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
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
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
    MatSnackBarModule,
    MatCheckboxModule
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
export class SignupComponent implements OnInit {
  signupForm: FormGroup;
  isSubmitting = false;
  errorMessage: string | null = null;
  hidePassword = true;
  hideConfirmPassword = true;
  shakeState = 'idle';
  
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  constructor() {
    this.signupForm = this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  ngOnInit(): void {
    // Animation initialization if needed
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
    if (this.signupForm.invalid) {
      this.markFormGroupTouched(this.signupForm);
      this.shakeState = 'shake';
      setTimeout(() => {
        this.shakeState = 'idle';
      }, 800);
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;

    this.authService.signup(this.signupForm.value).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        
        this.snackBar.open('Account created successfully! Welcome aboard.', 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: 'success-snackbar'
        });
        
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
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

  getNameErrorMessage() {
    const name = this.signupForm.get('name');
    if (name?.hasError('required')) {
      return 'You must enter your name';
    }
    return name?.hasError('minlength') ? 'Name must be at least 3 characters' : '';
  }

  getEmailErrorMessage() {
    const email = this.signupForm.get('email');
    if (email?.hasError('required')) {
      return 'You must enter an email';
    }
    return email?.hasError('email') ? 'Not a valid email' : '';
  }

  getPasswordErrorMessage() {
    const password = this.signupForm.get('password');
    if (password?.hasError('required')) {
      return 'You must enter a password';
    }
    return password?.hasError('minlength') ? 'Password must be at least 6 characters' : '';
  }

  getConfirmPasswordErrorMessage() {
    const confirmPassword = this.signupForm.get('confirmPassword');
    if (confirmPassword?.hasError('required')) {
      return 'You must confirm your password';
    }
    if (confirmPassword?.hasError('passwordMismatch')) {
      return 'Passwords do not match';
    }
    return '';
  }
}