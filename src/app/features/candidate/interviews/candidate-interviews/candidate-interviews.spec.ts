import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { CandidateInterviewsComponent } from './candidate-interviews';
import { InterviewService, InterviewResponse } from '../../../../core/services/interview.service';
import { ToastService } from '../../../../core/services/toast.service';

const mockInterviewService = {
  getCandidateInterviews: vi.fn(),
  formatInterviewType: vi.fn((t) => t)
};
const mockToastService = { show: vi.fn() };

const mockInterviews: InterviewResponse[] = [
  { id: 1, title: 'Screening', status: 'SCHEDULED', interviewType: 'ONLINE', meetingLink: 'zoom.com', applicationId: 1, scheduledAt: '2024-01-01', durationMinutes: 30, notes: '' },
  { id: 2, title: 'Technical', status: 'COMPLETED', interviewType: 'OFFLINE', location: 'Office', applicationId: 1, scheduledAt: '2024-01-02', durationMinutes: 60, notes: '' },
  { id: 3, title: 'HR', status: 'CANCELLED', interviewType: 'ONLINE', meetingLink: 'gmeet.com', applicationId: 1, scheduledAt: '2024-01-03', durationMinutes: 30, notes: '' }
];

describe('CandidateInterviewsComponent', () => {
  let component: CandidateInterviewsComponent;
  let fixture: ComponentFixture<CandidateInterviewsComponent>;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockInterviewService.getCandidateInterviews.mockReturnValue(of(mockInterviews));

    await TestBed.configureTestingModule({
      imports: [CandidateInterviewsComponent],
      providers: [
        { provide: InterviewService, useValue: mockInterviewService },
        { provide: ToastService, useValue: mockToastService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CandidateInterviewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load interviews on init', () => {
    expect(mockInterviewService.getCandidateInterviews).toHaveBeenCalled();
  });

  it('should separate scheduled and completed interviews', () => {
    expect(component.scheduledInterviews.length).toBe(2); // SCHEDULED + CANCELLED
    expect(component.completedInterviews.length).toBe(1); // COMPLETED
  });

  it('should return correct interview title', () => {
    expect(component.getInterviewTitle(mockInterviews[0])).toBe('Screening');
    expect(component.getInterviewTitle({} as any)).toBe('Interview');
  });

  it('should return correct mode text for online', () => {
    expect(component.getModeText(mockInterviews[0])).toBe('zoom.com');
  });

  it('should return correct mode text for offline', () => {
    expect(component.getModeText(mockInterviews[1])).toBe('Office');
  });

  it('should show toast on load error', async () => {
    vi.clearAllMocks();
    mockInterviewService.getCandidateInterviews.mockReturnValue(throwError(() => new Error('err')));
    component.loadInterviews();
    await fixture.whenStable();
    expect(mockToastService.show).toHaveBeenCalledWith('Failed to load interviews', 'error');
  });
});
