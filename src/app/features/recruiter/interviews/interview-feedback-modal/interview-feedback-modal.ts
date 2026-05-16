import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InterviewService } from '../../../../core/services/interview.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-interview-feedback-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './interview-feedback-modal.html',
  styleUrl: './interview-feedback-modal.css'
})
export class InterviewFeedbackModalComponent {
  @Input() interviewId!: number;
  @Input() candidateName: string = 'Candidate';
  @Output() closed = new EventEmitter<void>();
  @Output() completed = new EventEmitter<void>();

  technicalScore: number = 3;
  communicationScore: number = 3;
  feedback: string = '';
  selectionAction: string = 'NO_ACTION';
  isSubmitting = false;

  constructor(
    private interviewService: InterviewService,
    private toastService: ToastService
  ) {}

  close(): void {
    if (!this.isSubmitting) {
      this.closed.emit();
    }
  }

  submit(): void {
    if (!this.feedback.trim()) {
      this.toastService.show('Please provide feedback', 'error');
      return;
    }

    this.isSubmitting = true;
    const request = {
      technicalScore: this.technicalScore,
      communicationScore: this.communicationScore,
      feedback: this.feedback,
      selectionAction: this.selectionAction
    };

    this.interviewService.completeInterview(this.interviewId, request).subscribe({
      next: () => {
        this.toastService.show('Interview completed and feedback saved', 'success');
        this.isSubmitting = false;
        this.completed.emit();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.toastService.show(err?.error?.message || 'Failed to complete interview', 'error');
      }
    });
  }
}
