import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProfileService } from '../../../core/services/profile.service';
import { ApplicationService } from '../../../core/services/application.service';
import { JobService, JobResponse } from '../../../core/services/job.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-candidate-profile-page',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink],
  templateUrl: './candidate-profile-page.html',
  styleUrl: './candidate-profile-page.css'
})
export class CandidateProfilePageComponent implements OnInit {
  candidateId!: number;
  jobId!: number;
  
  profile: any = null;
  job: JobResponse | null = null;
  application: any = null;
  isLoading = false;
  isDownloadingResume = false;
  isViewingResume = false;
  isDownloadingOffer = false;

  constructor(
    private route: ActivatedRoute,
    private profileService: ProfileService,
    private applicationService: ApplicationService,
    private jobService: JobService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.candidateId = Number(this.route.snapshot.paramMap.get('candidateId'));
    this.jobId = Number(this.route.snapshot.paramMap.get('jobId'));
    this.loadProfile();
    this.loadJob();
    this.loadApplicationStatus();
  }

  loadProfile(): void {
    this.isLoading = true;
    this.profileService.getCandidateFullProfile(this.candidateId, this.jobId).subscribe({
      next: (data) => {
        this.profile = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        const msg = err?.status === 403
          ? 'Access denied — you can only view profiles for candidates who applied to your jobs.'
          : 'Failed to load candidate profile.';
        this.toastService.show(msg, 'error');
      }
    });
  }

  loadJob(): void {
    this.jobService.getJobById(this.jobId).subscribe({
      next: (data) => {
        this.job = data;
      },
      error: () => {
        // Job details are optional for the pipeline + offer letter.
        this.job = null;
      }
    });
  }

  loadApplicationStatus(): void {
    this.applicationService.getApplicationsByJob(this.jobId).subscribe({
      next: (apps) => {
        this.application = (apps || []).find(a => a.candidateId === this.candidateId) || null;
      },
      error: () => {
        this.application = null;
      }
    });
  }

  // ─── Resume Actions ────────────────────────────────────────────────────────

  viewResume(): void {
    if (!this.profile?.resume?.fileName) return;
    this.isViewingResume = true;
    this.profileService.downloadResumeForRecruiter(this.candidateId, this.jobId).subscribe({
      next: (blob) => {
        this.isViewingResume = false;
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 10000);
      },
      error: () => {
        this.isViewingResume = false;
        this.toastService.show('Failed to load resume.', 'error');
      }
    });
  }

  downloadResume(): void {
    if (!this.profile?.resume?.fileName) return;
    this.isDownloadingResume = true;
    this.profileService.downloadResumeForRecruiter(this.candidateId, this.jobId).subscribe({
      next: (blob) => {
        this.isDownloadingResume = false;
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = this.profile.resume.fileName;
        anchor.click();
        window.URL.revokeObjectURL(url);
        this.toastService.show('Resume downloaded', 'success');
      },
      error: () => {
        this.isDownloadingResume = false;
        this.toastService.show('Failed to download resume.', 'error');
      }
    });
  }

  get applicationStatus(): string | null {
    return this.application?.status ?? null;
  }

  get isOfferAccepted(): boolean {
    return this.applicationStatus === 'OFFER_ACCEPTED';
  }

  // 0: Applied, 1: Shortlisted, 2: Offer Sent, 3: Final decision
  get pipelineCurrentIndex(): number {
    const s = this.applicationStatus;
    if (!s) return 0;

    if (s === 'APPLIED') return 0;
    if (s === 'SHORTLISTED') return 1;
    if (s === 'ACCEPTED') return 2;
    // Mark final step as "completed" so the whole history shows ✓.
    if (s === 'OFFER_ACCEPTED') return 4;
    if (s === 'OFFER_REJECTED') return 4;
    if (s === 'REJECTED') return 1;

    // Fallback: treat unknown statuses as current progress.
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
      { title: 'Application Submitted' },
      { title: 'Shortlisted' },
      { title: 'Offer Sent' },
      { title: this.pipelineFinalDecisionTitle }
    ];
  }

  downloadOfferLetter(): void {
    if (!this.isOfferAccepted) return;

    this.isDownloadingOffer = true;
    this.applicationService.downloadOfferLetterPdf(this.candidateId, this.jobId).subscribe({
      next: (blob) => {
        this.isDownloadingOffer = false;
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `offer-letter-${this.candidateId}.pdf`;
        anchor.click();
        window.URL.revokeObjectURL(url);
        this.toastService.show('Offer letter downloaded', 'success');
      },
      error: (err) => {
        this.isDownloadingOffer = false;
        const msg = err?.error?.message || 'Failed to download offer letter';
        this.toastService.show(msg, 'error');
      }
    });
  }

  private buildOfferLetterHtml(): string {
    const today = new Date();
    const dateStr = today.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: '2-digit' });

    const candidateName = this.fullName;
    const jobTitle = this.job?.title ?? 'N/A';
    const companyName = this.job?.companyName ?? 'N/A';
    const location = this.job?.location ?? '';
    const salaryMin = this.job?.salaryMin ?? null;
    const salaryMax = this.job?.salaryMax ?? null;
    const salaryText = salaryMin != null && salaryMax != null ? `₹${salaryMin} - ₹${salaryMax}` : 'Not disclosed';

    const noticePeriodText =
      this.profile?.noticePeriodDays === 0 ? 'Immediate joiner' :
      this.profile?.noticePeriodDays != null ? `${this.profile.noticePeriodDays} days` :
      'Not specified';

    const workModeText = this.profile?.preferredWorkMode ?? 'Not specified';
    const expectedCtc = this.profile?.expectedSalary != null ? `₹${this.profile.expectedSalary}` : '';

    // Simple, formal template. If you want deeper customization, edit this template function.
    return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Offer Letter</title>
    <style>
      body { font-family: Arial, Helvetica, sans-serif; color: #0f172a; margin: 36px; }
      .header { display:flex; justify-content: space-between; align-items:flex-start; margin-bottom: 22px; }
      .company { font-size: 16px; font-weight: 800; }
      .doc-title { font-size: 22px; font-weight: 900; letter-spacing: -0.4px; }
      .date { font-size: 13px; color: #475569; text-align:right; }
      .section { margin-top: 16px; }
      p { line-height: 1.65; font-size: 14px; margin: 10px 0; }
      .muted { color: #475569; }
      .table { width: 100%; border-collapse: collapse; margin-top: 12px; }
      .table td { padding: 10px 10px; border: 1px solid #e2e8f0; font-size: 13px; }
      .footer { margin-top: 34px; display:flex; justify-content: space-between; }
      .sign { margin-top: 30px; }
      .sign-line { width: 260px; border-top: 1px solid #334155; margin-top: 52px; }
      .sign-name { margin-top: 8px; font-weight: 700; font-size: 13px; }
      @media print { body { margin: 24px; } }
    </style>
  </head>
  <body>
    <div class="header">
      <div>
        <div class="company">${companyName}</div>
        <div class="muted" style="font-size:13px;margin-top:4px;">HR / Talent Acquisition</div>
      </div>
      <div class="date">${dateStr}</div>
    </div>

    <div class="doc-title">OFFICIAL OFFER LETTER</div>
    <div class="section">
      <p>Dear <b>${candidateName}</b>,</p>
      <p>
        We are pleased to offer you the position of <b>${jobTitle}</b> at <b>${companyName}</b>.
        This offer is extended based on your successful evaluation and confirmation of your interest in joining us.
      </p>
      <p class="muted">
        Please review the terms below and respond as instructed to confirm your acceptance.
      </p>
    </div>

    <div class="section">
      <table class="table">
        <tr>
          <td><b>Role</b></td>
          <td>${jobTitle}</td>
        </tr>
        <tr>
          <td><b>Company</b></td>
          <td>${companyName}</td>
        </tr>
        <tr>
          <td><b>Location</b></td>
          <td>${location || '—'}</td>
        </tr>
        <tr>
          <td><b>Compensation (CTC)</b></td>
          <td>${salaryText}${expectedCtc ? ` (Expected: ${expectedCtc})` : ''}</td>
        </tr>
        <tr>
          <td><b>Notice Period</b></td>
          <td>${noticePeriodText}</td>
        </tr>
        <tr>
          <td><b>Work Mode</b></td>
          <td>${workModeText}</td>
        </tr>
      </table>
    </div>

    <div class="section">
      <p>
        By accepting this offer, you agree to comply with company policies, code of conduct, and applicable employment terms.
        This offer letter is valid for the duration communicated by the recruitment team.
      </p>
    </div>

    <div class="footer">
      <div>
        <p class="muted" style="font-size:13px;margin:0;">Sincerely,</p>
        <div class="sign-line"></div>
        <div class="sign-name">Recruitment Team</div>
      </div>
      <div style="text-align:right;">
        <p class="muted" style="font-size:13px;margin:0;">Contact</p>
        <p style="margin:8px 0 0 0; font-size:13px;">HR / Talent Acquisition</p>
        <p style="margin:4px 0 0 0; font-size:13px;">(Please update contact details in template if needed)</p>
      </div>
    </div>
  </body>
</html>`;
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  get initials(): string {
    const f = this.profile?.firstName?.charAt(0) || '';
    const l = this.profile?.lastName?.charAt(0) || '';
    return (f + l).toUpperCase() || '?';
  }

  get fullName(): string {
    return `${this.profile?.firstName || ''} ${this.profile?.lastName || ''}`.trim() || 'Unknown Candidate';
  }

  get hasResume(): boolean {
    return !!this.profile?.resume?.fileName;
  }

  formatFileSize(bytes: number): string {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  formatNoticePeriod(days: number | null): string {
    if (days == null) return 'Not specified';
    if (days === 0) return 'Immediate joiner';
    if (days < 30) return `${days} days`;
    const months = Math.round(days / 30);
    return `${months} month${months > 1 ? 's' : ''}`;
  }

  formatSalary(amount: number | null): string {
    if (!amount) return 'Not disclosed';
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString()}`;
  }

  getSocialIcon(platform: string): string {
    const icons: Record<string, string> = {
      LinkedIn: '🔗', GitHub: '⌨', Twitter: '🐦',
      Portfolio: '🌐', Behance: '🎨', Dribbble: '🏀', Other: '🔗'
    };
    return icons[platform] || '🔗';
  }
}
