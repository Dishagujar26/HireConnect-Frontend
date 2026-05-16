import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, FinanceStats } from '../../../core/services/admin.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-admin-finance',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-finance.html',
  styleUrl: './admin-finance.css'
})
export class AdminFinanceComponent implements OnInit {
  stats: FinanceStats | null = null;
  transactions: any[] = [];
  isLoading = true;

  constructor(
    private adminService: AdminService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.adminService.getFinanceStats().subscribe({
      next: (stats: FinanceStats) => { this.stats = stats; this.checkDone(); },
      error: () => { this.toastService.show('Failed to load financial stats.', 'error'); this.checkDone(); }
    });

    this.adminService.getAllTransactions().subscribe({
      next: (data: any[]) => { this.transactions = data; this.checkDone(); },
      error: () => { this.toastService.show('Failed to load transactions.', 'error'); this.checkDone(); }
    });
  }

  private _doneCount = 0;
  private checkDone(): void {
    this._doneCount++;
    if (this._doneCount >= 2) this.isLoading = false;
  }

  getStatusClass(status: string): string {
    return status?.toLowerCase() === 'success' ? 'status-badge active' : 'status-badge suspended';
  }
}
