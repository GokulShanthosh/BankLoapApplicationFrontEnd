import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanSelectionComponent } from './loan-selection.component';

describe('LoanSelectionComponent', () => {
  let component: LoanSelectionComponent;
  let fixture: ComponentFixture<LoanSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoanSelectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoanSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
