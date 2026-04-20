import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidateInterviews } from './candidate-interviews';

describe('CandidateInterviews', () => {
  let component: CandidateInterviews;
  let fixture: ComponentFixture<CandidateInterviews>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CandidateInterviews],
    }).compileComponents();

    fixture = TestBed.createComponent(CandidateInterviews);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
