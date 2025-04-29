import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-loan-selection',
  templateUrl: './loan-selection.component.html',
  styleUrls: ['./loan-selection.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class LoanSelectionComponent {
  loanTypes = [
    { id: 'home', name: 'Home Loan' },
    { id: 'vehicle', name: 'Vehicle Loan' },
    { id: 'personal', name: 'Personal Loan' }
  ];
  
  constructor(private router: Router) {}
  
  selectLoanType(loanType: string) {
    // Navigate to the apply route with the loan type as a query parameter
    this.router.navigate(['/user-dashboard/apply'], {
      queryParams: { type: loanType }
    });
  }
}