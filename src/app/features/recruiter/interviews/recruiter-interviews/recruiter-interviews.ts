import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { InterviewResponse, InterviewService } from '../../../../core/services/interview.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmModalService } from '../../../../core/services/confirm-modal.service';
import { ProfileService } from '../../../../core/services/profile.service';
import { InterviewFeedbackModalComponent } from '../interview-feedback-modal/interview-feedback-modal';

@Component({
  selector: 'app-recruiter-interviews',
  standalone: true,
  imports: [CommonModule, RouterLink, InterviewFeedbackModalComponent],
  templateUrl: './recruiter-interviews.html',
  styleUrl: './recruiter-interviews.css'
})
export class RecruiterInterviewsComponent implements OnInit {
  interviews: InterviewResponse[] = [];
  activeInterviews: InterviewResponse[] = [];
  completedInterviews: InterviewResponse[] = [];

  // Map of candidateId -> display name
  candidateNames: Map<number, string> = new Map();

  isLoading = false;
  cancellingInterviewIds = new Set<number>();

  selectedInterview: InterviewResponse | null = null;
  showFeedbackModal = false;

  constructor(
    private interviewService: InterviewService,
    private toastService: ToastService,
    private confirmModal: ConfirmModalService,
    private profileService: ProfileService
  ) {}

  ngOnInit(): void {
    this.loadInterviews();
  }

  loadInterviews(): void {
    this.isLoading = true;
    this.interviewService.getRecruiterInterviews()
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response) => {
          this.interviews = response;
          this.categorizeInterviews();
          this.loadCandidateNames();
        },
        error: () => {
          this.toastService.show('Failed to load interviews', 'error');
        }
      });
  }

  /** Load real candidate names for all unique candidateId+jobId pairs */
  private loadCandidateNames(): void {
    const seen = new Set<number>();
    this.interviews.forEach(iv => {
      if (!iv.candidateId || seen.has(iv.candidateId)) return;
      if (!iv.jobId) return;
      seen.add(iv.candidateId);
      this.profileService.getCandidateFullProfile(iv.candidateId, iv.jobId).subscribe({
        next: (profile) => {
          const name = [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim();
          if (name) this.candidateNames.set(iv.candidateId!, name);
        },
        error: () => {
          // Silently fail - fallback label will display
        }
      });
    });
  }

  /** Returns the display name for a candidate, falling back gracefully */
  getCandidateName(candidateId?: number): string {
    if (!candidateId) return 'Candidate';
    return this.candidateNames.get(candidateId) || `Candidate #${candidateId}`;
  }

  private categorizeInterviews(): void {
    if (!this.interviews || !Array.isArray(this.interviews)) return;

    this.activeInterviews = [];
    this.completedInterviews = [];

    this.interviews.forEach(interview => {
      if (!interview?.status) return;
      if (interview.status === 'CANCELLED') return;
      if (interview.status === 'COMPLETED') {
        this.completedInterviews.push(interview);
      } else {
        this.activeInterviews.push(interview);
      }
    });

    this.activeInterviews.sort((a, b) =>
      (a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0) -
      (b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0)
    );
    this.completedInterviews.sort((a, b) =>
      (b.updatedAt ? new Date(b.updatedAt).getTime() : 0) -
      (a.updatedAt ? new Date(a.updatedAt).getTime() : 0)
    );
  }

  async cancelInterview(interviewId: number): Promise<void> {
    if (this.cancellingInterviewIds.has(interviewId)) return;

    const confirmed = await this.confirmModal.open({
      title: 'Cancel Interview',
      message: 'Are you sure you want to cancel this interview?',
      confirmText: 'Cancel Interview',
      cancelText: 'Keep',
      variant: 'danger'
    });

    if (!confirmed) return;

    this.cancellingInterviewIds.add(interviewId);
    this.interviewService.cancelInterview(interviewId)
      .pipe(finalize(() => this.cancellingInterviewIds.delete(interviewId)))
      .subscribe({
        next: () => {
          this.toastService.show('Interview cancelled successfully', 'success');
          setTimeout(() => this.loadInterviews(), 300);
        },
        error: (error) => {
          const message = error?.error?.message || 'Failed to cancel interview';
          this.toastService.show(message, 'error');
        }
      });
  }

  openCompleteModal(interview: InterviewResponse): void {
    this.selectedInterview = interview;
    this.showFeedbackModal = true;
  }

  onInterviewCompleted(): void {
    this.showFeedbackModal = false;
    this.selectedInterview = null;
    this.loadInterviews();
  }

  /** 
   * Deliberate link-setting for interviews that were scheduled without a link.
   * Shown ONLY for in-person / offline interviews where no link was provided.
   */
  async setMeetingLink(interview: InterviewResponse): Promise<void> {
    const newLink = prompt('Add a meeting link (Zoom / Google Meet / Teams):', '');
    if (!newLink?.trim()) return;

    this.interviewService.updateInterview(interview.id, { meetingLink: newLink.trim() }).subscribe({
      next: (updated) => {
        interview.meetingLink = updated.meetingLink;
        this.toastService.show('Meeting link added successfully', 'success');
      },
      error: () => {
        this.toastService.show('Failed to add meeting link', 'error');
      }
    });
  }

  isVirtual(interview: InterviewResponse): boolean {
    return !!(interview.meetingLink);
  }

  isCancelling(interviewId: number): boolean {
    return this.cancellingInterviewIds.has(interviewId);
  }

  formatType(type: string): string {
    return type?.replace(/_/g, ' ') || '';
  }

  getSelectedCandidateName(): string {
    return this.selectedInterview
      ? this.getCandidateName(this.selectedInterview.candidateId)
      : 'Candidate';
  }
}