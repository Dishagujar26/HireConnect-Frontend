import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, AdminUser, BroadcastRequest } from '../../../core/services/admin.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-admin-broadcast',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-broadcast.html',
  styleUrl: './admin-broadcast.css'
})
export class AdminBroadcastComponent implements OnInit {
  title = '';
  message = '';
  targetRole: 'ALL' | 'CANDIDATE' | 'RECRUITER' = 'ALL';
  isSending = false;
  lastResult: { recipientCount: number; title: string } | null = null;

  allUsers: AdminUser[] = [];
  isLoadingUsers = true;

  constructor(
    private adminService: AdminService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.adminService.getAllUsers().subscribe({
      next: (users: AdminUser[]) => { this.allUsers = users; this.isLoadingUsers = false; },
      error: () => { this.toastService.show('Could not load users list.', 'error'); this.isLoadingUsers = false; }
    });
  }

  get targetUserIds(): number[] {
    return this.allUsers
      .filter(u => this.targetRole === 'ALL' || u.role === this.targetRole)
      .filter(u => u.active)
      .map(u => u.userId);
  }

  get recipientPreview(): number { return this.targetUserIds.length; }

  send(): void {
    if (!this.title.trim() || !this.message.trim()) {
      this.toastService.show('Title and message are required.', 'error');
      return;
    }
    if (this.targetUserIds.length === 0) {
      this.toastService.show('No users to send to.', 'error');
      return;
    }

    this.isSending = true;
    const req: BroadcastRequest = {
      title: this.title,
      message: this.message,
      userIds: this.targetUserIds
    };

    this.adminService.broadcastMessage(req).subscribe({
      next: (result: any) => {
        this.lastResult = result;
        this.isSending = false;
        this.title = '';
        this.message = '';
        this.toastService.show(`Broadcast sent to ${result.recipientCount} users!`, 'success');
      },
      error: () => {
        this.isSending = false;
        this.toastService.show('Failed to send broadcast.', 'error');
      }
    });
  }
}
