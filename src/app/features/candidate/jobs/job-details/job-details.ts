import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { JobResponse, JobService } from '../../../../core/services/job.service';
import { ApplicationService } from '../../../../core/services/application.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-job-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './job-details.html',
  styleUrl: './job-details.css'
})
export class JobDetailsComponent implements OnInit {
  job: JobResponse | null = null;
  isLoading = false;
  isApplying = false;
  alreadyApplied = false;

  constructor(
    private route: ActivatedRoute,
    private jobService: JobService,
    private applicationService: ApplicationService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const jobId = Number(this.route.snapshot.paramMap.get('jobId'));

    if (!jobId) {
      this.toastService.show('Invalid job details page', 'error');
      return;
    }

    this.loadJob(jobId);
    this.loadMyApplications(jobId);
  }

  loadJob(jobId: number): void {
    this.isLoading = true;

    this.jobService.getJobById(jobId).subscribe({
      next: (response) => {
        this.job = response;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.toastService.show('Failed to load job details', 'error');
      }
    });
  }

  loadMyApplications(jobId: number): void {
    this.applicationService.getMyApplications().subscribe({
      next: (applications) => {
        this.alreadyApplied = (applications || []).some(app => app.jobId === jobId);
      },
      error: () => {
        this.alreadyApplied = false;
      }
    });
  }

  applyToJob(): void {
    if (!this.job || this.alreadyApplied || this.isApplying) {
      return;
    }

    this.isApplying = true;

    this.applicationService.applyToJob(this.job.jobId).subscribe({
      next: () => {
        this.isApplying = false;
        this.alreadyApplied = true;
        this.toastService.show('Applied successfully', 'success');
      },
      error: (error) => {
        this.isApplying = false;

        const message =
          error?.error?.message ||
          (typeof error?.error === 'string' ? error.error : '') ||
          'Already applied or failed to apply';

        if (message.toLowerCase().includes('already')) {
          this.alreadyApplied = true;
        }

        this.toastService.show(message, 'error');
      }
    });
  }

  formatSalary(): string {
    if (!this.job) {
      return '';
    }
    return `₹${this.job.salaryMin} - ₹${this.job.salaryMax}`;
  }
}