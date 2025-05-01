import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';
import { adminGuard } from './auth/admin.guard';

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
    path: 'reset-password/:token',
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
    
  },
  {
    path: 'admin-dashboard',
    loadComponent: () =>
      import('./admin-dashboard/admin-dashboard.component').then(
        (c) => c.AdminDashboardComponent
      ),
    canActivate: [authGuard, adminGuard],
  },
  {
    path: 'user-dashboard',
    loadComponent: () => 
      import('./user-dashboard/user-dashboard.component').then(
        c => c.UserDashboardComponent
      ),
    canActivate: [authGuard],
    children: [
      { 
        path: '', 
        redirectTo: 'plans', 
        pathMatch: 'full' 
      },
      {
        path: 'plans',
        loadComponent: () => 
          import('./loan-plans/loan-plans.component').then(
            c => c.LoanPlansComponent
          )
      },
      {
        path: 'apply-form',
        loadComponent: () => 
          import('./loan-application-form/loan-application-form.component').then(
            c => c.LoanApplicationFormComponent
          )
      },
      // {
      //   path: 'apply',
      //   loadComponent: () => 
      //     import('./apply-loan/apply-loan.component').then(
      //       c => c.ApplyLoanComponent
      //     )
      // },
      {
        path: 'review',
        loadComponent: () => 
          import('./loan-review/loan-review.component').then(
            c => c.LoanReviewComponent
          )
      },
      {
        path: 'my-loans',
        loadComponent: () => 
          import('./my-loans/my-loans.component').then(
            c => c.MyLoansComponent
          )
      },
      {
        path: 'loan-selection',
        loadComponent: () => 
          import('./loan-selection/loan-selection.component').then(
            c => c.LoanSelectionComponent
          )
      },
      {
        path: 'success',
        loadComponent: () =>
          import('./success-modal/success-modal.component').then(
            c => c.SuccessModalComponent
          )
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];