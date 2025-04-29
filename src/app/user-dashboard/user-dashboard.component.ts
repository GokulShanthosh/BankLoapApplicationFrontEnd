import { Component } from '@angular/core';
import { LoanPlansComponent } from '../loan-plans/loan-plans.component';
import { ApplyLoanComponent } from '../apply-loan/apply-loan.component';
import { MyLoansComponent } from '../my-loans/my-loans.component';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css'],
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLinkActive, RouterLink]
})
export class UserDashboardComponent {
  constructor(private router: Router, private route: ActivatedRoute) {}
  
  isActive(path: string): boolean {
    return this.router.url.includes(path);
  }
}