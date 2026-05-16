import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { RecruiterJobsComponent } from './recruiter-jobs';
import { JobService, JobResponse } from '../../../../core/services/job.service';
import { ConfirmModalService } from '../../../../core/services/confirm-modal.service';
import { ToastService } from '../../../../core/services/toast.service';
import { PaymentService } from '../../../../core/services/payment.service';

const mockJobService = {
  getRecruiterJobs: vi.fn(),
  deleteJob: vi.fn(),
  markJobAsFeatured: vi.fn()
};
const mockConfirmModal = { open: vi.fn().mockResolvedValue(true) };
const mockToastService = { show: vi.fn() };
const mockPaymentService = { createOrder: vi.fn(), verifyPayment: vi.fn() };

const mockJobs: JobResponse[] = [
  { jobId: 1, title: 'Java Developer', companyName: 'A', location: 'Mumbai', description: 'desc', jobType: 'FULL_TIME', experienceLevel: 'MID', salaryMin: 10, salaryMax: 20, skillsRequired: 'Java', status: 'OPEN', isFeatured: false },
  { jobId: 2, title: 'Angular Developer', companyName: 'B', location: 'Pune', description: 'desc', jobType: 'FULL_TIME', experienceLevel: 'MID', salaryMin: 10, salaryMax: 20, skillsRequired: 'Angular', status: 'CLOSED', isFeatured: true }
];

describe('RecruiterJobsComponent', () => {
  let component: RecruiterJobsComponent;
  let fixture: ComponentFixture<RecruiterJobsComponent>;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockJobService.getRecruiterJobs.mockReturnValue(of(mockJobs));

    await TestBed.configureTestingModule({
      imports: [RecruiterJobsComponent],
      providers: [
        provideRouter([]),
        { provide: JobService, useValue: mockJobService },
        { provide: ConfirmModalService, useValue: mockConfirmModal },
        { provide: ToastService, useValue: mockToastService },
        { provide: PaymentService, useValue: mockPaymentService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RecruiterJobsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load jobs on init', () => {
    expect(mockJobService.getRecruiterJobs).toHaveBeenCalled();
    expect(component.jobs.length).toBe(2);
  });

  it('should filter jobs by search term', () => {
    const event = { target: { value: 'Angular' } } as any;
    component.onSearch(event);
    expect(component.filteredJobs.length).toBe(1);
    expect(component.filteredJobs[0].title).toBe('Angular Developer');
  });

  it('should filter OPEN jobs', () => {
    component.setFilter('OPEN');
    expect(component.filteredJobs.length).toBe(1);
    expect(component.filteredJobs[0].status).toBe('OPEN');
  });

  it('should filter FEATURED jobs', () => {
    component.setFilter('FEATURED');
    expect(component.filteredJobs.length).toBe(1);
    expect(component.filteredJobs[0].isFeatured).toBe(true);
  });

  it('should delete job after confirmation', async () => {
    mockConfirmModal.open.mockResolvedValue(true);
    mockJobService.deleteJob.mockReturnValue(of('Deleted'));
    await component.deleteJob(1);
    expect(mockJobService.deleteJob).toHaveBeenCalledWith(1);
    expect(component.jobs.length).toBe(1);
    expect(mockToastService.show).toHaveBeenCalledWith('Job deleted successfully', 'success');
  });

  it('should not delete job if cancelled', async () => {
    mockConfirmModal.open.mockResolvedValue(false);
    await component.deleteJob(1);
    expect(mockJobService.deleteJob).not.toHaveBeenCalled();
  });

  it('should compute counts correctly', () => {
    expect(component.openJobsCount).toBe(1);
    expect(component.closedJobsCount).toBe(1);
  });
});