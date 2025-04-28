// admin-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoanService, LoanForm, ApproveRejectRequest } from '../../service/loan.service';
import { AuthService } from '../../service/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  forms: LoanForm[] = [];
  loading = false;
  error: string | null = null;
  searchTerm = '';
  statusFilter = 'All';
  
  constructor(
    private loanService: LoanService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if user is admin
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      this.router.navigate(['/']);
      return;
    }
    
    this.fetchAllForms();
  }

  fetchAllForms(): void {
    this.loading = true;
    this.error = null;
    
    this.loanService.getAllForms().subscribe({
      next: (response) => {
        // Debug the response structure
        console.log('API Response:', response);
        
        // Corrected data access
        this.forms = response.data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error:', err);
        this.error = err.message || 'Failed to load forms';
        this.loading = false;
      }
    });
  }

  approveOrRejectLoan(applicationId: string, status: 'Approved' | 'Rejected'): void {
    this.loading = true;
    
    const request: ApproveRejectRequest = {
      applicationId,
      status
    };
    
    this.loanService.approveOrRejectLoan(request).subscribe({
      next: (response) => {
        // Update the status in the local array
        const formIndex = this.forms.findIndex(f => f.applicationId === applicationId);
        if (formIndex !== -1) {
          this.forms[formIndex].status = status;
        }
        
        this.loading = false;
        // You could add a success notification here
      },
      error: (err) => {
        console.error('Error updating loan status:', err);
        this.error = `Failed to ${status.toLowerCase()} loan. Please try again.`;
        this.loading = false;
      }
    });
  }

  // Helper function to filter forms by search term and status
  filteredForms(): LoanForm[] {
    return this.forms.filter(form => {
      // Status filter
      if (this.statusFilter !== 'All' && form.status !== this.statusFilter) {
        return false;
      }
      
      // Search term filter
      if (this.searchTerm.trim() === '') {
        return true; // No search filter
      }
      
      const searchLower = this.searchTerm.toLowerCase();
      return (
        form.applicantName?.toLowerCase().includes(searchLower) ||
        form.applicationId?.toLowerCase().includes(searchLower) ||
        form.phoneNumber?.toLowerCase().includes(searchLower) ||
        form.emailId?.toLowerCase().includes(searchLower)
      );
    });
  }
}