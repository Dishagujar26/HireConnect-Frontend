import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { AuthStorageService, SessionData } from './auth-storage.service';

// ─── Test Suite ────────────────────────────────────────────────────────────────
describe('AuthStorageService', () => {
  let service: AuthStorageService;

  // Mock localStorage
  const localStorageMock: Record<string, string> = {};

  beforeEach(() => {
    // Reset store
    Object.keys(localStorageMock).forEach(k => delete localStorageMock[k]);

    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => {
      localStorageMock[key] = value;
    });
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
      return localStorageMock[key] ?? null;
    });
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation((key) => {
      delete localStorageMock[key];
    });

    TestBed.configureTestingModule({ providers: [AuthStorageService] });
    service = TestBed.inject(AuthStorageService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── Creation ──────────────────────────────────────────────────────────────────
  describe('Service Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });
  });

  // ── saveSession() ─────────────────────────────────────────────────────────────
  describe('saveSession()', () => {
    const session: SessionData = {
      accessToken: 'acc-token',
      refreshToken: 'ref-token',
      email: 'user@hc.com',
      role: 'CANDIDATE',
      userId: 42
    };

    it('should save accessToken to localStorage', () => {
      service.saveSession(session);
      expect(localStorage.getItem('accessToken')).toBe('acc-token');
    });

    it('should save refreshToken to localStorage', () => {
      service.saveSession(session);
      expect(localStorage.getItem('refreshToken')).toBe('ref-token');
    });

    it('should save userEmail to localStorage', () => {
      service.saveSession(session);
      expect(localStorage.getItem('userEmail')).toBe('user@hc.com');
    });

    it('should save userRole to localStorage', () => {
      service.saveSession(session);
      expect(localStorage.getItem('userRole')).toBe('CANDIDATE');
    });

    it('should save userId as string to localStorage', () => {
      service.saveSession(session);
      expect(localStorage.getItem('userId')).toBe('42');
    });
  });

  // ── Getters ───────────────────────────────────────────────────────────────────
  describe('getAccessToken()', () => {
    it('should return the stored access token', () => {
      localStorageMock['accessToken'] = 'my-token';
      expect(service.getAccessToken()).toBe('my-token');
    });

    it('should return null when no access token is stored', () => {
      expect(service.getAccessToken()).toBeNull();
    });
  });

  describe('getRefreshToken()', () => {
    it('should return the stored refresh token', () => {
      localStorageMock['refreshToken'] = 'my-refresh';
      expect(service.getRefreshToken()).toBe('my-refresh');
    });

    it('should return null when no refresh token is stored', () => {
      expect(service.getRefreshToken()).toBeNull();
    });
  });

  describe('getUserEmail()', () => {
    it('should return the stored user email', () => {
      localStorageMock['userEmail'] = 'test@hc.com';
      expect(service.getUserEmail()).toBe('test@hc.com');
    });

    it('should return null when no email is stored', () => {
      expect(service.getUserEmail()).toBeNull();
    });
  });

  describe('getUserRole()', () => {
    it('should return the stored user role', () => {
      localStorageMock['userRole'] = 'RECRUITER';
      expect(service.getUserRole()).toBe('RECRUITER');
    });

    it('should return null when no role is stored', () => {
      expect(service.getUserRole()).toBeNull();
    });
  });

  describe('getUserId()', () => {
    it('should return the stored user ID as string', () => {
      localStorageMock['userId'] = '99';
      expect(service.getUserId()).toBe('99');
    });

    it('should return null when no userId is stored', () => {
      expect(service.getUserId()).toBeNull();
    });
  });

  // ── Setters ───────────────────────────────────────────────────────────────────
  describe('setAccessToken()', () => {
    it('should update accessToken in localStorage', () => {
      service.setAccessToken('new-access-token');
      expect(localStorage.getItem('accessToken')).toBe('new-access-token');
    });
  });

  describe('setRefreshToken()', () => {
    it('should update refreshToken in localStorage', () => {
      service.setRefreshToken('new-refresh-token');
      expect(localStorage.getItem('refreshToken')).toBe('new-refresh-token');
    });
  });

  // ── clearSession() ────────────────────────────────────────────────────────────
  describe('clearSession()', () => {
    it('should remove all session keys from localStorage', () => {
      localStorageMock['accessToken'] = 'a';
      localStorageMock['refreshToken'] = 'b';
      localStorageMock['userEmail'] = 'c@c.com';
      localStorageMock['userRole'] = 'CANDIDATE';
      localStorageMock['userId'] = '1';

      service.clearSession();

      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
      expect(localStorage.getItem('userEmail')).toBeNull();
      expect(localStorage.getItem('userRole')).toBeNull();
      expect(localStorage.getItem('userId')).toBeNull();
    });
  });

  // ── isLoggedIn() ──────────────────────────────────────────────────────────────
  describe('isLoggedIn()', () => {
    it('should return true when accessToken exists', () => {
      localStorageMock['accessToken'] = 'valid-token';
      expect(service.isLoggedIn()).toBe(true);
    });

    it('should return false when accessToken is absent', () => {
      expect(service.isLoggedIn()).toBe(false);
    });

    it('should return false after clearSession()', () => {
      localStorageMock['accessToken'] = 'some-token';
      service.clearSession();
      expect(service.isLoggedIn()).toBe(false);
    });
  });
});
