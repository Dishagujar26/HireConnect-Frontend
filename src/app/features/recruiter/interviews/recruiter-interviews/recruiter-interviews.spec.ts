import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecruiterInterviewsComponent } from './recruiter-interviews';

describe('RecruiterInterviews', () => {
  let component: RecruiterInterviewsComponent;
  let fixture: ComponentFixture<RecruiterInterviewsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecruiterInterviewsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RecruiterInterviewsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
