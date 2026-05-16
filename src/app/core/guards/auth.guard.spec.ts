import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { vi } from 'vitest';

import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { AuthStorageService } from '../services/auth-storage.service';

// ─── Mock Factories ────────────────────────────────────────────────────────────
const mockRouter = { navigate: vi.fn() };
const mockAuthService = { validateToken: vi.fn() };
const mockAuthStorage = { getAccessToken: vi.fn() };

function runGuard() {
  return TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
}

// ─── Test Suite ────────────────────────────────────────────────────────────────
describe('authGuard', () => {
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
    it('should redirect to /login and return false', async () => {
      mockAuthStorage.getAccessToken.mockReturnValue(null);
      const result = await firstValueFrom(runGuard() as any);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
      expect(result).toBe(false);
    });
  });

  describe('when token exists and is valid', () => {
    it('should allow navigation (return true)', async () => {
      mockAuthStorage.getAccessToken.mockReturnValue('valid-token');
      mockAuthService.validateToken.mockReturnValue(of({ valid: true }));
      const result = await firstValueFrom(runGuard() as any);
      expect(result).toBe(true);
    });
  });

  describe('when token exists but is invalid', () => {
    it('should redirect to /login and return false', async () => {
      mockAuthStorage.getAccessToken.mockReturnValue('expired-token');
      mockAuthService.validateToken.mockReturnValue(of({ valid: false }));
      const result = await firstValueFrom(runGuard() as any);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
      expect(result).toBe(false);
    });
  });

  describe('when validateToken throws an error', () => {
    it('should redirect to /login and return false', async () => {
      mockAuthStorage.getAccessToken.mockReturnValue('some-token');
      mockAuthService.validateToken.mockReturnValue(throwError(() => new Error('Network error')));
      const result = await firstValueFrom(runGuard() as any);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
      expect(result).toBe(false);
    });
  });
});
