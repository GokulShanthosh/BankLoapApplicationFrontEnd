import { Component, OnInit } from '@angular/core';
import { LoanService } from '../../service/loan.service';
import { CommonModule, CurrencyPipe } from '@angular/common';
@Component({
  selector: 'app-my-loans',
  templateUrl: './my-loans.component.html',
  styleUrls: ['./my-loans.component.css'],
  imports: [CurrencyPipe, CommonModule]
})
export class MyLoansComponent implements OnInit {
  loans: any[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(private loanService: LoanService) {}

  ngOnInit(): void {
    this.fetchMyLoans();
  }

  fetchMyLoans(): void {
    this.isLoading = true;
    this.loanService.getMyForms().subscribe({
      next: (response) => {
        this.loans = response.data || [];
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to fetch loans';
        this.isLoading = false;
      }
    });
  }

  withdrawApplication(applicationId: string): void {
    if (confirm('Are you sure you want to withdraw this application?')) {
      this.loanService.withdrawApplication({ applicationId }).subscribe({
        next: () => {
          this.loans = this.loans.filter(loan => loan.applicationId !== applicationId);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to withdraw application';
        }
      });
    }
  }
}