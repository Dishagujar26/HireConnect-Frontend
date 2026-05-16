import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  InterviewRequest,
  InterviewService
} from '../../../../core/services/interview.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-schedule-interview',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './schedule-interview.html',
  styleUrl: './schedule-interview.css'
})
export class ScheduleInterviewComponent implements OnInit {
  applicationId!: number;
  interviewId?: number;
  isEditMode = false;
  isLoading = false;
  errorMessage = '';

  interviewTypes = ['ONLINE', 'OFFLINE', 'PHONE'];

  formData: InterviewRequest = {
    applicationId: 0,
    title: '',
    interviewType: 'ONLINE',
    scheduledAt: '',
    durationMinutes: 30,
    modeDetails: '',
    meetingLink: '',
    notes: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private interviewService: InterviewService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('interviewId');
    const appParam = this.route.snapshot.paramMap.get('applicationId');

    if (idParam) {
      this.isEditMode = true;
      this.interviewId = Number(idParam);
      this.loadInterviewDetails();
    } else if (appParam) {
      this.applicationId = Number(appParam);
      this.formData.applicationId = this.applicationId;
      this.formData.title = 'Interview Round';
    }
  }

  loadInterviewDetails(): void {
    if (!this.interviewId) return;
    this.isLoading = true;
    this.interviewService.getInterviewDetails(this.interviewId).subscribe({
      next: (data) => {
        this.isLoading = false;
        this.applicationId = data.applicationId;
        // Map response to request format
        this.formData = {
          applicationId: data.applicationId,
          title: data.title || 'Interview Round',
          interviewType: data.interviewType,
          scheduledAt: data.scheduledAt ? data.scheduledAt.substring(0, 16) : '', // Format for datetime-local
          durationMinutes: data.durationMinutes,
          modeDetails: data.modeDetails || '',
          meetingLink: data.meetingLink || '',
          notes: data.notes || ''
        };
      },
      error: () => {
        this.isLoading = false;
        this.toastService.show('Failed to load interview details', 'error');
        this.router.navigate(['/recruiter/interviews']);
      }
    });
  }

  onSubmit(form: NgForm): void {
    this.errorMessage = '';

    if (form.invalid) {
      this.toastService.show('Please fill all required fields correctly', 'error');
      return;
    }

    this.isLoading = true;

    if (this.isEditMode && this.interviewId) {
      this.interviewService.updateInterview(this.interviewId, this.formData).subscribe({
        next: () => {
          this.isLoading = false;
          this.toastService.show('Interview updated successfully', 'success');
          this.router.navigate(['/recruiter/interviews']);
        },
        error: (error) => {
          this.errorMessage = error?.error?.message || 'Failed to update interview';
          this.isLoading = false;
          this.toastService.show(this.errorMessage, 'error');
        }
      });
    } else {
      this.interviewService.scheduleInterview(this.formData).subscribe({
        next: () => {
          this.isLoading = false;
          this.toastService.show('Interview scheduled successfully', 'success');
          this.router.navigate(['/recruiter/interviews']);
        },
        error: (error) => {
          this.errorMessage = error?.error?.message || 'Failed to schedule interview';
          this.isLoading = false;
          this.toastService.show(this.errorMessage, 'error');
        }
      });
    }
  }
}