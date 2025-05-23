import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.getCurrentUser()?.role === 'admin') {
    return true;
  }
  
  router.navigate(['/dashboard']);
  return false;
};