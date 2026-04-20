import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { InterviewResponse, InterviewService } from '../../../../core/services/interview.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmModalService } from '../../../../core/services/confirm-modal.service';

@Component({
  selector: 'app-recruiter-interviews',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recruiter-interviews.html',
  styleUrl: './recruiter-interviews.css'
})
export class RecruiterInterviewsComponent implements OnInit {
  interviews: InterviewResponse[] = [];
  isLoading = false;
  cancellingInterviewIds = new Set<number>();

  constructor(
    private interviewService: InterviewService,
    private toastService: ToastService,
    private confirmModal: ConfirmModalService
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
        },
        error: () => {
          this.toastService.show('Failed to load interviews', 'error');
        }
      });
  }

  async cancelInterview(interviewId: number): Promise<void> {
    if (this.cancellingInterviewIds.has(interviewId)) {
      return;
    }

    const confirmed = await this.confirmModal.open({
      title: 'Cancel Interview',
      message: 'Are you sure you want to cancel this interview?',
      confirmText: 'Cancel Interview',
      cancelText: 'Keep',
      variant: 'danger'
    });

    if (!confirmed) {
      return;
    }

    this.cancellingInterviewIds.add(interviewId);

    this.interviewService.cancelInterview(interviewId)
      .pipe(finalize(() => this.cancellingInterviewIds.delete(interviewId)))
      .subscribe({
        next: () => {
          this.interviews = this.interviews.map(interview =>
            interview.id === interviewId
              ? { ...interview, status: 'CANCELLED' }
              : interview
          );

          this.interviews = [...this.interviews];

          this.toastService.show('Interview cancelled successfully', 'success');

          setTimeout(() => {
            this.loadInterviews();
          }, 300);
        },
        error: (error) => {
          const message = error?.error?.message || 'Failed to cancel interview';
          this.toastService.show(message, 'error');
        }
      });
  }

  get totalCount(): number {
    return this.interviews.length;
  }

  get scheduledCount(): number {
    return this.interviews.filter(interview => interview.status === 'SCHEDULED').length;
  }

  get cancelledCount(): number {
    return this.interviews.filter(interview => interview.status === 'CANCELLED').length;
  }

  get completedCount(): number {
    return this.interviews.filter(interview => interview.status === 'COMPLETED').length;
  }

  formatType(type: string): string {
    return type.replace('_', ' ');
  }

  isCancelling(interviewId: number): boolean {
    return this.cancellingInterviewIds.has(interviewId);
  }
}