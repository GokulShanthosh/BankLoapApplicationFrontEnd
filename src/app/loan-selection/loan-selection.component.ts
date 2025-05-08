// loan-selection.component.ts
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

interface LoanType {
  id: string;
  name: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-loan-selection',
  templateUrl: './loan-selection.component.html',
  styleUrls: ['./loan-selection.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule],
})
export class LoanSelectionComponent {
  loanTypes: LoanType[] = [
    {
      id: 'home',
      name: 'Home Loan',
      icon: 'home',
      description: 'Finance your dream home with competitive rates',
    },
    {
      id: 'personal',
      name: 'Personal Loan',
      icon: 'person',
      description: 'Flexible loans for your personal needs',
    },
    {
      id: 'vehicle',
      name: 'Vehicle Loan',
      icon: 'directions_car',
      description: 'New or used vehicle financing options',
    },
    {
      id: 'business',
      name: 'Business Loan',
      icon: 'business',
      description: 'Grow your business with our financing solutions',
    },
  ];

  constructor(private router: Router) {}

  selectLoanType(loanType: string) {
    this.router.navigate(['/application-form'], {
      queryParams: { type: loanType },
      state: { loanType: loanType }, // Pass loan type to the next component
    });
  }
}
