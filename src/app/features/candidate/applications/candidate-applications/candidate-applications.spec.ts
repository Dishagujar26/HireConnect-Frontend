import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidateApplications } from './candidate-applications';

describe('CandidateApplications', () => {
  let component: CandidateApplications;
  let fixture: ComponentFixture<CandidateApplications>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CandidateApplications],
    }).compileComponents();

    fixture = TestBed.createComponent(CandidateApplications);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
