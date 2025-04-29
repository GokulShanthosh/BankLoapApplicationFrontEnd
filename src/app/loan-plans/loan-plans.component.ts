import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-loan-plans',
  templateUrl: './loan-plans.component.html',
  styleUrls: ['./loan-plans.component.css'],
  imports: [CommonModule],
  standalone: true
})
export class LoanPlansComponent {
  loanPlans = [
    {
      type: 'Home Loan',
      interestRate: '8.5%',
      maxAmount: '₹50,00,000',
      tenure: 'Up to 30 years'
    },
    {
      type: 'Vehicle Loan',
      interestRate: '9.5%',
      maxAmount: '₹20,00,000',
      tenure: 'Up to 7 years'
    },
    {
      type: 'Personal Loan',
      interestRate: '12%',
      maxAmount: '₹10,00,000',
      tenure: 'Up to 5 years'
    }
  ];
}