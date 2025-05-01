// success-modal.component.ts
import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-success-modal',
  templateUrl: './success-modal.component.html',
  styleUrls: ['./success-modal.component.css'],
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule]
})
export class SuccessModalComponent {
  constructor(
    private router: Router,
    public dialogRef: MatDialogRef<SuccessModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { applicationId: string, message: string }
  ) {}

  viewApplications() {
    this.dialogRef.close();
    this.router.navigate(['/user-dashboard/my-loans']);
  }

  returnToDashboard() {
    this.dialogRef.close();
    this.router.navigate(['/user-dashboard']);
  }
}