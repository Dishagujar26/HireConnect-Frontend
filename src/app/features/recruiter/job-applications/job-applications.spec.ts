import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { RecruiterJobApplicationsComponent } from './job-applications';
import { ApplicationService } from '../../../core/services/application.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmModalService } from '../../../core/services/confirm-modal.service';
import { ProfileService } from '../../../core/services/profile.service';
import { JobService } from '../../../core/services/job.service';

import { RecruiterJobApplicationResponse } from '../../../core/services/application.service';

const mockAppService = {
  getApplicationsByJob: vi.fn(),
  updateStatus: vi.fn()
};
const mockToastService = { show: vi.fn() };
const mockConfirmModal = { open: vi.fn().mockResolvedValue(true) };
const mockProfileService = { getCandidateFullProfile: vi.fn(), downloadResumeForRecruiter: vi.fn() };
const mockJobService = { getJobMatchScore: vi.fn() };

const mockApplications: RecruiterJobApplicationResponse[] = [
  { applicationId: 1, candidateId: 100, jobId: 1, status: 'APPLIED', appliedAt: '2024-01-01' },
  { applicationId: 2, candidateId: 101, jobId: 1, status: 'SHORTLISTED', appliedAt: '2024-01-02' }
];

describe('RecruiterJobApplicationsComponent', () => {
  let component: RecruiterJobApplicationsComponent;
  let fixture: ComponentFixture<RecruiterJobApplicationsComponent>;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockAppService.getApplicationsByJob.mockReturnValue(of(mockApplications));
    mockProfileService.getCandidateFullProfile.mockReturnValue(of({ skills: [] }));

    await TestBed.configureTestingModule({
      imports: [RecruiterJobApplicationsComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => '1' } } }
        },
        { provide: ApplicationService, useValue: mockAppService },
        { provide: ToastService, useValue: mockToastService },
        { provide: ConfirmModalService, useValue: mockConfirmModal },
        { provide: ProfileService, useValue: mockProfileService },
        { provide: JobService, useValue: mockJobService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RecruiterJobApplicationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load applications on init', () => {
    expect(mockAppService.getApplicationsByJob).toHaveBeenCalledWith(1);
    expect(component.applications.length).toBe(2);
  });

  it('should update status after confirmation', async () => {
    mockConfirmModal.open.mockResolvedValue(true);
    mockAppService.updateStatus.mockReturnValue(of({}));
    const app = { applicationId: 1, status: 'APPLIED' } as any;
    await component.updateStatus(app, 'SHORTLISTED');
    expect(mockAppService.updateStatus).toHaveBeenCalledWith(1, 'SHORTLISTED');
    expect(app.status).toBe('SHORTLISTED');
    expect(mockToastService.show).toHaveBeenCalledWith('Application status updated', 'success');
  });

  it('should not update status if cancelled', async () => {
    mockConfirmModal.open.mockResolvedValue(false);
    const app = { applicationId: 1, status: 'APPLIED' } as any;
    await component.updateStatus(app, 'REJECTED');
    expect(mockAppService.updateStatus).not.toHaveBeenCalled();
  });

  it('should return correct shortlisted count', () => {
    expect(component.shortlistedCount).toBe(1);
  });

  it('should return correct rejected count', () => {
    expect(component.rejectedCount).toBe(0);
  });

  it('should format status label correctly', () => {
    expect(component.getStatusLabel('ACCEPTED')).toBe('OFFER SENT');
    expect(component.getStatusLabel('OFFER_ACCEPTED')).toBe('ACCEPTED');
  });
});
