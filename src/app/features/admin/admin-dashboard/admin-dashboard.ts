import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AdminService, AdminStats, JobStats, FinanceStats } from '../../../core/services/admin.service';
import { AuthStorageService } from '../../../core/services/auth-storage.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboardComponent implements OnInit {
  userStats: AdminStats | null = null;
  jobStats: JobStats | null = null;
  financeStats: FinanceStats | null = null;
  isLoading = true;
  adminEmail = '';

  constructor(
    private adminService: AdminService,
    private authStorage: AuthStorageService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.adminEmail = this.authStorage.getUserEmail() || 'Admin';
    this.loadStats();
  }

  loadStats(): void {
    this.isLoading = true;
    this._doneCount = 0;

    this.adminService.getUserStats().subscribe({
      next: (stats) => { this.userStats = stats; this.checkDone(); },
      error: () => { this.toastService.show('Failed to load user stats.', 'error'); this.checkDone(); }
    });
    
    this.adminService.getJobStats().subscribe({
      next: (stats) => { this.jobStats = stats; this.checkDone(); },
      error: () => { this.toastService.show('Failed to load job stats.', 'error'); this.checkDone(); }
    });

    this.adminService.getFinanceStats().subscribe({
      next: (stats) => { this.financeStats = stats; this.checkDone(); },
      error: () => { this.financeStats = { totalRevenue: 0, successCount: 0 }; this.checkDone(); }
    });
  }

  private _doneCount = 0;
  private checkDone(): void {
    this._doneCount++;
    if (this._doneCount >= 3) this.isLoading = false;
  }
}
