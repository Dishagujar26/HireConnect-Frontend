import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { JobDetailsComponent } from './job-details';
import { JobService } from '../../../../core/services/job.service';
import { ApplicationService } from '../../../../core/services/application.service';
import { ToastService } from '../../../../core/services/toast.service';

import { JobResponse } from '../../../../core/services/job.service';

const mockJobService = { getJobById: vi.fn() };
const mockApplicationService = {
  getMyApplications: vi.fn(),
  applyToJob: vi.fn(),
  updateStatus: vi.fn()
};
const mockToastService = { show: vi.fn() };

const mockJob: JobResponse = { jobId: 1, title: 'Job 1', salaryMin: 10, salaryMax: 20, description: 'desc', companyName: 'Co', location: 'Loc', jobType: 'FULL_TIME', experienceLevel: 'MID', skillsRequired: 'Skills', status: 'OPEN' };

describe('JobDetailsComponent', () => {
  let component: JobDetailsComponent;
  let fixture: ComponentFixture<JobDetailsComponent>;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockJobService.getJobById.mockReturnValue(of(mockJob));
    mockApplicationService.getMyApplications.mockReturnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [JobDetailsComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: { get: () => '1' },
              queryParamMap: { get: () => null }
            }
          }
        },
        { provide: JobService, useValue: mockJobService },
        { provide: ApplicationService, useValue: mockApplicationService },
        { provide: ToastService, useValue: mockToastService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(JobDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load job details on init', () => {
    expect(mockJobService.getJobById).toHaveBeenCalledWith(1);
    expect(component.job).toEqual(mockJob);
  });

  it('should check if already applied on init', () => {
    mockApplicationService.getMyApplications.mockReturnValue(of([{ jobId: 1, status: 'APPLIED' }]));
    component.ngOnInit();
    expect(component.alreadyApplied).toBe(true);
  });

  it('should allow applying to job', () => {
    mockApplicationService.applyToJob.mockReturnValue(of({}));
    mockApplicationService.getMyApplications.mockReturnValue(of([{ jobId: 1, status: 'APPLIED' }]));
    component.applyToJob();
    expect(mockApplicationService.applyToJob).toHaveBeenCalledWith(1);
    expect(component.alreadyApplied).toBe(true);
  });

  it('should handle apply failure', () => {
    mockApplicationService.applyToJob.mockReturnValue(throwError(() => ({ error: { message: 'Fail' } })));
    component.applyToJob();
    expect(mockToastService.show).toHaveBeenCalledWith('Fail', 'error');
    expect(component.isApplying).toBe(false);
  });

  it('should respond to offer (accept)', () => {
    component.currentApplication = { id: 10, status: 'OFFER_SENT' };
    mockApplicationService.updateStatus.mockReturnValue(of({}));
    component.respondToOffer(true);
    expect(mockApplicationService.updateStatus).toHaveBeenCalledWith(10, 'OFFER_ACCEPTED');
    expect(mockToastService.show).toHaveBeenCalledWith('Offer accepted successfully', 'success');
  });

  it('should format salary correctly', () => {
    expect(component.formatSalary()).toBe('₹10 - ₹20');
  });
});
