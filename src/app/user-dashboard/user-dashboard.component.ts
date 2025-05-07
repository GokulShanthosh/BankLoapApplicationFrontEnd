// user-dashboard.component.ts
import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterLink, RouterLinkActive, RouterOutlet, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate, query, stagger, keyframes, state } from '@angular/animations';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatMenuModule,
    FormsModule,
  ],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css'],
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
    trigger('pulse', [
      transition('normal => hover', [
        animate('0.5s ease-in-out', 
          keyframes([
            style({ transform: 'scale(1)', offset: 0 }),
            style({ transform: 'scale(1.05)', offset: 0.5 }),
            style({ transform: 'scale(1)', offset: 1 })
          ])
        )
      ])
    ]),
    trigger('cardHover', [
      transition('void => *', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate('0.4s cubic-bezier(0.4, 0, 0.2, 1)')
      ]),
      state('hover', style({ transform: 'translateY(-5px)' })),
      transition('* <=> hover', animate('200ms ease-out'))
    ]),
    trigger('staggerSlide', [
      transition(':enter', [
        query('.input-group', [
          style({ opacity: 0, transform: 'translateX(-50px)' }),
          stagger(150, [
            animate('0.5s ease-out', 
              style({ opacity: 1, transform: 'translateX(0)' }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('navAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})

export class UserDashboardComponent implements OnInit{
  loanAmount = 500000;
  tenure = 5;
  interestRate = 8.5;
  emi = 0;
  isLoggedIn = true; // Since this is user dashboard, user is logged in
  currentUser: any;
  showScrollButton = false;
  hoverState: 'normal' | 'hover' = 'normal'; 
  activeTab: string = 'overview';

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

  specialties = [
    { icon: 'rocket_launch', title: 'Instant Approval', text: 'Get loan approval within 24 hours' },
    { icon: 'currency_exchange', title: 'Low Interest Rates', text: 'Starting from 7.5% interest rates' },
    { icon: 'shield', title: 'Secure Process', text: '100% secure application process' },
    { icon: 'support_agent', title: '24/7 Support', text: 'Dedicated customer support team' },
    { 
      icon: 'payments', 
      title: 'Flexible Repayment', 
      text: 'Customizable repayment schedules' 
    },
    { 
      icon: 'cloud', 
      title: 'Online Management', 
      text: 'Manage your loan completely online' 
    }
  ];

  loanPlans = [
    {
      type: 'Home Loan',
      interest: '8.5% - 9.5%',
      amount: 'Up to ₹10 Crores',
      features: ['Flexible tenure', 'Balance transfer facility', 'Tax benefits'],
      emi: '₹8,325 per lakh'
    },
    {
      type: 'Personal Loan',
      interest: '10.5% - 14%',
      amount: 'Up to ₹50 Lakhs',
      features: ['Instant approval', 'No collateral', 'Flexible repayment'],
      emi: '₹2,250 per lakh'
    },
    {
      type: 'Vehicle Loan',
      interest: '7.5% - 8.5%',
      amount: 'Up to ₹2 Crores',
      features: ['100% financing', 'Quick processing', 'Insurance options'],
      emi: '₹2,050 per lakh'
    }
  ];

  testimonials = [
    {
      name: 'Rahul Sharma',
      text: 'Excellent service and quick loan processing. Got my home loan approved within 3 days!',
      rating: 5
    },
    // Add more testimonials
  ];

  constructor(private authService: AuthService, private router: Router, private route: ActivatedRoute) {
    this.isLoggedIn = this.authService.isAuthenticated();
    this.currentUser = this.authService.getCurrentUser();
    this.calculateEMI();
    // console.log(this.currentUser);
    
  }

  ngOnInit(): void {
    if(this.authService.isAuthenticated() && this.authService.getCurrentUser()?.role === 'admin'){
      console.log(this.authService.getCurrentUser());
       
      this.router.navigate(['/admin-dashboard']);
    }
  }

  calculateEMI() {
    const monthlyRate = this.interestRate / 1200;
    const months = this.tenure * 12;
    this.emi = this.loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months) / 
              (Math.pow(1 + monthlyRate, months) - 1);
  }

  applyNow() {
    this.router.navigate(['loan-selection'], { relativeTo: this.route });
  }

  viewPlanDetails(planType: string) {
    this.router.navigate(['plans'], { 
      relativeTo: this.route,
      state: { selectedPlan: planType } 
    });
  }

  getStars(rating: number) {
    return Array(rating).fill(0);
  }

  isActive(path: string): boolean {
    return this.router.url.includes(path);
  }

  clickLogout(){
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}