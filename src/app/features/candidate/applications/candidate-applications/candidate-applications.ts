import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  ApplicationService,
  CandidateApplicationResponse
} from '../../../../core/services/application.service';
import { JobResponse, JobService } from '../../../../core/services/job.service';
import { ToastService } from '../../../../core/services/toast.service';

type ApplicationFilterType = 'ALL' | 'APPLIED' | 'SHORTLISTED' | 'REJECTED' | 'ACCEPTED';

@Component({
  selector: 'app-candidate-applications',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './candidate-applications.html',
  styleUrl: './candidate-applications.css'
})
export class CandidateApplicationsComponent implements OnInit {
  applications: CandidateApplicationResponse[] = [];
  filteredApplications: CandidateApplicationResponse[] = [];
  jobsMap: Record<number, JobResponse> = {};

  isLoading = false;
  activeFilter: ApplicationFilterType = 'ALL';

  constructor(
    private applicationService: ApplicationService,
    private jobService: JobService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadApplicationsPageData();
  }

  loadApplicationsPageData(): void {
    this.isLoading = true;

    this.applicationService.getMyApplications().subscribe({
      next: (applicationsResponse) => {
        this.applications = applicationsResponse || [];

        this.jobService.getOpenJobs().subscribe({
          next: (jobsResponse) => {
            const jobs = jobsResponse || [];
            this.jobsMap = jobs.reduce((acc: Record<number, JobResponse>, job) => {
              acc[job.jobId] = job;
              return acc;
            }, {});
            this.applyFilter();
            this.isLoading = false;
          },
          error: () => {
            this.jobsMap = {};
            this.applyFilter();
            this.isLoading = false;
          }
        });
      },
      error: () => {
        this.isLoading = false;
        this.toastService.show('Failed to load applications', 'error');
      }
    });
  }

  setFilter(filter: ApplicationFilterType): void {
    this.activeFilter = filter;
    this.applyFilter();
  }

  applyFilter(): void {
    let result = [...this.applications];

    if (this.activeFilter !== 'ALL') {
      result = result.filter(app => app.status === this.activeFilter);
    }

    this.filteredApplications = result;
  }

  getJobTitle(jobId: number): string {
    return this.jobsMap[jobId]?.title || `Job #${jobId}`;
  }

  getCompanyName(jobId: number): string {
    return this.jobsMap[jobId]?.companyName || 'Company details unavailable';
  }

  getLocation(jobId: number): string {
    return this.jobsMap[jobId]?.location || 'Location unavailable';
  }

  get totalCount(): number {
    return this.applications.length;
  }

  get appliedCount(): number {
    return this.applications.filter(app => app.status === 'APPLIED').length;
  }

  get shortlistedCount(): number {
    return this.applications.filter(app => app.status === 'SHORTLISTED').length;
  }

  get rejectedCount(): number {
    return this.applications.filter(app => app.status === 'REJECTED').length;
  }

  get acceptedCount(): number {
    return this.applications.filter(app => app.status === 'ACCEPTED').length;
  }
}