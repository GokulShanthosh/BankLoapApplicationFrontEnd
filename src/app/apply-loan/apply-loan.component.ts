import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-apply-loan',
  templateUrl: './apply-loan.component.html',
  styleUrls: ['./apply-loan.component.css'],
  imports:[],
  standalone: true
})
export class ApplyLoanComponent {
  constructor(private router: Router, private route: ActivatedRoute) {}

  navigateToLoanSelection() {
    console.log('Attempting navigation to loan-selection');
    console.log('Current route:', this.router.url);
    
    this.router.navigate(['../loan-selection'], { relativeTo: this.route })
      .then(success => {
        console.log('Navigation success:', success);
      })
      .catch(err => {
        console.error('Navigation error:', err);
      });
    }
}