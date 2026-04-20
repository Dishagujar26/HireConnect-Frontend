import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  ApplicationService,
  RecruiterJobApplicationResponse
} from '../../../core/services/application.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmModalService } from '../../../core/services/confirm-modal.service';
import { ProfileService } from '../../../core/services/profile.service';

@Component({
  selector: 'app-job-applications',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './job-applications.html',
  styleUrl: './job-applications.css'
})
export class RecruiterJobApplicationsComponent implements OnInit {
  jobId!: number;
  applications: RecruiterJobApplicationResponse[] = [];
  isLoading = false;

  // [Disha Gujar] : Track which candidateId is currently being downloaded
  downloadingResumeFor: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private appService: ApplicationService,
    private toastService: ToastService,
    private confirmModal: ConfirmModalService,
    private profileService: ProfileService
  ) {}

  ngOnInit(): void {
    this.jobId = Number(this.route.snapshot.paramMap.get('jobId'));
    this.loadApplications();
  }

  loadApplications(): void {
    this.isLoading = true;

    this.appService.getApplicationsByJob(this.jobId).subscribe({
      next: (res) => {
        this.applications = res;
        this.isLoading = false;
      },
      error: () => {
        this.toastService.show('Failed to load applications', 'error');
        this.isLoading = false;
      }
    });
  }

  async updateStatus(app: RecruiterJobApplicationResponse, status: string): Promise<void> {
    const confirmed = await this.confirmModal.open({
      title: 'Update Application Status',
      message: `Are you sure you want to mark this application as ${status}?`,
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      variant: status === 'REJECTED' ? 'danger' : 'primary'
    });

    if (!confirmed) return;

    this.appService.updateStatus(app.applicationId, status).subscribe({
      next: () => {
        app.status = status;
        this.toastService.show('Application status updated', 'success');
      },
      error: () => {
        this.toastService.show('Failed to update application status', 'error');
      }
    });
  }

  // [Disha Gujar] : Resume Download Operations ────────────────────────────────────────

  downloadResume(candidateId: number): void {
    if (this.downloadingResumeFor === candidateId) return; // [Disha Gujar] : prevent double-click

    this.downloadingResumeFor = candidateId;

    this.profileService.downloadResumeForRecruiter(candidateId, this.jobId).subscribe({
      next: (blob) => {
        this.downloadingResumeFor = null;
        const fileName = `resume-candidate-${candidateId}.pdf`;
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = fileName;
        anchor.click();
        window.URL.revokeObjectURL(url);
        this.toastService.show('Resume downloaded', 'success');
      },
      error: (err) => {
        this.downloadingResumeFor = null;
        const msg = err?.status === 403
          ? 'Access denied — you can only download resumes for candidates who applied to your jobs.'
          : 'Resume not available for this candidate.';
        this.toastService.show(msg, 'error');
      }
    });
  }

  get shortlistedCount(): number {
    return this.applications.filter(app => app.status === 'SHORTLISTED').length;
  }

  get rejectedCount(): number {
    return this.applications.filter(app => app.status === 'REJECTED').length;
  }
}