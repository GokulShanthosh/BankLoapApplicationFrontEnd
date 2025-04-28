import {
  HttpInterceptorFn,
  HttpHandlerFn,
  HttpRequest,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';

export const AuthInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Check for token expiration
      const isTokenExpired = 
        error.status === 401 || 
        error.error?.message === 'jwt expired' || 
        (error.error?.stack && error.error.stack.includes('TokenExpiredError'));
      
      if (isTokenExpired) {
        console.log('Token expired, logging out user');
        authService.logout();
        
        // Redirect to login with return URL for better UX
        router.navigate(['/login'], { 
          queryParams: { 
            returnUrl: router.url,
            expired: 'true'
          }
        });
      }
      
      return throwError(() => error);
    })
  );
};