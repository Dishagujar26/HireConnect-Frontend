import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthStorageService } from '../../core/services/auth-storage.service';
import {
  NotificationResponse,
  NotificationService
} from '../../core/services/notification.service';

import { ToastService } from '../../core/services/toast.service';


@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class LayoutComponent implements OnInit {
  userRole = '';
  userEmail = '';
  isNotificationPanelOpen = false;

  notifications: NotificationResponse[] = [];
  unreadCount = 0;

  constructor(
    private authStorage: AuthStorageService,
    private router: Router,
    private toastService: ToastService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.userRole = this.authStorage.getUserRole() || '';
    this.userEmail = this.authStorage.getUserEmail() || '';

    this.loadNotifications();
  }

  get userInitial(): string {
    return this.userEmail?.charAt(0).toUpperCase() || 'U';
  }

  get homeRoute(): string {
    return this.userRole === 'RECRUITER'
      ? '/recruiter/dashboard'
      : '/candidate/dashboard';
  }

  loadNotifications(): void {
    this.notificationService.getUnreadCount().subscribe({
      next: (count) => {
        this.unreadCount = count;
      },
      error: () => {
        this.unreadCount = 0;
      }
    });

    this.notificationService.getNotifications(0, 5).subscribe({
      next: (response) => {
        this.notifications = response.content || [];
      },
      error: () => {
        this.notifications = [];
      }
    });
  }

  toggleNotifications(): void {
    this.isNotificationPanelOpen = !this.isNotificationPanelOpen;

    if (this.isNotificationPanelOpen) {
      this.loadNotifications();
    }
  }

  closeNotifications(): void {
    this.isNotificationPanelOpen = false;
  }

  markAsRead(notification: NotificationResponse): void {
    if (notification.isRead) {
      return;
    }

    this.notificationService.markAsRead(notification.id).subscribe({
      next: () => {
        notification.isRead = true;
        this.unreadCount = Math.max(this.unreadCount - 1, 0);
      }
    });
  }

  logout(): void {
    this.authStorage.clearSession();
    this.router.navigate(['/login']);
    this.toastService.show('Logout successfully', 'success');

  }
}