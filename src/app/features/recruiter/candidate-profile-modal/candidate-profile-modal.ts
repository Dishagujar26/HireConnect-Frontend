import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ProfileService } from '../../../core/services/profile.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-candidate-profile-modal',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './candidate-profile-modal.html',
  styleUrl: './candidate-profile-modal.css'
})
export class CandidateProfileModalComponent implements OnInit {
  @Input() candidateId!: number;
  @Input() jobId!: number;
  @Output() closed = new EventEmitter<void>();

  profile: any = null;
  isLoading = false;
  isDownloadingResume = false;
  isViewingResume = false;

  constructor(
    private profileService: ProfileService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadProfile();
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
        this.close();
      }
    });
  }

  close(): void {
    this.closed.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.close();
    }
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
