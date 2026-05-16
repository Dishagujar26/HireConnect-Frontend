import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmModalService } from '../../../core/services/confirm-modal.service';

@Component({
  selector: 'app-admin-jobs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-jobs.html',
  styleUrl: './admin-jobs.css'
})
export class AdminJobsComponent implements OnInit {
  jobs: any[] = [];
  isLoading = true;

  constructor(
    private adminService: AdminService,
    private toastService: ToastService,
    private confirmModal: ConfirmModalService
  ) {}

  ngOnInit(): void { this.loadJobs(); }

  loadJobs(): void {
    this.isLoading = true;
    this.adminService.getAllJobs().subscribe({
      next: (jobs) => { this.jobs = jobs; this.isLoading = false; },
      error: () => { this.toastService.show('Failed to load jobs.', 'error'); this.isLoading = false; }
    });
  }

  deleteJob(job: any): void {
    this.confirmModal.open({
      title: 'Delete Job',
      message: `Delete "${job.title}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    }).then((confirmed: boolean) => {
      if (!confirmed) return;
      this.adminService.deleteJob(job.jobId).subscribe({
        next: () => {
          this.jobs = this.jobs.filter(j => j.jobId !== job.jobId);
          this.toastService.show('Job deleted successfully.', 'success');
        },
        error: () => this.toastService.show('Failed to delete job.', 'error')
      });
    });
  }
}
