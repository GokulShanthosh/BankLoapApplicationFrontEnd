// loan-application-form.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule, Navigation } from '@angular/router';
import { LoanService } from '../../service/loan.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { LoanReviewComponent } from '../loan-review/loan-review.component';
import { SuccessModalComponent } from '../success-modal/success-modal.component';
import { AuthService } from '../../service/auth.service';

import { 
  trigger, 
  transition, 
  style, 
  animate, 
  keyframes 
} from '@angular/animations';

function ageRangeValidator(control: FormControl): { [key: string]: boolean } | null {
  if (control.value) {
    const today = new Date();
    const birthDate = new Date(control.value);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    if (age < 20 || age > 65) {
      return { age: true };
    }
  }
  return null;
}

@Component({
  selector: 'app-loan-application-form',
  templateUrl: './loan-application-form.component.html',
  styleUrls: ['./loan-application-form.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms ease-in', style({ opacity: 1 }))
      ])
    ]),
    trigger('slideInRight', [
      transition(':enter', [
        style({ transform: 'translateX(50px)', opacity: 0 }),
        animate('600ms cubic-bezier(0.4, 0, 0.2, 1)', 
          style({ transform: 'translateX(0)', opacity: 1 }))
      ])
    ]),
    trigger('pulse', [
      transition('normal => hover', [
        animate('1s ease-in-out', 
          keyframes([
            style({ transform: 'scale(1)', offset: 0 }),
            style({ transform: 'scale(1.05)', offset: 0.5 }),
            style({ transform: 'scale(1)', offset: 1 })
          ])
        )
      ])
    ])
  ]
})
export class LoanApplicationFormComponent implements OnInit {
  loanForm!: FormGroup;
  currentStep = 1;
  loanType!: string;
  loanTitle!: string;
  showCompany = false;
  showSelf = false;
  showBusiness = false;
  currentUser: any;
  requiresCollateral = false;
  allowedFileTypes = '.pdf,.jpg,.jpeg,.png';
  maxFileSize = 5 * 1024 * 1024;
  incomeProofFile: File | null = null;
  collateralDocFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private loanService: LoanService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loanType = this.route.snapshot.queryParams['type'] || 'personal';
    this.currentUser = this.authService.getCurrentUser();
    this.setLoanTitle();
    this.initializeForm();
  }

  setLoanTitle() {
    const titles = {
      home: 'Home Loan Application',
      personal: 'Personal Loan Application',
      vehicle: 'Vehicle Loan Application',
      business: 'Business Loan Application'
    };
    this.loanTitle = titles[this.loanType as keyof typeof titles] || 'Loan Application';
    this.requiresCollateral = this.loanType !== 'personal';
  }

  initializeForm() {
    const formConfig: any = {
      personalDetails: this.fb.group({
        applicantName: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(100)]],
        dob: ['', [Validators.required, ageRangeValidator]],
        gender: ['', Validators.required],
        nationality: ['India', Validators.required],
        aadharNumber: ['', [Validators.required, Validators.pattern('^[0-9]{12}$')]],
        panNumber: ['', [Validators.required, Validators.pattern('[A-Z]{5}[0-9]{4}[A-Z]{1}')]],
        emailId: [this.currentUser.email, [Validators.email]],
        phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
        residentialAddress: ['', Validators.required],
        permanentAddress: ['', Validators.required],
        employmentType: ['', Validators.required],
        companyName: [''],
        selfEmploymentType: [''],
        businessType: [''],
        income: ['', [Validators.required, Validators.min(10000)]],
      }),
      bankDetails: this.fb.group({
        bankName: ['', Validators.required],
        accountNumber: ['', [Validators.required, Validators.minLength(9), Validators.maxLength(18), Validators.pattern('^[0-9]+$')]],
        ifscCode: ['', [Validators.required, Validators.minLength(11), Validators.maxLength(11), Validators.pattern('^[A-Za-z0-9]+$')]],
      }),
      loanDetails: this.fb.group({
        loanAmount: ['', [Validators.required, Validators.min(10000)]],
        loanTenure: ['', [Validators.required, Validators.min(1), Validators.max(50)]],
        loanType: [this.loanType, Validators.required]
      }),
      documentUploads: this.fb.group({
        incomeProof: ['', Validators.required]
      })
    };

    if (this.loanType === 'personal') {
      formConfig.loanDetails.addControl('loanPurpose', new FormControl('', Validators.required));
    } else {
      formConfig.loanDetails.addControl('collateralType', new FormControl('', Validators.required));
      formConfig.loanDetails.addControl('collateralValue', new FormControl('', [Validators.required, Validators.min(10000)]));
      formConfig.loanDetails.addControl('collateralDescription', new FormControl('', Validators.required));
      formConfig.documentUploads.addControl('collateralDocument', new FormControl('', Validators.required));
    }

    this.loanForm = this.fb.group(formConfig);

    const navigation: Navigation | null = this.router.getCurrentNavigation();
    if (navigation?.extras?.state?.['formData']) {
      this.loanForm.patchValue(navigation.extras.state['formData']);
    }
  }

  get personalDetails() { return this.loanForm.get('personalDetails') as FormGroup; }
  get bankDetails() { return this.loanForm.get('bankDetails') as FormGroup; }
  get loanDetails() { return this.loanForm.get('loanDetails') as FormGroup; }
  get documentUploads() { return this.loanForm.get('documentUploads') as FormGroup; }

  nextStep() {
    if (this.currentStep < 4 && this.currentStepGroup.valid) {
      this.currentStep++;
    } else {
      this.markFormGroupTouched(this.currentStepGroup);
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  get currentStepGroup(): FormGroup {
    switch (this.currentStep) {
      case 1: return this.personalDetails;
      case 2: return this.bankDetails;
      case 3: return this.loanDetails;
      case 4: return this.documentUploads;
      default: return this.personalDetails;
    }
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  changeEmploymentType() {
    const employmentType = this.personalDetails.get('employmentType')?.value;
    this.showCompany = employmentType === 'salaried';
    this.showSelf = employmentType === 'self_employed';
    this.showBusiness = employmentType === 'business';

    ['companyName', 'selfEmploymentType', 'businessType'].forEach(field => {
      const control = this.personalDetails.get(field);
      control?.clearValidators();
      control?.updateValueAndValidity();
    });

    if (this.showCompany) {
      this.personalDetails.get('companyName')?.setValidators(Validators.required);
    } else if (this.showSelf) {
      this.personalDetails.get('selfEmploymentType')?.setValidators(Validators.required);
    } else if (this.showBusiness) {
      this.personalDetails.get('businessType')?.setValidators(Validators.required);
    }
  }

  toggleSameAddress(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      this.personalDetails.patchValue({
        permanentAddress: this.personalDetails.get('residentialAddress')?.value
      });
    }
  }

  onIncomeProofChange(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      if (file.size > this.maxFileSize) {
        this.snackBar.open('File is too large. Maximum size is 5MB', 'Close', { duration: 3000 });
        fileInput.value = '';
        return;
      }
      this.incomeProofFile = file;
    }
  }

  onCollateralDocChange(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      if (file.size > this.maxFileSize) {
        this.snackBar.open('File is too large. Maximum size is 5MB', 'Close', { duration: 3000 });
        fileInput.value = '';
        return;
      }
      this.collateralDocFile = file;
    }
  }

  

  reviewApplication() {
    this.markFormGroupTouched(this.loanForm);
    if (this.loanForm.valid) {
      const formData = new FormData();
      const formValue = this.loanForm.getRawValue();

      Object.entries(formValue).forEach(([key, value]) => {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          Object.entries(value).forEach(([nestedKey, nestedValue]) => {
            formData.append(`${key}.${nestedKey}`, String(nestedValue ?? ''));
          });
        } else {
          formData.append(key, String(value ?? ''));
        }
      });

      if (this.incomeProofFile) formData.append('incomeProofFile', this.incomeProofFile);
      if (this.requiresCollateral && this.collateralDocFile) formData.append('collateralDocFile', this.collateralDocFile);

      console.log(this.incomeProofFile);
      console.log(this.collateralDocFile);
      
      this.loanService.setLoanApplicationData({
        formData: formValue,
        loanType: this.loanType,
        files: {
          incomeProof: this.incomeProofFile,
          collateralDoc: this.collateralDocFile
        }
      });

      this.router.navigate(['/user-dashboard/review']);
    } else {
      this.snackBar.open('Please fill all required fields correctly', 'Close', { duration: 3000 });
      if (this.personalDetails.invalid) this.currentStep = 1;
      else if (this.bankDetails.invalid) this.currentStep = 2;
      else if (this.loanDetails.invalid) this.currentStep = 3;
      else if (this.documentUploads.invalid) this.currentStep = 4;
    }
  }

  showSuccessModal() {
    this.dialog.open(SuccessModalComponent, {
      width: '400px',
      data: { 
        title: 'Application Submitted',
        message: 'Your loan application has been successfully submitted!'
      }
    });
  }
}