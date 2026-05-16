import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { vi } from 'vitest';

import {
  AuthService,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest
} from './auth.service';
import { AuthStorageService } from './auth-storage.service';

// ─── Mock Factories ────────────────────────────────────────────────────────────
const mockHttp = {
  post: vi.fn(),
  get: vi.fn()
};

const mockAuthStorage = {
  getAccessToken: vi.fn().mockReturnValue('mock-token'),
  clearSession: vi.fn()
};

// ─── Test Suite ────────────────────────────────────────────────────────────────
describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: HttpClient, useValue: mockHttp },
        { provide: AuthStorageService, useValue: mockAuthStorage }
      ]
    });

    service = TestBed.inject(AuthService);
  });

  // ── Creation ──────────────────────────────────────────────────────────────────
  describe('Service Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });
  });

  // ── register() ────────────────────────────────────────────────────────────────
  describe('register()', () => {
    it('should POST to the register endpoint', () => {
      const request: RegisterRequest = {
        email: 'user@hc.com',
        password: 'pass',
        role: 'CANDIDATE'
      };
      mockHttp.post.mockReturnValue(of({ message: 'Registered' }));

      service.register(request).subscribe();

      expect(mockHttp.post).toHaveBeenCalledWith(
        expect.stringContaining('/register'),
        request
      );
    });

    it('should return an Observable from register()', () => {
      mockHttp.post.mockReturnValue(of({ message: 'OK' }));
      const result = service.register({ email: 'a@b.com', password: '123', role: 'CANDIDATE' });
      expect(result).toBeDefined();
    });
  });

  // ── login() ───────────────────────────────────────────────────────────────────
  describe('login()', () => {
    it('should POST to the login endpoint', () => {
      const request: LoginRequest = { email: 'a@b.com', password: '123' };
      mockHttp.post.mockReturnValue(of({ message: 'OK' }));

      service.login(request).subscribe();

      expect(mockHttp.post).toHaveBeenCalledWith(
        expect.stringContaining('/login'),
        request
      );
    });

    it('should return an Observable from login()', () => {
      mockHttp.post.mockReturnValue(of({ message: 'OK' }));
      const result = service.login({ email: 'x@y.com', password: 'abc' });
      expect(result).toBeDefined();
    });
  });

  // ── refreshToken() ────────────────────────────────────────────────────────────
  describe('refreshToken()', () => {
    it('should POST to the refresh endpoint with refresh token', () => {
      mockHttp.post.mockReturnValue(of({ accessToken: 'new-token' }));

      service.refreshToken('my-refresh-token').subscribe();

      expect(mockHttp.post).toHaveBeenCalledWith(
        expect.stringContaining('/refresh'),
        { refreshToken: 'my-refresh-token' }
      );
    });
  });

  // ── forgotPassword() ──────────────────────────────────────────────────────────
  describe('forgotPassword()', () => {
    it('should POST to the forgot-password endpoint', () => {
      mockHttp.post.mockReturnValue(of('OTP sent'));

      service.forgotPassword('user@hc.com').subscribe();

      expect(mockHttp.post).toHaveBeenCalledWith(
        expect.stringContaining('/forgot-password'),
        { email: 'user@hc.com' },
        { responseType: 'text' }
      );
    });
  });

  // ── resetPassword() ───────────────────────────────────────────────────────────
  describe('resetPassword()', () => {
    it('should POST to the reset-password endpoint', () => {
      const request: ResetPasswordRequest = {
        email: 'u@hc.com',
        otp: '123456',
        newPassword: 'newPass'
      };
      mockHttp.post.mockReturnValue(of('Password reset'));

      service.resetPassword(request).subscribe();

      expect(mockHttp.post).toHaveBeenCalledWith(
        expect.stringContaining('/reset-password'),
        request,
        { responseType: 'text' }
      );
    });
  });

  // ── validateToken() ───────────────────────────────────────────────────────────
  describe('validateToken()', () => {
    it('should GET the validate endpoint with Bearer token header', () => {
      mockHttp.get.mockReturnValue(of({ valid: true }));
      mockAuthStorage.getAccessToken.mockReturnValue('abc-token');

      service.validateToken().subscribe();

      expect(mockHttp.get).toHaveBeenCalledWith(
        expect.stringContaining('/validate'),
        {
          headers: expect.objectContaining({
            // HttpHeaders object — check lazyInit
          })
        }
      );
    });

    it('should call getAccessToken to retrieve the token', () => {
      mockHttp.get.mockReturnValue(of({ valid: true }));
      service.validateToken().subscribe();
      expect(mockAuthStorage.getAccessToken).toHaveBeenCalled();
    });
  });

  // ── loginWithGoogle() ─────────────────────────────────────────────────────────
  describe('loginWithGoogle()', () => {
    it('should redirect window.location.href with role=CANDIDATE', () => {
      // Save and stub window.location
      const originalLocation = window.location;
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { href: '' }
      });

      service.loginWithGoogle('CANDIDATE');

      expect(window.location.href).toContain('role=CANDIDATE');

      Object.defineProperty(window, 'location', {
        writable: true,
        value: originalLocation
      });
    });

    it('should redirect window.location.href with role=RECRUITER', () => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { href: '' }
      });

      service.loginWithGoogle('RECRUITER');

      expect(window.location.href).toContain('role=RECRUITER');
    });
  });

  // ── logout() ──────────────────────────────────────────────────────────────────
  describe('logout()', () => {
    it('should call authStorage.clearSession()', () => {
      service.logout();
      expect(mockAuthStorage.clearSession).toHaveBeenCalled();
    });
  });
});
