import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApplicationService } from '../../../core/services/application.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-recruiter-applications',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './applications.html',
  styleUrl: './applications.css'
})
export class RecruiterApplicationsComponent implements OnInit {

  applications: any[] = [];
  isLoading = false;

  constructor(
    private applicationService: ApplicationService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadApplications();
  }

  loadApplications(): void {
    this.isLoading = true;

    this.applicationService.getRecruiterApplications().subscribe({
      next: (res) => {
        this.applications = res;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.toast.show('Failed to load applications', 'error');
      }
    });
  }

  get total(): number {
    return this.applications.length;
  }

  get shortlisted(): number {
    return this.applications.filter(a => a.status === 'SHORTLISTED').length;
  }

  get rejected(): number {
    return this.applications.filter(a => a.status === 'REJECTED').length;
  }

  get pending(): number {
    return this.applications.filter(a => a.status === 'APPLIED').length;
  }
}