import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { RecruiterInterviewsComponent } from './recruiter-interviews';
import { InterviewService, InterviewResponse } from '../../../../core/services/interview.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmModalService } from '../../../../core/services/confirm-modal.service';
import { ProfileService } from '../../../../core/services/profile.service';
import { Component } from '@angular/core';

// Mock the child component
@Component({
  selector: 'app-interview-feedback-modal',
  standalone: true,
  template: '',
})
class MockFeedbackModalComponent {}

const mockInterviewService = {
  getRecruiterInterviews: vi.fn(),
  cancelInterview: vi.fn(),
  updateInterview: vi.fn()
};
const mockToastService = { show: vi.fn() };
const mockConfirmModal = { open: vi.fn().mockResolvedValue(true) };
const mockProfileService = { getCandidateFullProfile: vi.fn() };

const mockInterviews: InterviewResponse[] = [
  { id: 1, title: 'Screening', status: 'SCHEDULED', interviewType: 'ONLINE', meetingLink: 'zoom.com', applicationId: 1, scheduledAt: '2024-01-01', durationMinutes: 30, notes: '', candidateId: 100, jobId: 10 },
  { id: 2, title: 'Technical', status: 'COMPLETED', interviewType: 'OFFLINE', location: 'Office', applicationId: 1, scheduledAt: '2024-01-02', durationMinutes: 60, notes: '', candidateId: 101, jobId: 10, updatedAt: '2024-01-03' }
];

describe('RecruiterInterviewsComponent', () => {
  let component: RecruiterInterviewsComponent;
  let fixture: ComponentFixture<RecruiterInterviewsComponent>;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockInterviewService.getRecruiterInterviews.mockReturnValue(of(mockInterviews));
    mockProfileService.getCandidateFullProfile.mockReturnValue(of({ firstName: 'John', lastName: 'Doe' }));

    await TestBed.configureTestingModule({
      imports: [RecruiterInterviewsComponent],
      providers: [
        { provide: InterviewService, useValue: mockInterviewService },
        { provide: ToastService, useValue: mockToastService },
        { provide: ConfirmModalService, useValue: mockConfirmModal },
        { provide: ProfileService, useValue: mockProfileService }
      ]
    }).overrideComponent(RecruiterInterviewsComponent, {
      remove: { imports: [] }, // We can't easily remove from standalone imports in override yet
      add: { }
    }).compileComponents();

    fixture = TestBed.createComponent(RecruiterInterviewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load interviews and categorize them', () => {
    expect(mockInterviewService.getRecruiterInterviews).toHaveBeenCalled();
    expect(component.activeInterviews.length).toBe(1);
    expect(component.completedInterviews.length).toBe(1);
  });

  it('should load candidate names on init', () => {
    expect(mockProfileService.getCandidateFullProfile).toHaveBeenCalled();
    expect(component.candidateNames.get(100)).toBe('John Doe');
  });

  it('should return correct candidate name from map', () => {
    expect(component.getCandidateName(100)).toBe('John Doe');
    expect(component.getCandidateName(999)).toBe('Candidate #999');
  });

  it('should cancel interview after confirmation', async () => {
    mockConfirmModal.open.mockResolvedValue(true);
    mockInterviewService.cancelInterview.mockReturnValue(of({}));
    await component.cancelInterview(1);
    expect(mockInterviewService.cancelInterview).toHaveBeenCalledWith(1);
    expect(mockToastService.show).toHaveBeenCalledWith('Interview cancelled successfully', 'success');
  });

  it('should open feedback modal', () => {
    const iv = mockInterviews[1];
    component.openCompleteModal(iv);
    expect(component.selectedInterview).toEqual(iv);
    expect(component.showFeedbackModal).toBe(true);
  });

  it('should format type correctly', () => {
    expect(component.formatType('ONLINE_INTERVIEW')).toBe('ONLINE INTERVIEW');
  });
});
