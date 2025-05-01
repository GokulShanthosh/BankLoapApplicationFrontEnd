import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
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
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
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
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isSubmitting = false;
  errorMessage: string | null = null;
  hidePassword = true;
  shakeState = 'idle';
  
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {
    // Animation initialization if needed
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      this.shakeState = 'shake';
      setTimeout(() => {
        this.shakeState = 'idle';
      }, 800);
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        const userRole = response.data.user.role;
        
        this.snackBar.open(`Welcome back! Logging in as ${userRole}`, 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: 'success-snackbar'
        });
        
        if (userRole === 'admin') {
          this.router.navigate(['/admin-dashboard']);
        } else if (userRole === 'user') {
          this.router.navigate(['/user-dashboard']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = error.error?.message || 'Login failed. Please try again.';
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
    const email = this.loginForm.get('email');
    if (email?.hasError('required')) {
      return 'You must enter an email';
    }
    return email?.hasError('email') ? 'Not a valid email' : '';
  }

  getPasswordErrorMessage() {
    const password = this.loginForm.get('password');
    if (password?.hasError('required')) {
      return 'You must enter a password';
    }
    return password?.hasError('minlength') ? 'Password must be at least 6 characters' : '';
  }
}