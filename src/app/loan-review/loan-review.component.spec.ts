import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanReviewComponent } from './loan-review.component';

describe('LoanReviewComponent', () => {
  let component: LoanReviewComponent;
  let fixture: ComponentFixture<LoanReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoanReviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoanReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
