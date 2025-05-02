import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

@Component({
  selector: 'app-loan-plans',
  templateUrl: './loan-plans.component.html',
  styleUrls: ['./loan-plans.component.css'],
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms ease-in', style({ opacity: 1 }))
      ])
    ]),
    trigger('staggerSlide', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(100, [
            animate('600ms cubic-bezier(0.4, 0, 0.2, 1)',
              style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class LoanPlansComponent {
  loanPlans = [
    {
      type: 'Home Loan',
      interestRate: '8.5%',
      maxAmount: 'Up to ₹50 Lakhs',
      tenure: '30 Years Tenure'
    },
    {
      type: 'Vehicle Loan',
      interestRate: '9.5%',
      maxAmount: 'Up to ₹20 Lakhs',
      tenure: '7 Years Tenure'
    },
    {
      type: 'Personal Loan',
      interestRate: '12%',
      maxAmount: 'Up to ₹10 Lakhs',
      tenure: '5 Years Tenure'
    }
  ];
}