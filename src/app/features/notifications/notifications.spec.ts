import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { NotificationsComponent } from './notifications';
import { NotificationService } from '../../core/services/notification.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmModalService } from '../../core/services/confirm-modal.service';

import { NotificationResponse } from '../../core/services/notification.service';

const mockNotificationService = {
  getNotifications: vi.fn(),
  markAsRead: vi.fn().mockReturnValue(of({})),
  deleteNotification: vi.fn().mockReturnValue(of({}))
};
const mockToastService = { show: vi.fn() };
const mockConfirmModal = { open: vi.fn().mockResolvedValue(true) };

const mockNotifications: NotificationResponse[] = [
  { id: 1, title: 'Title 1', message: 'App reviewed', isRead: false, type: 'INFO', createdAt: '2024-01-01' },
  { id: 2, title: 'Title 2', message: 'Interview scheduled', isRead: true, type: 'SUCCESS', createdAt: '2024-01-02' }
];

describe('NotificationsComponent', () => {
  let component: NotificationsComponent;
  let fixture: ComponentFixture<NotificationsComponent>;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockNotificationService.getNotifications.mockReturnValue(of({ content: mockNotifications }));
    mockNotificationService.markAsRead.mockReturnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [NotificationsComponent],
      providers: [
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: ToastService, useValue: mockToastService },
        { provide: ConfirmModalService, useValue: mockConfirmModal }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create the notifications component', () => {
    expect(component).toBeTruthy();
  });

  it('should load notifications on init', () => {
    expect(mockNotificationService.getNotifications).toHaveBeenCalled();
  });

  it('should set notifications from API response', () => {
    expect(component.notifications.length).toBe(2);
  });

  it('should compute unreadCount correctly', () => {
    expect(component.unreadCount).toBe(1);
  });

  it('should set isLoading to false after load', () => {
    expect(component.isLoading).toBe(false);
  });

  it('should mark a notification as read', () => {
    const notification = { id: 1, isRead: false } as any;
    component.markAsRead(notification);
    expect(mockNotificationService.markAsRead).toHaveBeenCalledWith(1);
  });

  it('should not call markAsRead if notification already read', () => {
    const notification = { id: 2, isRead: true } as any;
    component.markAsRead(notification);
    expect(mockNotificationService.markAsRead).not.toHaveBeenCalled();
  });

  it('should mark all unread notifications as read', () => {
    component.markAllAsRead();
    expect(mockNotificationService.markAsRead).toHaveBeenCalledTimes(1);
  });

  it('should delete a notification after confirmation', async () => {
    mockConfirmModal.open.mockResolvedValue(true);
    const notification = { id: 1, isRead: false } as any;
    await component.deleteNotification(notification);
    expect(mockNotificationService.deleteNotification).toHaveBeenCalledWith(1);
  });

  it('should NOT delete notification if user cancels', async () => {
    mockConfirmModal.open.mockResolvedValue(false);
    const notification = { id: 1, isRead: false } as any;
    await component.deleteNotification(notification);
    expect(mockNotificationService.deleteNotification).not.toHaveBeenCalled();
  });

  it('should show toast on load error', async () => {
    vi.clearAllMocks();
    mockNotificationService.getNotifications.mockReturnValue(throwError(() => new Error('err')));
    component.loadNotifications();
    await fixture.whenStable();
    expect(mockToastService.show).toHaveBeenCalledWith('Failed to load notifications', 'error');
  });
});
