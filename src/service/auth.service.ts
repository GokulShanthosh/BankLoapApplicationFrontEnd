// auth.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  status: string;
  token: string;
  data: {
    user: User;
  };
}

export interface SignupRequest {
  name: string;
  email: string;
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

export interface UpdatePasswordRequest {
  passwordCurrent: string;
  password: string;
  confirmPassword: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/v1/users'; // Update with your backend URL
  private tokenKey = 'auth_token';
  private userKey = 'user';
  private userSubject = new BehaviorSubject<User | null>(null);

  public user$ = this.userSubject.asObservable();

  private http = inject(HttpClient);

  constructor() {
    this.loadUserFromLocalStorage();
  }

  private loadUserFromLocalStorage(): void {
    const userString = localStorage.getItem(this.userKey);
    if (userString) {
      try {
        const user = JSON.parse(userString) as User;
        this.userSubject.next(user);
      } catch (error) {
        console.error('Error parsing user from local storage:', error);
        this.logout();
      }
    }
  }

  // Register a new user
  signup(signupData: SignupRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/signUp`, signupData)
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
  ): Observable<{ status: string; message: string }> {
    return this.http.post<{ status: string; message: string }>(
      `${this.apiUrl}/forgotPassword`,
      forgotPasswordData
    );
  }

  // Reset password with token
  resetPassword(resetData: ResetPasswordRequest): Observable<AuthResponse> {
    return this.http.patch<AuthResponse>( // Using http.patch
      `${this.apiUrl}/resetPassword/${resetData.token}`,
      {
        password: resetData.password,
        confirmPassword: resetData.confirmPassword,
      }
    );
  }
  // Update user password
  updatePassword(updateData: UpdatePasswordRequest): Observable<AuthResponse> {
    return this.http.patch<AuthResponse>(
      `${this.apiUrl}/updatePassword`,
      updateData
    );
  }

  // Logout user
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
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
    localStorage.setItem(this.userKey, JSON.stringify(authResult.data.user));
    this.userSubject.next(authResult.data.user);
  }

  // Get the current authenticated user
  getCurrentUser(): User | null {
    return this.userSubject.value;
  }
}
