// auth.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface User {
  id: string;
  email: string;
  username: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface SignupRequest {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/v1/users'; // Update with your backend URL
  private tokenKey = 'auth_token';
  private userSubject = new BehaviorSubject<User | null>(null);

  public user$ = this.userSubject.asObservable();

  private http = inject(HttpClient);

  constructor() {
    this.loadToken();
  }

  // Load token from localStorage and validate on init
  private loadToken(): void {
    const token = localStorage.getItem(this.tokenKey);
    if (token) {
      this.validateToken().subscribe({
        next: (response) => {
          this.userSubject.next(response.user);
        },
        error: () => {
          // Token invalid or expired
          this.logout();
        },
      });
    }
  }

  // Validate the current token
  validateToken(): Observable<AuthResponse> {
    return this.http.get<AuthResponse>(`${this.apiUrl}/validate-token`);
  }

  // Register a new user
  signup(signupData: SignupRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/signup`, signupData)
      .pipe(
        tap((response) => {
          this.setSession(response);
        })
      );
  }

  // Login user
  login(loginData: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, loginData).pipe(
      tap((response) => {
        this.setSession(response);
      })
    );
  }

  // Send forgot password request
  forgotPassword(
    forgotPasswordData: ForgotPasswordRequest
  ): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/forgot-password`,
      forgotPasswordData
    );
  }

  // Reset password with token
  resetPassword(
    resetData: ResetPasswordRequest
  ): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/reset-password`,
      resetData
    );
  }

  // Logout user
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.userSubject.next(null);
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  // Get current token
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Set session data after successful authentication
  private setSession(authResult: AuthResponse): void {
    localStorage.setItem(this.tokenKey, authResult.token);
    this.userSubject.next(authResult.user);
  }

  // Get the current authenticated user
  getCurrentUser(): User | null {
    return this.userSubject.value;
  }
}
