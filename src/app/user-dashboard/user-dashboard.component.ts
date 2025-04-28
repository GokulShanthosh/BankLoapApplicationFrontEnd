import { Component } from '@angular/core';
import { LoanPlansComponent } from '../loan-plans/loan-plans.component';
import { ApplyLoanComponent } from '../apply-loan/apply-loan.component';
import { MyLoansComponent } from '../my-loans/my-loans.component';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css'],
  imports: [LoanPlansComponent, ApplyLoanComponent, MyLoansComponent]
})
export class UserDashboardComponent {
  activeTab: string = 'plans'; // Default tab
}