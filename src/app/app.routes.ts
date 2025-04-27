// app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login.component').then((c) => c.LoginComponent),
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./auth/signup/signup.component').then((c) => c.SignupComponent),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./auth/forgot-password/forgot-password.component').then(
        (c) => c.ForgotPasswordComponent
      ),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./auth/reset-password/reset-password.component').then(
        (c) => c.ResetPasswordComponent
      ),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/dashboard.component').then(
        (c) => c.DashboardComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'admin-dashboard',
    loadComponent: () =>
      import('./admin-dashboard/admin-dashboard.component').then(
        (c) => c.AdminDashboardComponent
      ),
    canActivate: [authGuard], // Optionally protect this route
  },
  {
    path: 'user-dashboard',
    loadComponent: () =>
      import('./user-dashboard/user-dashboard.component').then(
        (c) => c.UserDashboardComponent
      ),
    canActivate: [authGuard], // Optionally protect this route
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
