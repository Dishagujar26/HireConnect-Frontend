import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { vi } from 'vitest';

import { publicGuard } from './public.guard';
import { AuthService } from '../services/auth.service';
import { AuthStorageService } from '../services/auth-storage.service';

// ─── Mock Factories ────────────────────────────────────────────────────────────
const mockRouter = {
  navigate: vi.fn(),
  createUrlTree: vi.fn((commands: any[]) => ({ commands }))
};
const mockAuthService = { validateToken: vi.fn() };
const mockAuthStorage = { getAccessToken: vi.fn(), clearSession: vi.fn() };

function runGuard() {
  return TestBed.runInInjectionContext(() => publicGuard({} as any, {} as any));
}

// ─── Test Suite ────────────────────────────────────────────────────────────────
describe('publicGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: AuthService, useValue: mockAuthService },
        { provide: AuthStorageService, useValue: mockAuthStorage }
      ]
    });
  });

  describe('when no token in storage', () => {
    it('should allow access to public route (return true)', async () => {
      mockAuthStorage.getAccessToken.mockReturnValue(null);
      const result = await firstValueFrom(runGuard() as any);
      expect(result).toBe(true);
    });
  });

  describe('when token exists and role is CANDIDATE', () => {
    it('should redirect to /candidate/dashboard', async () => {
      mockAuthStorage.getAccessToken.mockReturnValue('valid-token');
      mockAuthService.validateToken.mockReturnValue(of({ valid: true, role: 'CANDIDATE' }));
      await firstValueFrom(runGuard() as any);
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/candidate/dashboard']);
    });
  });

  describe('when token exists and role is RECRUITER', () => {
    it('should redirect to /recruiter/dashboard', async () => {
      mockAuthStorage.getAccessToken.mockReturnValue('valid-token');
      mockAuthService.validateToken.mockReturnValue(of({ valid: true, role: 'RECRUITER' }));
      await firstValueFrom(runGuard() as any);
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/recruiter/dashboard']);
    });
  });

  describe('when token is valid but role is unknown', () => {
    it('should redirect to /login', async () => {
      mockAuthStorage.getAccessToken.mockReturnValue('token');
      mockAuthService.validateToken.mockReturnValue(of({ valid: true, role: 'ADMIN' }));
      await firstValueFrom(runGuard() as any);
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('when token exists but is invalid', () => {
    it('should clear session and allow access (return true)', async () => {
      mockAuthStorage.getAccessToken.mockReturnValue('expired');
      mockAuthService.validateToken.mockReturnValue(of({ valid: false }));
      const result = await firstValueFrom(runGuard() as any);
      expect(mockAuthStorage.clearSession).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe('when validateToken throws an error', () => {
    it('should clear session and allow access (return true)', async () => {
      mockAuthStorage.getAccessToken.mockReturnValue('bad-token');
      mockAuthService.validateToken.mockReturnValue(throwError(() => new Error('Timeout')));
      const result = await firstValueFrom(runGuard() as any);
      expect(mockAuthStorage.clearSession).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });
});
