import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-apply-loan',
  templateUrl: './apply-loan.component.html',
  styleUrls: ['./apply-loan.component.css']
})
export class ApplyLoanComponent {
  constructor(private router: Router) {}

  navigateToLoanSelection() {
    this.router.navigate(['/user-dashboard/loan-selection']);
  }
}