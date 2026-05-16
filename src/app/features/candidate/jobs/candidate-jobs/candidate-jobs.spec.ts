import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { CandidateJobsComponent } from './candidate-jobs';
import { JobService } from '../../../../core/services/job.service';
import { ToastService } from '../../../../core/services/toast.service';

import { JobResponse } from '../../../../core/services/job.service';

const mockJobService = {
  getOpenJobs: vi.fn(),
  getMyApplications: vi.fn(),
  applyToJob: vi.fn()
};
const mockToastService = { show: vi.fn() };

const mockJobs: JobResponse[] = [
  { jobId: 1, title: 'Java Developer', companyName: 'A', location: 'Loc', isFeatured: false, description: 'desc', jobType: 'FULL_TIME', experienceLevel: 'MID', salaryMin: 10, salaryMax: 20, skillsRequired: 'Java', status: 'OPEN' },
  { jobId: 2, title: 'Angular Developer', companyName: 'B', location: 'Loc', isFeatured: true, description: 'desc', jobType: 'FULL_TIME', experienceLevel: 'MID', salaryMin: 10, salaryMax: 20, skillsRequired: 'Angular', status: 'OPEN' }
];

describe('CandidateJobsComponent', () => {
  let component: CandidateJobsComponent;
  let fixture: ComponentFixture<CandidateJobsComponent>;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockJobService.getOpenJobs.mockReturnValue(of(mockJobs));
    mockJobService.getMyApplications.mockReturnValue(of([{ jobId: 1 }]));

    await TestBed.configureTestingModule({
      imports: [CandidateJobsComponent, FormsModule],
      providers: [
        provideRouter([]),
        { provide: JobService, useValue: mockJobService },
        { provide: ToastService, useValue: mockToastService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CandidateJobsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load jobs and applications on init', () => {
    expect(mockJobService.getOpenJobs).toHaveBeenCalled();
    expect(mockJobService.getMyApplications).toHaveBeenCalled();
  });

  it('should sort featured jobs first', () => {
    expect(component.jobs[0].jobId).toBe(2);
  });

  it('should identify applied jobs', () => {
    expect(component.isApplied(1)).toBe(true);
    expect(component.isApplied(2)).toBe(false);
  });

  it('should filter jobs by search term', () => {
    component.searchTerm = 'Angular';
    component.applyFilters();
    expect(component.filteredJobs.length).toBe(1);
    expect(component.filteredJobs[0].title).toBe('Angular Developer');
  });

  it('should filter applied jobs', () => {
    component.setFilter('APPLIED');
    expect(component.filteredJobs.length).toBe(1);
    expect(component.filteredJobs[0].jobId).toBe(1);
  });

  it('should allow applying to a new job', () => {
    mockJobService.applyToJob.mockReturnValue(of({}));
    component.applyToJob(2);
    expect(mockJobService.applyToJob).toHaveBeenCalledWith(2);
    expect(component.isApplied(2)).toBe(true);
  });

  it('should show toast on apply success', () => {
    mockJobService.applyToJob.mockReturnValue(of({}));
    component.applyToJob(2);
    expect(mockToastService.show).toHaveBeenCalledWith('Application submitted successfully', 'success');
  });

  it('should show toast on apply failure', () => {
    mockJobService.applyToJob.mockReturnValue(throwError(() => ({ error: { message: 'Failed' } })));
    component.applyToJob(2);
    expect(mockToastService.show).toHaveBeenCalledWith('Failed', 'error');
  });
});
