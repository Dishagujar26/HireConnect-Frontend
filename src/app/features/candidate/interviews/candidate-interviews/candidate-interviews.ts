import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InterviewResponse, InterviewService } from '../../../../core/services/interview.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-candidate-interviews',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './candidate-interviews.html',
  styleUrl: './candidate-interviews.css'
})
export class CandidateInterviewsComponent implements OnInit {
  interviews: InterviewResponse[] = [];
  visibleInterviews: InterviewResponse[] = [];
  isLoading = false;

  constructor(
    public interviewService: InterviewService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadInterviews();
  }

  loadInterviews(): void {
    this.isLoading = true;

    this.interviewService.getCandidateInterviews().subscribe({
      next: (response) => {
        this.interviews = response || [];
        this.visibleInterviews = this.interviews.filter(
          interview => interview.status === 'SCHEDULED' || interview.status === 'CANCELLED'
        );
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.toastService.show('Failed to load interviews', 'error');
      }
    });
  }

  get totalCount(): number {
    return this.visibleInterviews.length;
  }

  get scheduledCount(): number {
    return this.visibleInterviews.filter(interview => interview.status === 'SCHEDULED').length;
  }

  get cancelledCount(): number {
    return this.visibleInterviews.filter(interview => interview.status === 'CANCELLED').length;
  }

  get onlineCount(): number {
    return this.visibleInterviews.filter(interview => interview.interviewType === 'ONLINE').length;
  }

  formatType(type: string): string {
    return this.interviewService.formatInterviewType(type);
  }

  getInterviewTitle(interview: InterviewResponse): string {
    return interview.title || 'Interview';
  }

  getSubtitle(interview: InterviewResponse): string {
    if (interview.jobId) {
      return `For Job #${interview.jobId}`;
    }

    return `Application #${interview.applicationId}`;
  }

  getModeText(interview: InterviewResponse): string {
    if (interview.interviewType === 'ONLINE' && interview.meetingLink) {
      return interview.meetingLink;
    }

    if (interview.interviewType === 'OFFLINE' && interview.location) {
      return interview.location;
    }

    if (interview.modeDetails) {
      return interview.modeDetails;
    }

    return '';
  }
}