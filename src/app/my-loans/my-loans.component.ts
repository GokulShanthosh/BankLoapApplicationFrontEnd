import { Component, OnInit } from '@angular/core';
import { LoanService, LoanForm } from '../../service/loan.service';
import { CommonModule, CurrencyPipe } from '@angular/common';

// Define interface for loan form data
interface LoanFormData {
  applicationId: string;
  loanPurpose?: string;
  loanAmount: number;
  status: string;
  [key: string]: any; // Allow for additional properties
}

@Component({
  selector: 'app-my-loans',
  templateUrl: './my-loans.component.html',
  styleUrls: ['./my-loans.component.css'],
  standalone: true,
  imports: [CommonModule, CurrencyPipe]
})
export class MyLoansComponent implements OnInit {
  loans: {
    applicationId: string;
    loanType: string;
    loanAmount: number;
    status: string;
  }[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(private loanService: LoanService) {}

  ngOnInit(): void {
    this.fetchMyLoans();
  }

  fetchMyLoans(): void {
    console.log("Fetching loans...");
    this.isLoading = true;
    this.errorMessage = '';
    
    this.loanService.getMyForms().subscribe({
      next: (response: any) => {
        console.log("Raw response:", response);
        
        // Handle the specific data structure
        if (response.data && response.data.loginForms) {
          this.loans = response.data.loginForms.map((form: LoanFormData) => {
            return {
              applicationId: form.applicationId,
              loanType: form.loanPurpose || 'Personal Loan',
              loanAmount: form.loanAmount,
              status: form.status
            };
          });
        } else if (Array.isArray(response.data)) {
          this.loans = response.data.map((form: LoanFormData) => {
            return {
              applicationId: form.applicationId,
              loanType: form.loanPurpose || 'Personal Loan',
              loanAmount: form.loanAmount,
              status: form.status
            };
          });
        }
        
        console.log("Processed loans:", this.loans);
        this.isLoading = false;
      },
      error: (error) => {
        console.error("Error fetching loans:", error);
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