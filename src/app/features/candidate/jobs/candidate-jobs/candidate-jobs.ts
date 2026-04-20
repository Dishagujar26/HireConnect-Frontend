import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { JobResponse, JobService } from '../../../../core/services/job.service';
import { ToastService } from '../../../../core/services/toast.service';

type CandidateFilter = 'ALL' | 'APPLIED' | 'NOT_APPLIED';

@Component({
  selector: 'app-candidate-jobs',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './candidate-jobs.html',
  styleUrl: './candidate-jobs.css'
})
export class CandidateJobsComponent implements OnInit {
  jobs: JobResponse[] = [];
  filteredJobs: JobResponse[] = [];

  isLoading = false;
  errorMessage = '';
  searchTerm = '';
  activeFilter: CandidateFilter = 'NOT_APPLIED';

  appliedJobIds = new Set<number>();
  applyingJobIds = new Set<number>();

  constructor(
    private jobService: JobService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadJobsAndApplications();
  }

  loadJobsAndApplications(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.jobService.getOpenJobs().subscribe({
      next: (response: JobResponse[]) => {
        this.jobs = [...response].sort((a, b) => {
          return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
        });

        this.loadMyApplications();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Failed to load jobs';
        this.isLoading = false;
        this.toastService.show(this.errorMessage, 'error');
      }
    });
  }

  loadMyApplications(): void {
    this.jobService.getMyApplications().subscribe({
      next: (applications: any[]) => {
        this.appliedJobIds = new Set(
          applications.map(app => Number(app.jobId))
        );

        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
        this.applyFilters();
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    const value = this.searchTerm.toLowerCase().trim();

    let result = [...this.jobs];

    if (value) {
      result = result.filter(job =>
        job.title?.toLowerCase().includes(value) ||
        job.companyName?.toLowerCase().includes(value) ||
        job.location?.toLowerCase().includes(value) ||
        job.jobType?.toLowerCase().includes(value) ||
        job.skillsRequired?.toLowerCase().includes(value)
      );
    }

    if (this.activeFilter === 'APPLIED') {
      result = result.filter(job => this.isApplied(Number(job.jobId)));
    } else {
      // [Disha Gujar] : For both 'ALL' and 'NOT_APPLIED', hide already-applied jobs
      result = result.filter(job => !this.isApplied(Number(job.jobId)));
    }

    this.filteredJobs = result;
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters();
  }

  setFilter(filter: CandidateFilter): void {
    this.activeFilter = filter;
    this.applyFilters();
  }

  isApplied(jobId: number): boolean {
    return this.appliedJobIds.has(Number(jobId));
  }

  isApplying(jobId: number): boolean {
    return this.applyingJobIds.has(Number(jobId));
  }

  applyToJob(jobId: number): void {
    if (this.isApplied(jobId) || this.isApplying(jobId)) {
      return;
    }

    this.applyingJobIds.add(jobId);

    this.jobService.applyToJob(jobId).subscribe({
      next: () => {
        this.applyingJobIds.delete(jobId);
        this.appliedJobIds.add(Number(jobId));
        this.applyFilters();
        this.toastService.show('Application submitted successfully', 'success');
      },
      error: (error) => {
        this.applyingJobIds.delete(jobId);
        const message = error?.error?.message || 'Failed to apply for job';
        this.toastService.show(message, 'error');
      }
    });
  }

  formatSalary(job: JobResponse): string {
    return `₹${job.salaryMin.toLocaleString()} - ₹${job.salaryMax.toLocaleString()}`;
  }
}