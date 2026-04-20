import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NotificationResponse,
  NotificationService
} from '../../core/services/notification.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmModalService } from '../../core/services/confirm-modal.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css'
})
export class NotificationsComponent implements OnInit {
  notifications: NotificationResponse[] = [];
  isLoading = false;

  get unreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }

  constructor(
    private notificationService: NotificationService,
    private toastService: ToastService,
    private confirmModal: ConfirmModalService
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.isLoading = true;

    this.notificationService.getNotifications(0, 20).subscribe({
      next: (response) => {
        this.notifications = response.content || [];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.toastService.show('Failed to load notifications', 'error');
      }
    });
  }

  markAsRead(notification: NotificationResponse): void {
    if (notification.isRead) {
      return;
    }

    this.notificationService.markAsRead(notification.id).subscribe({
      next: () => {
        notification.isRead = true;
        this.toastService.show('Notification marked as read', 'success');
      },
      error: () => {
        this.toastService.show('Failed to mark notification as read', 'error');
      }
    });
  }

  markAllAsRead(): void {
    const unread = this.notifications.filter(n => !n.isRead);
    unread.forEach(notification => {
      this.notificationService.markAsRead(notification.id).subscribe({
        next: () => { notification.isRead = true; }
      });
    });
    if (unread.length > 0) {
      this.toastService.show('All notifications marked as read', 'success');
    }
  }

  async deleteNotification(notification: NotificationResponse): Promise<void> {
    const confirmed = await this.confirmModal.open({
      title: 'Delete Notification',
      message: 'Are you sure you want to delete this notification?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });

    if (!confirmed) {
      return;
    }

    this.notificationService.deleteNotification(notification.id).subscribe({
      next: () => {
        this.notifications = this.notifications.filter(n => n.id !== notification.id);
        this.toastService.show('Notification deleted successfully', 'success');
      },
      error: () => {
        this.toastService.show('Failed to delete notification', 'error');
      }
    });
  }
}