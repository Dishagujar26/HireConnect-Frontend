import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { LayoutComponent } from './layout';
import { AuthStorageService } from '../../core/services/auth-storage.service';
import { NotificationService } from '../../core/services/notification.service';
import { ToastService } from '../../core/services/toast.service';
import { ActivatedRoute, Router } from '@angular/router';

const mockAuthStorage = {
  getUserRole: vi.fn().mockReturnValue('CANDIDATE'),
  getUserEmail: vi.fn().mockReturnValue('user@hc.com'),
  clearSession: vi.fn()
};

const mockNotificationService = {
  getUnreadCount: vi.fn().mockReturnValue(of(3)),
  getNotifications: vi.fn().mockReturnValue(of({ content: [] })),
  markAsRead: vi.fn().mockReturnValue(of({}))
};

const mockToastService = { show: vi.fn() };
const mockRouter = { navigate: vi.fn().mockResolvedValue(true) };

describe('LayoutComponent', () => {
  let component: LayoutComponent;
  let fixture: ComponentFixture<LayoutComponent>;
  let router: Router;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockNotificationService.getUnreadCount.mockReturnValue(of(3));
    mockNotificationService.getNotifications.mockReturnValue(of({ content: [] }));

    await TestBed.configureTestingModule({
      imports: [LayoutComponent],
      providers: [
        provideRouter([]),
        { provide: AuthStorageService, useValue: mockAuthStorage },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: ToastService, useValue: mockToastService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LayoutComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create the layout component', () => {
    expect(component).toBeTruthy();
  });

  it('should load user role from auth storage on init', () => {
    expect(component.userRole).toBe('CANDIDATE');
  });

  it('should load user email from auth storage on init', () => {
    expect(component.userEmail).toBe('user@hc.com');
  });

  it('should compute userInitial from email', () => {
    expect(component.userInitial).toBe('U');
  });

  it('should return candidate homeRoute for CANDIDATE role', () => {
    component.userRole = 'CANDIDATE';
    expect(component.homeRoute).toBe('/candidate/dashboard');
  });

  it('should return recruiter homeRoute for RECRUITER role', () => {
    component.userRole = 'RECRUITER';
    expect(component.homeRoute).toBe('/recruiter/dashboard');
  });

  it('should set unreadCount from notification service', () => {
    expect(component.unreadCount).toBe(3);
  });

  it('should toggle notification panel open', () => {
    component.isNotificationPanelOpen = false;
    component.toggleNotifications();
    expect(component.isNotificationPanelOpen).toBe(true);
  });

  it('should toggle notification panel closed', () => {
    component.isNotificationPanelOpen = true;
    component.toggleNotifications();
    expect(component.isNotificationPanelOpen).toBe(false);
  });

  it('should close notification panel', () => {
    component.isNotificationPanelOpen = true;
    component.closeNotifications();
    expect(component.isNotificationPanelOpen).toBe(false);
  });

  it('should mark a notification as read', () => {
    const notification: any = { id: 1, isRead: false };
    component.markAsRead(notification);
    expect(mockNotificationService.markAsRead).toHaveBeenCalledWith(1);
  });

  it('should not call markAsRead if notification already read', () => {
    const notification: any = { id: 2, isRead: true };
    component.markAsRead(notification);
    expect(mockNotificationService.markAsRead).not.toHaveBeenCalled();
  });

  it('should clear session and show toast on logout', () => {
    component.logout();
    expect(mockAuthStorage.clearSession).toHaveBeenCalled();
    expect(mockToastService.show).toHaveBeenCalledWith('Logout successfully', 'success');
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
