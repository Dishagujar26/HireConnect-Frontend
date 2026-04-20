import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { JobRequest, JobService } from '../../../../core/services/job.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-create-job',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './create-job.html',
  styleUrl: './create-job.css'
})
export class CreateJobComponent {
  isLoading = false;
  errorMessage = '';

  jobTypes = ['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT'];
  experienceLevels = ['FRESHER', 'JUNIOR', 'MID', 'SENIOR'];
  jobStatuses = ['OPEN', 'CLOSED'];

  job: JobRequest = {
    title: '',
    description: '',
    companyName: '',
    location: '',
    jobType: 'FULL_TIME',
    experienceLevel: 'JUNIOR',
    salaryMin: 0,
    salaryMax: 0,
    skillsRequired: '',
    status: 'OPEN'
  };

  constructor(
    private jobService: JobService,
    private router: Router,
    private toastService: ToastService
  ) {}

  onSubmit(form: NgForm): void {
    this.errorMessage = '';

    if (form.invalid) {
      this.errorMessage = 'Please fill all required fields correctly';
      return;
    }

    if (this.job.salaryMin > this.job.salaryMax) {
      this.errorMessage = 'Minimum salary cannot be greater than maximum salary';
      return;
    }

    this.isLoading = true;

    this.jobService.createJob(this.job).subscribe({
      next: () => {
        this.isLoading = false;
        this.toastService.show('Job created successfully', 'success');
        this.router.navigate(['/recruiter/jobs']);
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Failed to create job';
        this.isLoading = false;
        this.toastService.show(this.errorMessage, 'error');
      }
    });
  }
}