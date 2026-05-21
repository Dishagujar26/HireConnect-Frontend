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
import { JobService } from '../../../core/services/job.service';
import { Router } from '@angular/router';

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

  // [Disha Gujar] : Resume download state
  downloadingResumeFor: number | null = null;



  // Map to store match scores: candidateId -> MatchScoreResponseDto
  matchScores: { [candidateId: number]: any } = {};

  constructor(
    private route: ActivatedRoute,
    private appService: ApplicationService,
    private toastService: ToastService,
    private confirmModal: ConfirmModalService,
    private profileService: ProfileService,
    private jobService: JobService,
    private router: Router
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
        this.calculateMatchScores();
      },
      error: () => {
        this.toastService.show('Failed to load applications', 'error');
        this.isLoading = false;
      }
    });
  }

  // [Smart Features] : Calculate match scores in parallel for all applicants
  calculateMatchScores(): void {
    this.applications.forEach(app => {
      if (app.candidateId) {
        this.profileService.getCandidateFullProfile(app.candidateId, this.jobId).subscribe({
          next: (profile) => {
            const skills = profile.skills?.map((s: any) => s.name) || [];
            if (skills.length > 0) {
              this.jobService.getJobMatchScore(this.jobId, skills).subscribe({
                next: (score) => {
                  this.matchScores[app.candidateId!] = score;
                }
              });
            }
          }
        });
      }
    });
  }

  getMatchBadgeClass(score: number): string {
    if (score >= 70) return 'match-high';
    if (score >= 40) return 'match-medium';
    return 'match-low';
  }

  // [Disha Gujar] : Navigate to the comprehensive candidate profile page
  viewCandidateProfile(candidateId: number): void {
    this.router.navigate(['/recruiter/candidates', candidateId, 'job', this.jobId]);
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
        this.applications = [...this.applications];
        this.toastService.show('Application status updated', 'success');
      },
      error: () => {
        this.toastService.show('Failed to update application status', 'error');
      }
    });
  }

  // [Disha Gujar] : Resume Download Operations

  downloadResume(candidateId: number, event: Event): void {
    event.stopPropagation(); // prevent card click opening modal
    if (this.downloadingResumeFor === candidateId) return;

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

  getStatusLabel(status: string): string {
    if (status === 'ACCEPTED') return 'OFFER SENT';
    if (status === 'OFFER_ACCEPTED') return 'ACCEPTED';
    if (status === 'OFFER_REJECTED') return 'REJECTED BY CANDIDATE';
    return status;
  }
}
