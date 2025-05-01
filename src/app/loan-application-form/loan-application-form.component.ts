// loan-application-form.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { LoanService } from '../../service/loan.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { LoanReviewComponent } from '../loan-review/loan-review.component';
import { SuccessModalComponent } from '../success-modal/success-modal.component';

// Custom validator for age (20-65 years)
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
  imports: [CommonModule, ReactiveFormsModule, RouterModule]
})
export class LoanApplicationFormComponent implements OnInit {
  loanForm!: FormGroup;
  currentStep = 1;
  loanType!: string;
  loanTitle!: string;
  showCompany = false;
  showSelf = false;
  showBusiness = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private loanService: LoanService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loanType = this.route.snapshot.queryParams['type'] || 'personal';
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
  }

  initializeForm() {
    this.loanForm = this.fb.group({
      personalDetails: this.fb.group({
        applicantName: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(100)]],
        dob: ['', [Validators.required, ageRangeValidator]],
        gender: ['', Validators.required],
        nationality: ['India', Validators.required],
        aadharNumber: ['', [Validators.required, Validators.pattern('^[0-9]{12}$')]],
        panNumber: ['', [Validators.required, Validators.pattern('[A-Z]{5}[0-9]{4}[A-Z]{1}')]],
        emailId: ['', [Validators.email]],
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
        accountNumber: ['', [
          Validators.required,
          Validators.minLength(9),
          Validators.maxLength(18),
          Validators.pattern('^[0-9]+$')
        ]],
        ifscCode: ['', [
          Validators.required,
          Validators.minLength(11),
          Validators.maxLength(11),
          Validators.pattern('^[A-Za-z0-9]+$')
        ]],
      }),
      loanDetails: this.fb.group({
        loanAmount: ['', [Validators.required, Validators.min(10000)]],
        loanTenure: ['', [Validators.required, Validators.min(1), Validators.max(50)]],
        loanPurpose: ['', Validators.required],
        loanType: [this.loanType, Validators.required]
      }),
    });

    // Check for state data (when coming back from review)
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state?.['formData']) {
      this.loanForm.patchValue(navigation.extras.state?.['formData']);
    }
  }

  // Getter methods for form groups
  get personalDetails() { return this.loanForm.get('personalDetails') as FormGroup; }
  get bankDetails() { return this.loanForm.get('bankDetails') as FormGroup; }
  get loanDetails() { return this.loanForm.get('loanDetails') as FormGroup; }

  nextStep() {
    if (this.currentStep < 3 && this.currentStepGroup.valid) {
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
    switch(this.currentStep) {
      case 1: return this.personalDetails;
      case 2: return this.bankDetails;
      case 3: return this.loanDetails;
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

    // Set validators dynamically
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

  reviewApplication() {
    // Mark all form controls as touched to show validation errors
    this.markFormGroupTouched(this.loanForm);
    console.log(this.loanForm)  ;
    
    if (this.loanForm.valid) {
      // Option 1: Use a service to store the form data
      this.loanService.setLoanApplicationData({
        formData: this.loanForm.getRawValue(),
        loanType: this.loanType
      });
      
      // Then navigate without state
      this.router.navigate(['/user-dashboard/review']);
      
      // Option 2: If you prefer using state, make sure it's passed correctly
      /* 
      this.router.navigateByUrl('/user-dashboard/review', { 
        state: { 
          formData: this.loanForm.getRawValue(),
          loanType: this.loanType
        }
      });
      */
    } else {
      // Show error for invalid form
      this.snackBar.open('Please fill all required fields correctly', 'Close', {
        duration: 3000
      });
      
      // Navigate to the first invalid step
      if (this.personalDetails.invalid) {
        this.currentStep = 1;
      } else if (this.bankDetails.invalid) {
        this.currentStep = 2;
      } else if (this.loanDetails.invalid) {
        this.currentStep = 3;
      }
    }
  }

  showSuccessModal() {
    const dialogRef = this.dialog.open(SuccessModalComponent, {
      width: '400px',
      data: { 
        title: 'Application Submitted',
        message: 'Your loan application has been successfully submitted!'
      }
    });
  }
}