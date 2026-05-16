import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { JobResponse, JobService } from '../../../../core/services/job.service';
import { ApplicationService } from '../../../../core/services/application.service';
import { ToastService } from '../../../../core/services/toast.service';
import { catchError, throwError } from 'rxjs';

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
  currentApplication: any = null;
  fromApplications = false;

  constructor(
    private route: ActivatedRoute,
    private jobService: JobService,
    private applicationService: ApplicationService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const jobId = Number(this.route.snapshot.paramMap.get('jobId'));
    this.fromApplications = this.route.snapshot.queryParamMap.get('from') === 'applications';

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
        this.currentApplication = (applications || []).find(app => app.jobId === jobId);
        this.alreadyApplied = !!this.currentApplication;
      },
      error: () => {
        this.alreadyApplied = false;
        this.currentApplication = null;
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
        this.loadMyApplications(this.job!.jobId); // Refresh to get status
        this.toastService.show('Applied successfully', 'success');
      },
      error: (error) => {
        this.isApplying = false;
        const message = error?.error?.message || 'Failed to apply';
        this.toastService.show(message, 'error');
      }
    });
  }

  respondToOffer(accept: boolean): void {
    if (!this.currentApplication) return;

    const primaryStatus = accept ? 'OFFER_ACCEPTED' : 'OFFER_REJECTED';
    const fallbackStatus = accept ? 'ACCEPTED' : 'REJECTED';
    const actionText = accept ? 'accept' : 'reject';

    this.applicationService.updateStatus(this.currentApplication.id, primaryStatus).pipe(
      catchError((error) => {
        // Backward-compatible fallback for environments that still use legacy statuses.
        return this.applicationService.updateStatus(this.currentApplication.id, fallbackStatus).pipe(
          catchError(() => throwError(() => error))
        );
      })
    ).subscribe({
      next: () => {
        this.toastService.show(`Offer ${actionText}ed successfully`, 'success');
        this.currentApplication.status = primaryStatus;
      },
      error: (error) => {
        console.error(`Error ${actionText}ing offer:`, error);
        const errorMessage = error?.error?.message || `Failed to ${actionText} offer`;
        this.toastService.show(errorMessage, 'error');
      }
    });
  }

  // ─── Pipeline Logic ────────────────────────────────────────────────────────

  get applicationStatus(): string | null {
    return this.currentApplication?.status ?? null;
  }

  // 0: Applied, 1: Shortlisted, 2: Offer Sent, 3: Final decision
  get pipelineCurrentIndex(): number {
    const s = this.applicationStatus;
    if (!s) return 0;

    if (s === 'APPLIED') return 0;
    if (s === 'SHORTLISTED') return 1;
    if (s === 'ACCEPTED') return 2;
    if (s === 'OFFER_ACCEPTED') return 4; // Complete
    if (s === 'OFFER_REJECTED') return 4; // Complete
    if (s === 'REJECTED') return 1;

    return 2;
  }

  get pipelineFinalDecisionTitle(): string {
    const s = this.applicationStatus;
    if (s === 'OFFER_ACCEPTED') return 'Offer Accepted';
    if (s === 'OFFER_REJECTED') return 'Offer Rejected';
    if (s === 'REJECTED') return 'Rejected';
    return 'Document Verification';
  }

  get pipelineSteps(): Array<{ title: string }> {
    return [
      { title: 'Applied' },
      { title: 'Shortlisted' },
      { title: 'Offer Received' },
      { title: this.pipelineFinalDecisionTitle }
    ];
  }

  formatSalary(): string {
    if (!this.job) {
      return '';
    }
    return `₹${this.job.salaryMin} - ₹${this.job.salaryMax}`;
  }
}