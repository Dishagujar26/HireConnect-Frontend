import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { LoginComponent } from './login';
import { AuthService } from '../../../core/services/auth.service';
import { AuthStorageService } from '../../../core/services/auth-storage.service';

// ─── Mock Factories ────────────────────────────────────────────────────────────
const mockAuthService = {
  login: vi.fn(),
  loginWithGoogle: vi.fn()
};

const mockAuthStorage = {
  saveSession: vi.fn()
};

const mockRouter = {
  navigate: vi.fn().mockResolvedValue(true)
};

// ─── Test Suite ────────────────────────────────────────────────────────────────
describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let router: Router;

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
        { provide: AuthStorageService, useValue: mockAuthStorage }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));
    fixture.detectChanges();
  });

  // ── Creation ──────────────────────────────────────────────────────────────────
  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with empty email and password', () => {
      expect(component.email).toBe('');
      expect(component.password).toBe('');
    });

    it('should initialize with isLoading as false', () => {
      expect(component.isLoading).toBe(false);
    });

    it('should initialize with showPassword as false', () => {
      expect(component.showPassword).toBe(false);
    });

    it('should initialize with showGoogleRoleSelector as false', () => {
      expect(component.showGoogleRoleSelector).toBe(false);
    });

    it('should initialize with selectedRole as CANDIDATE', () => {
      expect(component.selectedRole).toBe('CANDIDATE');
    });

    it('should initialize with empty messages', () => {
      expect(component.successMessage).toBe('');
      expect(component.errorMessage).toBe('');
    });
  });

  // ── Role Selection ─────────────────────────────────────────────────────────────
  describe('selectRole()', () => {
    it('should set selectedRole to CANDIDATE', () => {
      component.selectRole('RECRUITER');
      component.selectRole('CANDIDATE');
      expect(component.selectedRole).toBe('CANDIDATE');
    });

    it('should set selectedRole to RECRUITER', () => {
      component.selectRole('RECRUITER');
      expect(component.selectedRole).toBe('RECRUITER');
    });
  });

  // ── Login Flow ────────────────────────────────────────────────────────────────
  describe('onLogin()', () => {
    it('should set isLoading to true while login is in progress', () => {
      mockAuthService.login.mockReturnValue(of({
        accessToken: 'token', refreshToken: 'refresh',
        email: 'test@test.com', role: 'CANDIDATE', userId: 1, message: 'OK'
      }));
      component.email = 'test@test.com';
      component.password = 'password';
      component.onLogin();
      // after subscribe completes, isLoading becomes false
      expect(component.isLoading).toBe(false);
    });

    it('should clear previous messages before login', () => {
      component.errorMessage = 'Old error';
      component.successMessage = 'Old success';
      mockAuthService.login.mockReturnValue(of({
        accessToken: 'token', refreshToken: 'refresh',
        email: 'test@test.com', role: 'CANDIDATE', userId: 1, message: 'Success'
      }));
      component.onLogin();
      expect(component.errorMessage).toBe('');
    });

    it('should call authService.login with correct credentials', () => {
      mockAuthService.login.mockReturnValue(of({
        accessToken: 'token', refreshToken: 'refresh',
        email: 'user@hc.com', role: 'CANDIDATE', userId: 2, message: 'Welcome'
      }));
      component.email = 'user@hc.com';
      component.password = 'pass123';
      component.onLogin();
      expect(mockAuthService.login).toHaveBeenCalledWith({
        email: 'user@hc.com',
        password: 'pass123'
      });
    });

    it('should call authStorage.saveSession on successful login', () => {
      const mockResponse = {
        accessToken: 'acc', refreshToken: 'ref',
        email: 'a@b.com', role: 'CANDIDATE', userId: 5, message: 'Login OK'
      };
      mockAuthService.login.mockReturnValue(of(mockResponse));
      component.onLogin();
      expect(mockAuthStorage.saveSession).toHaveBeenCalledWith({
        accessToken: 'acc',
        refreshToken: 'ref',
        email: 'a@b.com',
        role: 'CANDIDATE',
        userId: 5
      });
    });

    it('should navigate to /candidate/dashboard for CANDIDATE role', async () => {
      mockAuthService.login.mockReturnValue(of({
        accessToken: 'token', refreshToken: 'refresh',
        email: 'c@c.com', role: 'CANDIDATE', userId: 3, message: 'OK'
      }));
      component.onLogin();
      expect(router.navigate).toHaveBeenCalledWith(['/candidate/dashboard']);
    });

    it('should navigate to /recruiter/dashboard for RECRUITER role', async () => {
      mockAuthService.login.mockReturnValue(of({
        accessToken: 'token', refreshToken: 'refresh',
        email: 'r@r.com', role: 'RECRUITER', userId: 4, message: 'OK'
      }));
      component.onLogin();
      expect(router.navigate).toHaveBeenCalledWith(['/recruiter/dashboard']);
    });

    it('should set successMessage from response', () => {
      mockAuthService.login.mockReturnValue(of({
        accessToken: 'token', refreshToken: 'refresh',
        email: 'x@x.com', role: 'CANDIDATE', userId: 1, message: 'Login successful!'
      }));
      component.onLogin();
      expect(component.successMessage).toBe('Login successful!');
    });

    it('should set errorMessage on login failure', () => {
      mockAuthService.login.mockReturnValue(
        throwError(() => ({ error: { message: 'Invalid credentials' } }))
      );
      component.onLogin();
      expect(component.errorMessage).toBe('Invalid credentials');
      expect(component.isLoading).toBe(false);
    });

    it('should set default error message when error has no message', () => {
      mockAuthService.login.mockReturnValue(throwError(() => ({})));
      component.onLogin();
      expect(component.errorMessage).toBe('Login failed');
    });
  });

  // ── Google OAuth ──────────────────────────────────────────────────────────────
  describe('Google OAuth Flow', () => {
    it('should open google role selector and clear messages', () => {
      component.errorMessage = 'err';
      component.successMessage = 'ok';
      component.openGoogleRoleSelector();
      expect(component.showGoogleRoleSelector).toBe(true);
      expect(component.errorMessage).toBe('');
      expect(component.successMessage).toBe('');
    });

    it('should cancel google role selector', () => {
      component.showGoogleRoleSelector = true;
      component.cancelGoogleRoleSelector();
      expect(component.showGoogleRoleSelector).toBe(false);
    });

    it('should call loginWithGoogle with selected role', () => {
      component.selectedRole = 'RECRUITER';
      component.continueWithGoogle();
      expect(mockAuthService.loginWithGoogle).toHaveBeenCalledWith('RECRUITER');
    });

    it('should call loginWithGoogle with CANDIDATE by default', () => {
      component.continueWithGoogle();
      expect(mockAuthService.loginWithGoogle).toHaveBeenCalledWith('CANDIDATE');
    });
  });
});
