import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-loan-selection',
  templateUrl: './loan-selection.component.html',
  styleUrls: ['./loan-selection.component.css']
})
export class LoanSelectionComponent {
  loanTypes = [
    { id: 'home', name: 'Home Loan' },
    { id: 'vehicle', name: 'Vehicle Loan' },
    { id: 'personal', name: 'Personal Loan' }
  ];

  constructor(private router: Router) {}

  selectLoanType(loanType: string) {
    this.router.navigate(['/user-dashboard/apply-loan-form'], {
      queryParams: { type: loanType }
    });
  }
}