import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, AdminUser } from '../../../core/services/admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmModalService } from '../../../core/services/confirm-modal.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.css'
})
export class AdminUsersComponent implements OnInit {
  users: AdminUser[] = [];
  isLoading = true;
  filterRole: 'ALL' | 'CANDIDATE' | 'RECRUITER' = 'ALL';

  constructor(
    private adminService: AdminService,
    private toastService: ToastService,
    private confirmModal: ConfirmModalService
  ) {}

  ngOnInit(): void { this.loadUsers(); }

  loadUsers(): void {
    this.isLoading = true;
    this.adminService.getAllUsers().subscribe({
      next: (users) => { this.users = users; this.isLoading = false; },
      error: () => { this.toastService.show('Failed to load users.', 'error'); this.isLoading = false; }
    });
  }

  get filteredUsers(): AdminUser[] {
    if (this.filterRole === 'ALL') return this.users;
    return this.users.filter(u => u.role === this.filterRole);
  }

  setFilter(role: 'ALL' | 'CANDIDATE' | 'RECRUITER'): void { this.filterRole = role; }

  suspendUser(user: AdminUser): void {
    this.confirmModal.open({
      title: 'Suspend User',
      message: `Are you sure you want to suspend ${user.email}? They will not be able to log in.`,
      confirmText: 'Suspend',
      cancelText: 'Cancel',
      variant: 'danger'
    }).then((confirmed: boolean) => {
      if (!confirmed) return;
      this.adminService.suspendUser(user.userId).subscribe({
        next: () => { user.active = false; this.toastService.show('User suspended.', 'success'); },
        error: () => this.toastService.show('Failed to suspend user.', 'error')
      });
    });
  }

  activateUser(user: AdminUser): void {
    this.adminService.activateUser(user.userId).subscribe({
      next: () => { user.active = true; this.toastService.show('User reactivated.', 'success'); },
      error: () => this.toastService.show('Failed to reactivate user.', 'error')
    });
  }
}
