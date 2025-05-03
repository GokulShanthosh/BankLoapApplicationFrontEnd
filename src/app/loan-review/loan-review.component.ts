import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LoanService, LoanForm } from '../../service/loan.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SuccessModalComponent } from '../success-modal/success-modal.component';
import { MatIconModule } from '@angular/material/icon';
import { 
  trigger, 
  transition, 
  style, 
  animate, 
  keyframes ,
  query,
  stagger
} from '@angular/animations';

@Component({
  selector: 'app-loan-review',
  templateUrl: './loan-review.component.html',
  styleUrls: ['./loan-review.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  animations: [
    // Fade In Animation
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('600ms cubic-bezier(0.4, 0, 0.2, 1)', 
          style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
  
    // Slide In Right Animation
    trigger('slideInRight', [
      transition(':enter', [
        style({ transform: 'translateX(50px)', opacity: 0 }),
        animate('600ms 200ms cubic-bezier(0.4, 0, 0.2, 1)', 
          style({ transform: 'translateX(0)', opacity: 1 }))
      ])
    ]),
  
    // Fade In Up Animation
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('500ms 300ms cubic-bezier(0.4, 0, 0.2, 1)', 
          style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
  
    // Stagger Slide Animation
    trigger('staggerSlide', [
      transition(':enter', [
        query('button', [
          style({ opacity: 0, transform: 'translateX(50px)' }),
          stagger('100ms', [
            animate('600ms cubic-bezier(0.4, 0, 0.2, 1)',
              style({ opacity: 1, transform: 'translateX(0)' }))
          ])
        ])
      ])
    ])
  ]
})
export class LoanReviewComponent implements OnInit {
  formData: any = null;
  loanType: 'home' | 'personal' | 'vehicle' | 'business' = 'home';
  calculating = false;
  emi: number = 0;
  interestRate: number = 0;
  processingFee: number = 0;
  totalAmount: number = 0;
  incomeProof!: File;
  collateralProof!:File;

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
    const state = navigation?.extras?.state as { formData: any, loanType: 'home' | 'personal' | 'vehicle' | 'business' };
    
      // Fallback to service if no state data
      const serviceData = this.loanService.getLoanApplicationData();
      if (serviceData) {
        this.formData = serviceData.formData;
        this.loanType = serviceData.loanType;
        this.incomeProof = serviceData.files.incomeProof;
        this.collateralProof = serviceData.files.collateralDoc;
        this.calculateLoanDetails();
      } else {
        this.handleNoDataError();
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
    this.loanService.setLoanApplicationData({
      formData: this.formData,
      loanType: this.loanType
    });

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
    const formDataToSend = new FormData();

    formDataToSend.append('applicationId', applicationId);
    formDataToSend.append('applicantName', this.formData.personalDetails.applicantName);
    formDataToSend.append('dob', this.formData.personalDetails.dob);
    formDataToSend.append('gender', this.formData.personalDetails.gender);
    formDataToSend.append('nationality', this.formData.personalDetails.nationality);
    formDataToSend.append('aadharNumber', this.formData.personalDetails.aadharNumber);
    formDataToSend.append('panNumber', this.formData.personalDetails.panNumber);
    formDataToSend.append('emailId', this.formData.personalDetails.emailId);
    formDataToSend.append('phoneNumber', this.formData.personalDetails.phoneNumber);
    formDataToSend.append('residentialAddress', this.formData.personalDetails.residentialAddress);
    formDataToSend.append('permanentAddress', this.formData.personalDetails.permanentAddress);
    formDataToSend.append('employmentType', this.formData.personalDetails.employmentType);
    formDataToSend.append('income', this.formData.personalDetails.income.toString());
    formDataToSend.append('bankName', this.formData.bankDetails.bankName);
    formDataToSend.append('accountNumber', this.formData.bankDetails.accountNumber);
    formDataToSend.append('ifscCode', this.formData.bankDetails.ifscCode);
    formDataToSend.append('loanAmount', this.formData.loanDetails.loanAmount.toString());
    formDataToSend.append('loanTenure', this.formData.loanDetails.loanTenure.toString());
    formDataToSend.append('loanType', this.loanType);
    formDataToSend.append('status', 'Pending');
    formDataToSend.append('createdAt', new Date().toISOString());

    // Optional: Loan purpose (for personal loan)
    if (this.formData.loanDetails.loanPurpose) {
      formDataToSend.append('loanPurpose', this.formData.loanDetails.loanPurpose);
    }

    // Employment-specific fields
    const empType = this.formData.personalDetails.employmentType;
    if (empType === 'salaried') {
      formDataToSend.append('companyName', this.formData.personalDetails.companyName);
    } else if (empType === 'self_employed') {
      formDataToSend.append('selfEmploymentType', this.formData.personalDetails.selfEmploymentType);
    } else if (empType === 'business') {
      formDataToSend.append('businessType', this.formData.personalDetails.businessType);
    }

    // Collateral (for non-personal loans)
    if (this.loanType !== 'personal') {
      formDataToSend.append('collateralType', this.formData.loanDetails.collateralType);
      formDataToSend.append('collateralValue', this.formData.loanDetails.collateralValue.toString());
      formDataToSend.append('collateralDescription', this.formData.loanDetails.collateralDescription);
    }

    console.log(this.formData);  
    // File uploads
    if (this.incomeProof) {
      
      
      formDataToSend.append('incomeProof', this.incomeProof);
    }

    if (this.loanType !== 'personal' && this.collateralProof) {
      formDataToSend.append('collateralDocument', this.collateralProof);
    }

    this.loanService.createLoanApplication(formDataToSend).subscribe({
      next: (response) => {
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
