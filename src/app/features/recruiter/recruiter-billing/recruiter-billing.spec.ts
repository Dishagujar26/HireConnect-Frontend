import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecruiterBilling } from './recruiter-billing';

describe('RecruiterBilling', () => {
  let component: RecruiterBilling;
  let fixture: ComponentFixture<RecruiterBilling>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecruiterBilling],
    }).compileComponents();

    fixture = TestBed.createComponent(RecruiterBilling);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
