import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { JobRequest, JobService } from '../../../../core/services/job.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-edit-job',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './edit-job.html',
  styleUrl: './edit-job.css'
})
export class EditJobComponent implements OnInit {
  jobId!: number;
  isLoading = false;
  isFetching = false;
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
    private route: ActivatedRoute,
    private router: Router,
    private jobService: JobService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.jobId = Number(this.route.snapshot.paramMap.get('jobId'));
    this.loadJob();
  }

  loadJob(): void {
    this.isFetching = true;
    this.errorMessage = '';

    this.jobService.getJobById(this.jobId).subscribe({
      next: (response) => {
        this.job = {
          title: response.title,
          description: response.description,
          companyName: response.companyName,
          location: response.location,
          jobType: response.jobType,
          experienceLevel: response.experienceLevel,
          salaryMin: response.salaryMin,
          salaryMax: response.salaryMax,
          skillsRequired: response.skillsRequired,
          status: response.status
        };
        this.isFetching = false;
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Failed to load job details';
        this.isFetching = false;
        this.toastService.show(this.errorMessage, 'error');
      }
    });
  }

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

    this.jobService.updateJob(this.jobId, this.job).subscribe({
      next: () => {
        this.isLoading = false;
        this.toastService.show('Job updated successfully', 'success');
        this.router.navigate(['/recruiter/jobs']);
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Failed to update job';
        this.isLoading = false;
        this.toastService.show(this.errorMessage, 'error');
      }
    });
  }
}