// admin-dashboard.component.ts
import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, RouterLink, RouterLinkActive } from '@angular/router';
import { LoanService, LoanForm, ApproveRejectRequest } from '../../service/loan.service';
import { AuthService } from '../../service/auth.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { trigger, transition, style, animate, query, stagger, keyframes, state } from '@angular/animations';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatMenuModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatBadgeModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDividerModule,
    MatChipsModule
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms ease-in', style({ opacity: 1 }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateY(50px)', opacity: 0 }),
        animate('600ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ]),
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateX(-50px)' }),
          stagger(100, [
            animate('500ms ease-out', 
            style({ opacity: 1, transform: 'translateX(0)' }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('cardAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('pulse', [
      state('normal', style({ transform: 'scale(1)' })),
      state('hover', style({ transform: 'scale(1.05)' })),
      transition('normal <=> hover', animate('200ms ease-in-out'))
    ]),
    trigger('tableRowAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms 150ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('badgeAnimation', [
      transition(':enter', [
        style({ transform: 'scale(0)', opacity: 0 }),
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({ transform: 'scale(1)', opacity: 1 }))
      ])
    ]),
    trigger('buttonAnimation', [
      state('normal', style({ transform: 'scale(1)' })),
      state('hover', style({ transform: 'scale(1.1)' })),
      transition('normal <=> hover', animate('150ms ease-in-out'))
    ])
  ]
})
export class AdminDashboardComponent implements OnInit {
  forms: LoanForm[] = [];
  loading = false;
  error: string | null = null;
  searchTerm = '';
  statusFilter = 'All';
  showScrollButton = false;
  currentUser: any;
  hoverState: 'normal' | 'hover' = 'normal';
  
  // Dashboard statistics
  totalApplications = 0;
  pendingApplications = 0;
  approvedApplications = 0;
  rejectedApplications = 0;
  recentActivity: any[] = [];
  
  // Card hover states
  cardStates: {[key: string]: 'normal' | 'hover'} = {
    'pending': 'normal',
    'approved': 'normal',
    'rejected': 'normal',
    'total': 'normal'
  };

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.showScrollButton = window.scrollY > 200;
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
 
  constructor(
    private loanService: LoanService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if user is admin
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser || this.currentUser.role !== 'admin') {
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
        // Process the data
        this.forms = response.data || [];
        this.loading = false;
        
        // Calculate statistics
        this.calculateStatistics();
        // Generate recent activity
        this.generateRecentActivity();
      },
      error: (err) => {
        console.error('Error:', err);
        this.error = err.message || 'Failed to load forms';
        this.loading = false;
      }
    });
  }

  calculateStatistics(): void {
    this.totalApplications = this.forms.length;
    this.pendingApplications = this.forms.filter(form => form.status === 'Pending').length;
    this.approvedApplications = this.forms.filter(form => form.status === 'Approved').length;
    this.rejectedApplications = this.forms.filter(form => form.status === 'Rejected').length;
  }

  generateRecentActivity(): void {
    // Sort forms by last updated date (assuming you have this field)
    // For now, we'll just use the most recent 5 entries
    this.recentActivity = this.forms.slice(0, 5).map(form => ({
      applicationId: form.applicationId,
      applicantName: form.applicantName,
      status: form.status,
      date: new Date().toLocaleDateString() // In real app, use actual timestamp
    }));
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
        // Recalculate statistics
        this.calculateStatistics();
        // Update recent activity
        this.generateRecentActivity();
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
  
  // Toggle card hover state
  setCardState(card: string, state: 'normal' | 'hover'): void {
    this.cardStates[card] = state;
  }

  // Format currency
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  }

  // Logout function
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Get status color class
  getStatusClass(status: string | undefined): string {
    if (!status) return '';
    
    switch(status) {
      case 'Approved': return 'status-approved';
      case 'Rejected': return 'status-rejected';
      case 'Pending': return 'status-pending';
      default: return '';
    }
  }
}