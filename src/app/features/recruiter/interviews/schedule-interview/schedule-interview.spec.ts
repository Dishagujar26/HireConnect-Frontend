import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { ScheduleInterviewComponent } from './schedule-interview';
import { InterviewService } from '../../../../core/services/interview.service';
import { ToastService } from '../../../../core/services/toast.service';

const mockInterviewService = { scheduleInterview: vi.fn() };
const mockToastService = { show: vi.fn() };
const mockRouter = { navigate: vi.fn() };

describe('ScheduleInterviewComponent', () => {
  let component: ScheduleInterviewComponent;
  let fixture: ComponentFixture<ScheduleInterviewComponent>;

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [ScheduleInterviewComponent, FormsModule],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => '10' } } }
        },
        { provide: Router, useValue: mockRouter },
        { provide: InterviewService, useValue: mockInterviewService },
        { provide: ToastService, useValue: mockToastService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ScheduleInterviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with applicationId from route', () => {
    expect(component.applicationId).toBe(10);
    expect(component.formData.applicationId).toBe(10);
  });

  it('should call scheduleInterview on valid submit', () => {
    mockInterviewService.scheduleInterview.mockReturnValue(of({}));
    component.formData.scheduledAt = '2024-01-01T10:00';
    component.onSubmit({ invalid: false } as any);
    expect(mockInterviewService.scheduleInterview).toHaveBeenCalled();
    expect(mockToastService.show).toHaveBeenCalledWith('Interview scheduled successfully', 'success');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/recruiter/interviews']);
  });

  it('should show error if form invalid', () => {
    component.onSubmit({ invalid: true } as any);
    expect(mockToastService.show).toHaveBeenCalledWith(expect.any(String), 'error');
  });

  it('should handle schedule failure', () => {
    mockInterviewService.scheduleInterview.mockReturnValue(throwError(() => ({ error: { message: 'Failed' } })));
    component.formData.scheduledAt = '2024-01-01T10:00';
    component.onSubmit({ invalid: false } as any);
    expect(mockToastService.show).toHaveBeenCalledWith('Failed', 'error');
    expect(component.isLoading).toBe(false);
  });
});
