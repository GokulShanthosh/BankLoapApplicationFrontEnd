import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LoanService, LoanForm } from '../../service/loan.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SuccessModalComponent } from '../success-modal/success-modal.component';

@Component({
  selector: 'app-loan-review',
  templateUrl: './loan-review.component.html',
  styleUrls: ['./loan-review.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class LoanReviewComponent implements OnInit {
  formData: any = null;
  loanType: string = '';
  calculating = false;
  emi: number = 0;
  interestRate: number = 0;
  processingFee: number = 0;
  totalAmount: number = 0;

  constructor(
    private router: Router,
    private loanService: LoanService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadApplicationData();
  }

  private loadApplicationData(): void {
    // Try getting data from router state first
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state as { formData: any, loanType: string };
    
    if (state?.formData) {
      this.formData = state.formData;
      this.loanType = state.loanType;
      this.calculateLoanDetails();
    } else {
      // Fallback to service if no state data
      const serviceData = this.loanService.getLoanApplicationData();
      if (serviceData) {
        this.formData = serviceData.formData;
        this.loanType = serviceData.loanType;
        this.calculateLoanDetails();
      } else {
        this.handleNoDataError();
      }
    }
  }

  private handleNoDataError(): void {
    this.snackBar.open('No loan application data found. Please fill the form first.', 'Close', {
      duration: 3000
    });
    this.router.navigate(['/user-dashboard/apply-form']);
  }

  calculateLoanDetails(): void {
    this.calculating = true;
    
    // Set interest rates based on loan type
    const rates: Record<string, number> = {
      personal: 12.5,
      home: 8.5,
      vehicle: 9.5,
      business: 14.0
    };
    this.interestRate = rates[this.loanType] || 10.0;
    
    // Calculate financials
    const loanAmount = this.formData.loanDetails.loanAmount;
    const tenure = this.formData.loanDetails.loanTenure;
    
    this.processingFee = loanAmount * 0.01;
    this.emi = this.loanService.calculateEmi(loanAmount, this.interestRate, tenure);
    this.totalAmount = this.emi * tenure * 12;
    
    this.calculating = false;
  }

  editApplication(): void {
    this.router.navigate(['/user-dashboard/apply-form'], { 
      state: { 
        formData: this.formData,
        loanType: this.loanType 
      }
    });
  }

  generateApplicationId(): string {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `APP-${timestamp}-${randomStr.toUpperCase()}`;
  }

  submitApplication(): void {
    const applicationId = this.generateApplicationId();
    
    const formattedData: LoanForm = {
      applicationId: applicationId,
      applicantName: this.formData.personalDetails.applicantName,
      dob: new Date(this.formData.personalDetails.dob),
      nationality: this.formData.personalDetails.nationality,
      aadharNumber: this.formData.personalDetails.aadharNumber,
      panNumber: this.formData.personalDetails.panNumber,
      emailId: this.formData.personalDetails.emailId,
      phoneNumber: this.formData.personalDetails.phoneNumber,
      residentialAddress: this.formData.personalDetails.residentialAddress,
      permanentAddress: this.formData.personalDetails.permanentAddress,
      employmentType: this.formData.personalDetails.employmentType,
      income: this.formData.personalDetails.income,
      
      // Employment-specific fields
      ...(this.formData.personalDetails.employmentType === 'salaried' && {
        companyName: this.formData.personalDetails.companyName
      }),
      ...(this.formData.personalDetails.employmentType === 'self_employed' && {
        selfEmploymentType: this.formData.personalDetails.selfEmploymentType
      }),
      ...(this.formData.personalDetails.employmentType === 'business' && {
        bussinessType: this.formData.personalDetails.businessType
      }),
      
      // Bank details
      bankName: this.formData.bankDetails.bankName,
      accountNumber: this.formData.bankDetails.accountNumber,
      ifscCode: this.formData.bankDetails.ifscCode,
      
      // Loan details
      loanAmount: this.formData.loanDetails.loanAmount,
      loanTenure: this.formData.loanDetails.loanTenure,
      loanPurpose: this.formData.loanDetails.loanPurpose,
      // loanType: this.loanType,
      
      // Calculated values
      // emi: this.emi,
      // interestRate: this.interestRate,
      // processingFee: this.processingFee,
      // totalAmount: this.totalAmount,
      status: 'Pending',
      createdAt: new Date() // Now matches Date type in interface
    };

    this.loanService.createLoanApplication(formattedData).subscribe({
      next: (response) => {
        // this.loanService.clearLoanApplicationData();
        this.showSuccessModal(applicationId);
      },
      error: (error) => {
        console.error('Submission error:', error);
        this.snackBar.open('Submission failed. Please try again.', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  private showSuccessModal(applicationId: string): void {
    const dialogRef = this.dialog.open(SuccessModalComponent, {
      width: '450px',
      disableClose: true,
      data: { 
        title: 'Application Submitted',
        message: 'Your loan application has been successfully processed!',
        applicationId: applicationId
      }
    });

    dialogRef.afterClosed().subscribe(() => {
      this.router.navigate(['/user-dashboard/my-loans']);
    });
  }
}