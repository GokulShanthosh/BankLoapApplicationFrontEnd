// loan.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators'; 
import { throwError } from 'rxjs';

export interface LoanForm {
  applicantName: string;
  applicationId?: string;
  dob: Date;
  nationality: string;
  aadharNumber: string;
  panNumber: string;
  emailId?: string;
  phoneNumber: string;
  residentialAddress: string;
  permanentAddress: string;
  employmentType: string;
  companyName?: string;
  selfEmploymentType?: string;
  bussinessType?: string;
  income: number;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  loanAmount: number;
  loanTenure: number;
  loanPurpose: string;
  status?: string;
  createdAt?: Date;
}

export interface LoanResponse {
  status: string;
  results: number;
  data: LoanForm[];  // Direct array of LoanForm objects
}

export interface ApproveRejectRequest {
  applicationId: string;
  status: string; // 'Approved' or 'Rejected'
}

export interface WithdrawRequest {
  applicationId: string;
}

@Injectable({
  providedIn: 'root',
})
export class LoanService {
  private apiUrl = 'http://localhost:3000/api/v1/applications'; // Update with your backend URL for forms
  private http = inject(HttpClient);

  // Create a new loan application form
  createLoanApplication(formData: LoanForm): Observable<LoanResponse> {
    return this.http.post<LoanResponse>(this.apiUrl, formData);
  }

  // Get all forms (admin only)
  getAllForms(): Observable<LoanResponse> {
    return this.http.get<LoanResponse>(`${this.apiUrl}/`).pipe(

      catchError(error => {
        console.error('Error fetching forms:', error);
        return throwError(() => new Error('Failed to fetch forms'));
      })
    );
  }

  // Get forms for logged in user
  getMyForms(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/get-login-forms`).pipe(
      catchError(error => {
        console.error('Error fetching loans:', error);
        return throwError(() => error);
      })
    );
  }

  // Approve or reject a loan application (admin only)
  approveOrRejectLoan(data: ApproveRejectRequest): Observable<LoanResponse> {
    return this.http.patch<LoanResponse>(
      `${this.apiUrl}/approve-reject-loan`,
      data
    );
  }

  // Withdraw a loan application
  withdrawApplication(data: { applicationId: string }): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/with-draw-application`, {
      body: data
    }).pipe(
      catchError(error => {
        console.error('Error withdrawing application:', error);
        return throwError(() => error);
      })
    );
  }
  
  // Filter forms with pagination, sorting, and field limiting
  getFilteredForms(queryParams: any): Observable<LoanResponse> {
    // Build query string from queryParams object
    const queryString = Object.keys(queryParams)
      .map(key => `${key}=${queryParams[key]}`)
      .join('&');
      
    return this.http.get<LoanResponse>(`${this.apiUrl}?${queryString}`);
  }
  
  // Get a specific form by applicationId
  getFormByApplicationId(applicationId: string): Observable<LoanResponse> {
    return this.http.get<LoanResponse>(`${this.apiUrl}?applicationId=${applicationId}`);
  }
}