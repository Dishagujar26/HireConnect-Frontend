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
    notes: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private interviewService: InterviewService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.applicationId = Number(this.route.snapshot.paramMap.get('applicationId'));
    this.formData.applicationId = this.applicationId;
    this.formData.title = 'Interview Round';
  }

  onSubmit(form: NgForm): void {
    this.errorMessage = '';

    if (form.invalid) {
      // [Disha Gujar] : Form validation fallback logic
      this.toastService.show('Please fill all required fields correctly','error');
      return;
    }

    if (!this.formData.scheduledAt) {
      // [Disha Gujar] : Date selection validation fallback logic
      this.toastService.show('Please choose interview date and time','error');
      return;
    }

    this.isLoading = true;

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