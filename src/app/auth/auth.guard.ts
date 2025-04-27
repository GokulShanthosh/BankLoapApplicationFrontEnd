// auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';

// Functional Guard for Angular 15+
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if the user is authenticated
  if (authService.isAuthenticated()) {
    return true;
  }

  // Not authenticated, redirect to login
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
