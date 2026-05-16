import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { CandidateApplicationsComponent } from './candidate-applications';
import { ApplicationService } from '../../../../core/services/application.service';
import { JobService } from '../../../../core/services/job.service';
import { ToastService } from '../../../../core/services/toast.service';

import { CandidateApplicationResponse } from '../../../../core/services/application.service';
import { JobResponse } from '../../../../core/services/job.service';

const mockApplicationService = { getMyApplications: vi.fn() };
const mockJobService = { getOpenJobs: vi.fn() };
const mockToastService = { show: vi.fn() };

const mockApplications: CandidateApplicationResponse[] = [
  { id: 1, jobId: 10, status: 'APPLIED', appliedAt: '2024-01-01' },
  { id: 2, jobId: 11, status: 'SHORTLISTED', appliedAt: '2024-01-02' },
  { id: 3, jobId: 12, status: 'REJECTED', appliedAt: '2024-01-03' },
  { id: 4, jobId: 13, status: 'OFFER_ACCEPTED', appliedAt: '2024-01-04' }
];

const mockJobs: JobResponse[] = [
  { jobId: 10, title: 'Angular Dev', companyName: 'TechCorp', location: 'Mumbai', description: 'desc', jobType: 'FULL_TIME', experienceLevel: 'MID', salaryMin: 10, salaryMax: 20, skillsRequired: 'Angular', status: 'OPEN' },
  { jobId: 11, title: 'Java Dev', companyName: 'SoftInc', location: 'Pune', description: 'desc', jobType: 'FULL_TIME', experienceLevel: 'MID', salaryMin: 10, salaryMax: 20, skillsRequired: 'Java', status: 'OPEN' }
];

describe('CandidateApplicationsComponent', () => {
  let component: CandidateApplicationsComponent;
  let fixture: ComponentFixture<CandidateApplicationsComponent>;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockApplicationService.getMyApplications.mockReturnValue(of(mockApplications));
    mockJobService.getOpenJobs.mockReturnValue(of(mockJobs));

    await TestBed.configureTestingModule({
      imports: [CandidateApplicationsComponent],
      providers: [
        provideRouter([]),
        { provide: ApplicationService, useValue: mockApplicationService },
        { provide: JobService, useValue: mockJobService },
        { provide: ToastService, useValue: mockToastService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CandidateApplicationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load applications on init', () => {
    expect(mockApplicationService.getMyApplications).toHaveBeenCalled();
  });

  it('should set applications from API response', () => {
    expect(component.applications.length).toBe(4);
  });

  it('should set isLoading to false after load', () => {
    expect(component.isLoading).toBe(false);
  });

  it('should default filter to ALL', () => {
    expect(component.activeFilter).toBe('ALL');
  });

  it('should show all applications with ALL filter', () => {
    component.setFilter('ALL');
    expect(component.filteredApplications.length).toBe(4);
  });

  it('should filter APPLIED applications', () => {
    component.setFilter('APPLIED');
    expect(component.filteredApplications.every(a => a.status === 'APPLIED')).toBe(true);
  });

  it('should filter SHORTLISTED applications', () => {
    component.setFilter('SHORTLISTED');
    expect(component.filteredApplications.every(a => a.status === 'SHORTLISTED')).toBe(true);
  });

  it('should filter REJECTED applications (including OFFER_REJECTED)', () => {
    component.setFilter('REJECTED');
    component.filteredApplications.forEach(a => {
      expect(['REJECTED', 'OFFER_REJECTED'].includes(a.status)).toBe(true);
    });
  });

  it('should filter ACCEPTED applications (including OFFER_ACCEPTED)', () => {
    component.setFilter('ACCEPTED');
    component.filteredApplications.forEach(a => {
      expect(['ACCEPTED', 'OFFER_ACCEPTED'].includes(a.status)).toBe(true);
    });
  });

  it('should return correct totalCount', () => {
    expect(component.totalCount).toBe(4);
  });

  it('should return correct appliedCount', () => {
    expect(component.appliedCount).toBe(1);
  });

  it('should return correct shortlistedCount', () => {
    expect(component.shortlistedCount).toBe(1);
  });

  it('should return job title from jobsMap', () => {
    expect(component.getJobTitle(10)).toBe('Angular Dev');
  });

  it('should return fallback job title when job not in map', () => {
    expect(component.getJobTitle(999)).toBe('Job #999');
  });

  it('should return company name from jobsMap', () => {
    expect(component.getCompanyName(10)).toBe('TechCorp');
  });

  it('should return fallback company name when not in map', () => {
    expect(component.getCompanyName(999)).toBe('Company details unavailable');
  });

  it('should return location from jobsMap', () => {
    expect(component.getLocation(11)).toBe('Pune');
  });

  it('should show toast on API error', async () => {
    vi.clearAllMocks();
    mockApplicationService.getMyApplications.mockReturnValue(throwError(() => new Error('err')));
    component.loadApplicationsPageData();
    await fixture.whenStable();
    expect(mockToastService.show).toHaveBeenCalledWith('Failed to load applications', 'error');
  });
});
