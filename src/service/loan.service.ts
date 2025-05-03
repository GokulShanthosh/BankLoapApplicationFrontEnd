// loan.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export interface LoanForm {
  applicantName: string;
  applicationId?: string;
  dob: Date;
  gender: 'male' | 'female' | 'other';
  nationality: string;
  aadharNumber: string;
  panNumber: string;
  emailId: string;
  phoneNumber: string;
  residentialAddress: string;
  permanentAddress: string;
  employmentType: 'salaried' | 'self_employed' | 'business';
  companyName?: string;
  selfEmploymentType?: string;
  businessType?: string;
  income: number;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  loanAmount: number;
  loanTenure: number;
  loanPurpose?: 'education' | 'medical' | 'travel' | 'wedding' | 'debt_consolidation' | 'home_improvement' | 'other';
  loanType: 'home' | 'personal' | 'vehicle' | 'business';
  collateralType?: 'property' | 'vehicle' | 'gold' | 'fd' | 'stocks' | 'other';
  collateralValue?: number;
  collateralDescription?: string;
  incomeProof: string;
  collateralDocument?: string;
  status?: 'Pending' | 'Under Review' | 'Approved' | 'Rejected' | 'Withdrawn';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LoanResponse {
  status: string;
  results: number;
  data: LoanForm[];
}

export interface ApproveRejectRequest {
  applicationId: string;
  status: string;
}

export interface WithdrawRequest {
  applicationId: string;
}

@Injectable({
  providedIn: 'root',
})
export class LoanService {
  private apiUrl = 'http://127.0.0.1:3000/api/v1/applications';
  private http = inject(HttpClient);

  private loanApplicationDataSubject = new BehaviorSubject<any>(null);
  public loanApplicationData$ = this.loanApplicationDataSubject.asObservable();

  // For form navigation/review
  setLoanApplicationData(data: any): void {
    this.loanApplicationDataSubject.next(data);
  }

  getLoanApplicationData(): any {
    return this.loanApplicationDataSubject.getValue();
  }

  // Submit loan application with files (FormData)
  createLoanApplication(formData: FormData): Observable<LoanResponse> {
    return this.http.post<LoanResponse>(`${this.apiUrl}/`, formData).pipe(
      catchError(error => {
        console.error('Error submitting loan:', error);
        return throwError(() => new Error('Failed to submit application'));
      })
    );
  }

  // Admin: Fetch all forms
  getAllForms(): Observable<LoanResponse> {
    return this.http.get<LoanResponse>(`${this.apiUrl}/`).pipe(
      catchError(error => {
        console.error('Error fetching forms:', error);
        return throwError(() => new Error('Failed to fetch forms'));
      })
    );
  }

  // Logged-in user: fetch personal forms
  getMyForms(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/get-login-forms`).pipe(
      catchError(error => {
        console.error('Error fetching user forms:', error);
        return throwError(() => error);
      })
    );
  }

  // Admin: approve or reject application
  approveOrRejectLoan(data: ApproveRejectRequest): Observable<LoanResponse> {
    return this.http.patch<LoanResponse>(
      `${this.apiUrl}/approve-reject-loan`,
      data
    );
  }

  // Withdraw application
  withdrawApplication(data: WithdrawRequest): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/with-draw-application`, {
      body: data,
    }).pipe(
      catchError(error => {
        console.error('Error withdrawing application:', error);
        return throwError(() => error);
      })
    );
  }

  // Filtering & pagination (admin)
  getFilteredForms(queryParams: any): Observable<LoanResponse> {
    const queryString = Object.keys(queryParams)
      .map(key => `${key}=${queryParams[key]}`)
      .join('&');
    return this.http.get<LoanResponse>(`${this.apiUrl}?${queryString}`);
  }

  // Get form by applicationId
  getFormByApplicationId(applicationId: string): Observable<LoanResponse> {
    return this.http.get<LoanResponse>(`${this.apiUrl}?applicationId=${applicationId}`);
  }

  // EMI calculator
  calculateEmi(principal: number, rate: number, tenure: number): number {
    const monthlyRate = rate / (12 * 100);
    const totalMonths = tenure * 12;
    const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths) /
      (Math.pow(1 + monthlyRate, totalMonths) - 1);
    return Math.round(emi);
  }
}
